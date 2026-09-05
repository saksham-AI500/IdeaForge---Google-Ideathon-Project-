// ---------------------------------------------------------------------------
// ideaRoutes.js — Endpoints related to idea logic (Ask My Idea, Reflection).
// ---------------------------------------------------------------------------
const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const { callGemini, GeminiError } = require('../services/geminiHelper');
const { validateTextInput } = require('../middleware/validateInput');
const { IDEAFORGE_SYSTEM_INSTRUCTION } = require('../services/systemPrompt');

const router = express.Router();
const db = getFirestore();

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/ask
// ---------------------------------------------------------------------------
// "Ask My Idea" — answers questions grounded only in the version history.
// ---------------------------------------------------------------------------
router.post(
  '/:ideaId/ask',
  validateTextInput('question', { maxLength: 500 }),
  async (req, res) => {
    const { ideaId } = req.params;
    const { question } = req.body;
    const uid = req.user.uid;

    try {
      // 1. Fetch version history
      const versionsRef = db
        .collection('users').doc(uid)
        .collection('ideas').doc(ideaId)
        .collection('versions');

      const snapshot = await versionsRef.orderBy('createdAt', 'asc').get();

      if (snapshot.empty) {
        return res.status(404).json({ error: 'No version history found for this idea.' });
      }

      if (snapshot.size === 1) {
        return res.json({
          text: "This idea hasn't been revised yet, so there's no evolutionary history to ask about. Revise the idea after challenging it — the history will build from there.",
        });
      }

      // 2. Format version history (max 10 most recent)
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

      // 3. Prompt grounded strictly in the version history
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
// No new Firestore collection — reads from existing versions subcollection.
// ---------------------------------------------------------------------------
router.post(
  '/:ideaId/reflection',
  async (req, res) => {
    const { ideaId } = req.params;
    const uid = req.user.uid;

    try {
      // 1. Fetch version history
      const versionsRef = db
        .collection('users').doc(uid)
        .collection('ideas').doc(ideaId)
        .collection('versions');

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

      // 2. Build version history for reflection prompt
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

      // 3. Reflection prompt
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
  }
);

// ---------------------------------------------------------------------------
// POST /api/ideas/:ideaId/versions/:versionId/evidence
// ---------------------------------------------------------------------------
// "Tavily Evidence Engine" with Intelligent Evidence Gating.
// Only calls Tavily when external research is warranted or explicitly forced.
// ---------------------------------------------------------------------------
const { searchTavily, TavilyError } = require('../services/tavilyService');
const { generateSanitizedQuery, synthesizeEvidence } = require('../services/evidenceSynthesizer');
const { evaluateEvidenceGate } = require('../services/evidenceGate');

router.post(
  '/:ideaId/versions/:versionId/evidence',
  async (req, res) => {
    const { ideaId, versionId } = req.params;
    const { forceRefresh, assumption: customAssumption } = req.body || {};
    const uid = req.user.uid;

    try {
      // 1. Verify idea and version ownership
      const versionRef = db
        .collection('users').doc(uid)
        .collection('ideas').doc(ideaId)
        .collection('versions').doc(versionId);

      const versionSnap = await versionRef.get();
      if (!versionSnap.exists) {
        return res.status(404).json({ error: 'Version not found or does not belong to your account.' });
      }

      const versionData = versionSnap.data();

      // 2. Optimization: Return cached evidence if already present and not force-refreshed
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

      // 3. Determine target assumption to check
      const targetAssumption =
        customAssumption ||
        versionData.assumption ||
        versionData.whyChanged ||
        versionData.content;

      if (!targetAssumption) {
        return res.status(400).json({ error: 'No assumption found to check for this version.' });
      }

      // 4. Intelligent Evidence Gate: Check if evidence is actually warranted
      let gate = null;
      if (!forceRefresh) {
        try {
          gate = await evaluateEvidenceGate({
            ideaContent: versionData.content,
            assumption: targetAssumption,
          });

          // If gate determines external evidence is NOT needed and user didn't force refresh
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

      // 5. Generate sanitized, minimal query (never sends full conversations or user PII)
      const query = (gate && gate.searchQuery)
        ? gate.searchQuery
        : await generateSanitizedQuery({
            ideaContent: versionData.content,
            assumption: targetAssumption,
          });

      // 6. Query Tavily Search API (Basic depth, max 5 results)
      const sources = await searchTavily({ query, searchDepth: 'basic', maxResults: 5 });

      // 7. Synthesize findings with Gemini
      const synthesis = await synthesizeEvidence({
        ideaContent: versionData.content,
        assumption: targetAssumption,
        sources,
      });

      // 8. Persist to Firestore version document
      const evidencePayload = {
        evidenceStatus: sources.length > 0 ? 'available' : 'insufficient',
        evidenceQuery: query,
        evidenceSummary: synthesis.evidenceSummary,
        evidenceAssessment: synthesis.evidenceAssessment,
        evidenceCheckedAt: new Date().toISOString(),
        evidenceSources: sources,
      };

      await versionRef.update(evidencePayload);

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
  }
);

module.exports = router;


