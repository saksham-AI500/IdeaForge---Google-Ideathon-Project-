// ---------------------------------------------------------------------------
// ideaRoutes.js — Idea CRUD, Version Management, Evidence, & Evolution Routes.
// ---------------------------------------------------------------------------
// All endpoints are mounted under /api/ideas and protected by authenticateRequest.
// Strict user data isolation is enforced by using req.user.uid as root doc path.
// ---------------------------------------------------------------------------

const express = require('express');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { callGemini, GeminiError } = require('../services/geminiHelper');
const { validateTextInput } = require('../middleware/validateInput');
const { IDEAFORGE_SYSTEM_INSTRUCTION } = require('../services/systemPrompt');
const { searchTavily, TavilyError } = require('../services/tavilyService');
const { generateSanitizedQuery, synthesizeEvidence } = require('../services/evidenceSynthesizer');
const { evaluateEvidenceGate } = require('../services/evidenceGate');
const { logActivity } = require('../services/activityLogger');
const {
  ideasCollection,
  ideaPath,
  versionsCollection,
  activitiesCollection,
} = require('../models/firestoreModel');

const router = express.Router();
const db = getFirestore();

// ---------------------------------------------------------------------------
// GET /api/ideas
// ---------------------------------------------------------------------------
// List all ideas for the authenticated user, with status filter.
// Query params: status = 'active' (default) | 'archived' | 'all'
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const uid = req.user.uid;
  const statusFilter = (req.query.status || 'active').toLowerCase();

  try {
    let query = db.collection(ideasCollection(uid));

    if (statusFilter === 'active' || statusFilter === 'archived') {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.get();

    const ideas = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled Idea',
        currentContent: data.currentContent || '',
        status: data.status || 'active',
        currentVersionNumber: data.currentVersionNumber || 1,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
      };
    });

    // Sort descending by updatedAt in memory (handles missing indexes gracefully)
    ideas.sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });

    return res.json({ ideas });
  } catch (err) {
    console.error('[IdeaRoute] GET / error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve ideas.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ideas
// ---------------------------------------------------------------------------
// Create a new idea and its initial Version 1 snapshot.
// ---------------------------------------------------------------------------
router.post(
  '/',
  validateTextInput('content', { maxLength: 5000 }),
  async (req, res) => {
    const uid = req.user.uid;
    const { title, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Field "content" is required.' });
    }

    const cleanContent = content.trim();
    const cleanTitle = (title && typeof title === 'string' && title.trim())
      ? title.trim().slice(0, 150)
      : cleanContent.slice(0, 50).trim() + (cleanContent.length > 50 ? '...' : '');

    try {
      const ideaRef = db.collection(ideasCollection(uid)).doc();
      const versionRef = ideaRef.collection('versions').doc();

      const now = FieldValue.serverTimestamp();

      const ideaData = {
        title: cleanTitle,
        currentContent: cleanContent,
        status: 'active',
        currentVersionNumber: 1,
        createdAt: now,
        updatedAt: now,
      };

      const initialVersionData = {
        versionNumber: 1,
        content: cleanContent,
        whatChanged: 'Initial capture',
        whyChanged: 'Starting concept',
        previousVersionId: null,
        changeType: 'initial',
        assumption: null,
        riskLevel: 'UNPROVEN',
        evidenceStatus: 'not_checked',
        createdAt: now,
      };

      // Atomic batch write for idea + version 1
      const batch = db.batch();
      batch.set(ideaRef, ideaData);
      batch.set(versionRef, initialVersionData);
      await batch.commit();

      // Log non-blocking activity event
      await logActivity({
        uid,
        ideaId: ideaRef.id,
        eventType: 'idea_created',
        summary: `Created idea: "${cleanTitle}"`,
        metadata: { versionNumber: 1 },
      });

      return res.status(201).json({
        idea: {
          id: ideaRef.id,
          title: cleanTitle,
          currentContent: cleanContent,
          status: 'active',
          currentVersionNumber: 1,
        },
        versionId: versionRef.id,
      });
    } catch (err) {
      console.error('[IdeaRoute] POST / error:', err.message);
      return res.status(500).json({ error: 'Failed to create idea.' });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/ideas/:ideaId
// ---------------------------------------------------------------------------
// Fetch a single idea by ID.
// ---------------------------------------------------------------------------
router.get('/:ideaId', async (req, res) => {
  const { ideaId } = req.params;
  const uid = req.user.uid;

  try {
    const docSnap = await db.doc(ideaPath(uid, ideaId)).get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    const data = docSnap.data();
    return res.json({
      id: docSnap.id,
      title: data.title || 'Untitled Idea',
      currentContent: data.currentContent || '',
      status: data.status || 'active',
      currentVersionNumber: data.currentVersionNumber || 1,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
    });
  } catch (err) {
    console.error('[IdeaRoute] GET /:ideaId error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch idea.' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/ideas/:ideaId
// ---------------------------------------------------------------------------
// Update working idea title or content.
// ---------------------------------------------------------------------------
router.patch('/:ideaId', async (req, res) => {
  const { ideaId } = req.params;
  const { title, content } = req.body;
  const uid = req.user.uid;

  try {
    const docRef = db.doc(ideaPath(uid, ideaId));
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    const updates = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (title && typeof title === 'string' && title.trim()) {
      updates.title = title.trim().slice(0, 150);
    }
    if (content && typeof content === 'string' && content.trim()) {
      updates.currentContent = content.trim().slice(0, 5000);
    }

    await docRef.update(updates);

    await logActivity({
      uid,
      ideaId,
      eventType: 'idea_edited',
      summary: 'Updated working idea content',
    });

    return res.json({ success: true, message: 'Idea updated successfully.' });
  } catch (err) {
    console.error('[IdeaRoute] PATCH /:ideaId error:', err.message);
    return res.status(500).json({ error: 'Failed to update idea.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/archive
// ---------------------------------------------------------------------------
// Archives an idea without deleting historical data.
// ---------------------------------------------------------------------------
router.post('/:ideaId/archive', async (req, res) => {
  const { ideaId } = req.params;
  const uid = req.user.uid;

  try {
    const docRef = db.doc(ideaPath(uid, ideaId));
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    await docRef.update({
      status: 'archived',
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity({
      uid,
      ideaId,
      eventType: 'idea_archived',
      summary: 'Idea archived',
    });

    return res.json({ success: true, status: 'archived' });
  } catch (err) {
    console.error('[IdeaRoute] POST /:ideaId/archive error:', err.message);
    return res.status(500).json({ error: 'Failed to archive idea.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/restore
// ---------------------------------------------------------------------------
// Restores an archived idea back to active workspace.
// ---------------------------------------------------------------------------
router.post('/:ideaId/restore', async (req, res) => {
  const { ideaId } = req.params;
  const uid = req.user.uid;

  try {
    const docRef = db.doc(ideaPath(uid, ideaId));
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Idea not found.' });
    }

    await docRef.update({
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logActivity({
      uid,
      ideaId,
      eventType: 'idea_restored',
      summary: 'Idea restored to active status',
    });

    return res.json({ success: true, status: 'active' });
  } catch (err) {
    console.error('[IdeaRoute] POST /:ideaId/restore error:', err.message);
    return res.status(500).json({ error: 'Failed to restore idea.' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ideas/:ideaId/versions
// ---------------------------------------------------------------------------
// Retrieve full immutable version history for an idea.
// ---------------------------------------------------------------------------
router.get('/:ideaId/versions', async (req, res) => {
  const { ideaId } = req.params;
  const uid = req.user.uid;

  try {
    const versionsRef = db.collection(versionsCollection(uid, ideaId));
    const snapshot = await versionsRef.orderBy('createdAt', 'asc').get();

    const versions = snapshot.docs.map((doc, idx) => {
      const data = doc.data();
      return {
        id: doc.id,
        versionNumber: data.versionNumber || idx + 1,
        content: data.content || '',
        whatChanged: data.whatChanged || null,
        whyChanged: data.whyChanged || null,
        changeType: data.changeType || 'revision',
        assumption: data.assumption || null,
        riskLevel: data.riskLevel || null,
        evidenceStatus: data.evidenceStatus || 'not_checked',
        evidenceSummary: data.evidenceSummary || null,
        evidenceAssessment: data.evidenceAssessment || null,
        evidenceSources: data.evidenceSources || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
      };
    });

    return res.json({ versions });
  } catch (err) {
    console.error('[IdeaRoute] GET /:ideaId/versions error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve version history.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/versions
// ---------------------------------------------------------------------------
// Create a new immutable version snapshot in the evolution chain.
// ---------------------------------------------------------------------------
router.post(
  '/:ideaId/versions',
  validateTextInput('content', { maxLength: 5000 }),
  async (req, res) => {
    const { ideaId } = req.params;
    const uid = req.user.uid;
    const {
      content,
      whyChanged,
      whatChanged,
      changeType,
      assumption,
      riskLevel,
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Field "content" is required.' });
    }

    try {
      const ideaRef = db.doc(ideaPath(uid, ideaId));
      const ideaSnap = await ideaRef.get();
      if (!ideaSnap.exists) {
        return res.status(404).json({ error: 'Idea not found.' });
      }

      const versionsRef = ideaRef.collection('versions');
      const existingVersions = await versionsRef.get();
      const versionNumber = existingVersions.size + 1;

      // Ensure reasoning is recorded for any version after V1
      if (versionNumber > 1 && (!whyChanged || !whyChanged.trim())) {
        return res.status(400).json({
          error: 'Field "whyChanged" is required when creating a revision to document evolutionary thinking.',
        });
      }

      const now = FieldValue.serverTimestamp();
      const versionDocRef = versionsRef.doc();

      const versionPayload = {
        versionNumber,
        content: content.trim(),
        whatChanged: whatChanged ? whatChanged.trim().slice(0, 500) : null,
        whyChanged: whyChanged ? whyChanged.trim().slice(0, 1000) : null,
        changeType: changeType ? changeType.trim().slice(0, 100) : 'revision',
        assumption: assumption ? assumption.trim().slice(0, 500) : null,
        riskLevel: riskLevel ? String(riskLevel).toUpperCase() : null,
        evidenceStatus: 'not_checked',
        createdAt: now,
      };

      const batch = db.batch();
      batch.set(versionDocRef, versionPayload);
      batch.update(ideaRef, {
        currentContent: content.trim(),
        currentVersionNumber: versionNumber,
        updatedAt: now,
      });

      await batch.commit();

      await logActivity({
        uid,
        ideaId,
        eventType: 'version_created',
        summary: `Created Version ${versionNumber}${changeType ? ` (${changeType})` : ''}`,
        metadata: { versionNumber, changeType, riskLevel },
      });

      return res.status(201).json({
        versionId: versionDocRef.id,
        versionNumber,
        success: true,
      });
    } catch (err) {
      console.error('[IdeaRoute] POST /:ideaId/versions error:', err.message);
      return res.status(500).json({ error: 'Failed to record new version.' });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/ideas/:ideaId/activities
// ---------------------------------------------------------------------------
// Retrieve activity timeline for an idea.
// ---------------------------------------------------------------------------
router.get('/:ideaId/activities', async (req, res) => {
  const { ideaId } = req.params;
  const uid = req.user.uid;

  try {
    const activitiesRef = db.collection(activitiesCollection(uid, ideaId));
    const snapshot = await activitiesRef.orderBy('timestamp', 'desc').limit(50).get();

    const activities = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        eventType: data.eventType,
        summary: data.summary,
        metadata: data.metadata || {},
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp || null,
      };
    });

    return res.json({ activities });
  } catch (err) {
    console.error('[IdeaRoute] GET /:ideaId/activities error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve activities.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/ask
// ---------------------------------------------------------------------------
// "Ask My Idea" — answers questions grounded strictly in version history.
// ---------------------------------------------------------------------------
router.post(
  '/:ideaId/ask',
  validateTextInput('question', { maxLength: 500 }),
  async (req, res) => {
    const { ideaId } = req.params;
    const { question } = req.body;
    const uid = req.user.uid;

    try {
      const versionsRef = db.collection(versionsCollection(uid, ideaId));
      const snapshot = await versionsRef.orderBy('createdAt', 'asc').get();

      if (snapshot.empty) {
        return res.status(404).json({ error: 'No version history found for this idea.' });
      }

      if (snapshot.size === 1) {
        return res.json({
          text: "This idea hasn't been revised yet, so there's no evolutionary history to ask about. Revise the idea after challenging it — the history will build from there.",
        });
      }

      const docs = snapshot.docs;
      const recentDocs = docs.slice(-10);

      let versionHistory = '';
      recentDocs.forEach((doc, index) => {
        const data = doc.data();
        const verNum = docs.length - recentDocs.length + index + 1;

        versionHistory += `[Version ${verNum}]\n`;
        versionHistory += `Content: ${data.content}\n`;
        if (data.whyChanged && verNum > 1) {
          versionHistory += `Why it changed: ${data.whyChanged}\n`;
        }
        if (data.changeType) {
          versionHistory += `Change type: ${data.changeType}\n`;
        }
        if (data.assumption) {
          versionHistory += `Assumption challenged: ${data.assumption}\n`;
        }
        versionHistory += '\n';
      });

      const prompt = `You are answering a question about how an idea evolved. You must answer ONLY using the version history provided below. Do not invent motivations, context, or reasoning that is not present in the history. If the history does not contain enough information to answer the question, say so clearly instead of guessing.

VERSION HISTORY:
${versionHistory}

USER'S QUESTION: ${question}

Answer directly. Be specific. Reference specific versions or changes when relevant. Do not use hollow phrases like "great question" or "interesting insight."`;

      const result = await callGemini({ prompt, systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION });

      return res.json({ text: result.text, model: result.model });
    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[IdeaRoute] Ask My Idea error:', err);
      return res.status(500).json({ error: 'Failed to process your question.' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/reflection
// ---------------------------------------------------------------------------
// "You Used to Think / Now You Think" — reflective insight from version chain.
// ---------------------------------------------------------------------------
router.post('/:ideaId/reflection', async (req, res) => {
  const { ideaId } = req.params;
  const uid = req.user.uid;

  try {
    const versionsRef = db.collection(versionsCollection(uid, ideaId));
    const snapshot = await versionsRef.orderBy('createdAt', 'asc').get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No version history found.' });
    }

    if (snapshot.size < 2) {
      return res.json({
        usedToThink: null,
        nowThink: null,
        whyShift: "This idea hasn't been revised yet. Reflection becomes available after the first revision.",
      });
    }

    const docs = snapshot.docs;
    let versionHistory = '';
    docs.forEach((doc, index) => {
      const data = doc.data();
      versionHistory += `[Version ${index + 1}]\n`;
      versionHistory += `Content: ${data.content}\n`;
      if (data.whyChanged && index > 0) {
        versionHistory += `Why it changed: ${data.whyChanged}\n`;
      }
      if (data.assumption) {
        versionHistory += `Assumption that drove this change: ${data.assumption}\n`;
      }
      versionHistory += '\n';
    });

    const prompt = `You are generating a reflective insight from the complete version history of an idea. Your job is to surface the most meaningful shift in the user's thinking — from where they started to where they are now.

COMPLETE VERSION HISTORY:
${versionHistory}

Generate a JSON object with exactly three fields:
1. "usedToThink": A single sentence, in quotes, that captures the core belief or framing from the EARLIEST version of this idea. Write it as if the user is speaking ("Students need..."). Extract this directly from V1's content — do not paraphrase beyond clarity.
2. "nowThink": A single sentence, in quotes, capturing the core belief or framing from the LATEST version. Same format — as if the user is speaking.
3. "whyShift": 2-3 sentences explaining what caused this shift in thinking. Ground this ONLY in the version history provided (the whyChanged fields and assumption fields). Do not invent psychological motivations. Do not generalize. Be specific to this idea's actual changes.

Return ONLY raw JSON, no markdown, no code blocks.`;

    const result = await callGemini({ prompt, systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION });

    let reflection;
    try {
      const text = result.text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```$/, '')
        .trim();
      reflection = JSON.parse(text);
    } catch (parseErr) {
      console.error('[IdeaRoute] Failed to parse reflection JSON:', result.text);
      return res.status(500).json({ error: 'Failed to generate reflection. Please try again.' });
    }

    return res.json(reflection);
  } catch (err) {
    if (err instanceof GeminiError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('[IdeaRoute] Reflection error:', err);
    return res.status(500).json({ error: 'Failed to generate reflection.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/versions/:versionId/evidence
// ---------------------------------------------------------------------------
// Tavily Evidence Engine with Intelligent Evidence Gating.
// ---------------------------------------------------------------------------
router.post('/:ideaId/versions/:versionId/evidence', async (req, res) => {
  const { ideaId, versionId } = req.params;
  const { forceRefresh, assumption: customAssumption } = req.body || {};
  const uid = req.user.uid;

  try {
    const versionRef = db
      .collection('users').doc(uid)
      .collection('ideas').doc(ideaId)
      .collection('versions').doc(versionId);

    const versionSnap = await versionRef.get();
    if (!versionSnap.exists) {
      return res.status(404).json({ error: 'Version not found or does not belong to your account.' });
    }

    const versionData = versionSnap.data();

    // Cache hit optimization
    if (
      !forceRefresh &&
      versionData.evidenceStatus === 'available' &&
      versionData.evidenceSummary &&
      Array.isArray(versionData.evidenceSources)
    ) {
      return res.json({
        evidenceStatus: versionData.evidenceStatus,
        evidenceQuery: versionData.evidenceQuery,
        evidenceSummary: versionData.evidenceSummary,
        evidenceAssessment: versionData.evidenceAssessment,
        evidenceCheckedAt: versionData.evidenceCheckedAt,
        evidenceSources: versionData.evidenceSources,
        cached: true,
      });
    }

    const targetAssumption =
      customAssumption ||
      versionData.assumption ||
      versionData.whyChanged ||
      versionData.content;

    if (!targetAssumption) {
      return res.status(400).json({ error: 'No assumption found to check for this version.' });
    }

    let gate = null;
    if (!forceRefresh) {
      try {
        gate = await evaluateEvidenceGate({
          ideaContent: versionData.content,
          assumption: targetAssumption,
        });

        if (gate && gate.needsEvidence === false) {
          return res.json({
            evidenceStatus: 'not_needed',
            evidenceAssessment: 'not_needed',
            evidenceReason: gate.reason,
            evidenceSummary: gate.reason,
            evidenceQuery: null,
            evidenceSources: [],
            evidenceGate: gate,
            cached: false,
          });
        }
      } catch (gateErr) {
        console.warn('[IdeaRoute] Evidence gate fallback:', gateErr.message);
      }
    }

    const query = (gate && gate.searchQuery)
      ? gate.searchQuery
      : await generateSanitizedQuery({
          ideaContent: versionData.content,
          assumption: targetAssumption,
        });

    const sources = await searchTavily({ query, searchDepth: 'basic', maxResults: 5 });

    const synthesis = await synthesizeEvidence({
      ideaContent: versionData.content,
      assumption: targetAssumption,
      sources,
    });

    const evidencePayload = {
      evidenceStatus: sources.length > 0 ? 'available' : 'insufficient',
      evidenceQuery: query,
      evidenceSummary: synthesis.evidenceSummary,
      evidenceAssessment: synthesis.evidenceAssessment,
      evidenceCheckedAt: new Date().toISOString(),
      evidenceSources: sources,
    };

    await versionRef.update(evidencePayload);

    await logActivity({
      uid,
      ideaId,
      eventType: 'evidence_checked',
      summary: `Evidence check: ${synthesis.evidenceAssessment.toUpperCase()} for "${targetAssumption.slice(0, 60)}..."`,
      metadata: {
        assessment: synthesis.evidenceAssessment,
        query,
        sourceCount: sources.length,
      },
    });

    return res.json({
      ...evidencePayload,
      cached: false,
    });
  } catch (err) {
    if (err instanceof TavilyError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    if (err instanceof GeminiError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('[IdeaRoute] Evidence check error:', err);
    return res.status(500).json({ error: 'Something interrupted the evidence check. Your idea is safe.' });
  }
});

module.exports = router;
