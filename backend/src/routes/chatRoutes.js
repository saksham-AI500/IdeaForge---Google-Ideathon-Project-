const express = require('express');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { callGemini, GeminiError } = require('../services/geminiHelper');
const { validateTextInput } = require('../middleware/validateInput');
const { IDEAFORGE_SYSTEM_INSTRUCTION } = require('../services/systemPrompt');
const { logActivity } = require('../services/activityLogger');

const router = express.Router();
const db = getFirestore();

// ---------------------------------------------------------------------------
// POST /api/chat/clarify
// ---------------------------------------------------------------------------
router.post(
  '/clarify',
  validateTextInput('ideaText', { maxLength: 2000 }),
  async (req, res) => {
    const { ideaId, ideaText } = req.body;
    const uid = req.user.uid;

    if (!ideaId) return res.status(400).json({ error: 'ideaId is required' });

    try {
      const prompt = `The user has just captured this rough idea:

"${ideaText}"

Your job: ask exactly ONE sharp clarifying question. Focus on the single most important gap — which is usually: who specifically has this problem, why existing solutions fail them, or what evidence the user has that this problem is real and painful.

Do not ask multiple questions. Do not suggest solutions. Do not praise the idea. Just ask the one question that, if answered, would most sharpen your understanding of whether this idea is worth pursuing.`;

      const result = await callGemini({
        prompt,
        systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION,
      });

      const msgRef = db
        .collection('users').doc(uid)
        .collection('ideas').doc(ideaId)
        .collection('conversations').doc('main')
        .collection('messages').doc();

      await msgRef.set({
        role: 'model',
        text: result.text,
        timestamp: FieldValue.serverTimestamp(),
        messageType: 'clarify',
      });

      return res.json({ text: result.text, messageId: msgRef.id });
    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[ChatRoute] Clarify error:', err);
      return res.status(500).json({ error: 'Failed to clarify idea.' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/chat/reply
// ---------------------------------------------------------------------------
// Unified Gemini Guide assistant: answers questions about current idea,
// past versions, why/what changed, risks, and performs live evidence retrieval.
// ---------------------------------------------------------------------------
const { searchTavily } = require('../services/tavilyService');
const { evaluateEvidenceGate } = require('../services/evidenceGate');
const { EVOLUTION_SUMMARY_SYSTEM_INSTRUCTION } = require('../services/systemPrompt');

router.post(
  '/reply',
  validateTextInput('messageText', { maxLength: 2000 }),
  async (req, res) => {
    const { ideaId, history, messageText, currentContent: bodyContent, versions: bodyVersions } = req.body;
    const uid = req.user.uid;

    if (!ideaId) return res.status(400).json({ error: 'ideaId is required' });
    if (!Array.isArray(history)) return res.status(400).json({ error: 'history must be an array' });

    try {
      // 1. Fetch current idea and version history
      let currentIdeaContent = bodyContent || '';
      let versionList = Array.isArray(bodyVersions) ? bodyVersions : [];

      if (!currentIdeaContent || versionList.length === 0) {
        try {
          const ideaRef = db.collection('users').doc(uid).collection('ideas').doc(ideaId);
          const [ideaSnap, versionsSnap] = await Promise.all([
            ideaRef.get(),
            ideaRef.collection('versions').orderBy('createdAt', 'asc').get(),
          ]);

          if (ideaSnap.exists && !currentIdeaContent) {
            currentIdeaContent = ideaSnap.data().currentContent || '';
          }
          if (versionsSnap.docs && versionList.length === 0) {
            versionList = versionsSnap.docs.map(d => d.data());
          }
        } catch (dbErr) {
          console.warn('[ChatRoute] Could not fetch idea from Firestore directly:', dbErr.message);
        }
      }

      let evolutionContext = `[CURRENT WORKING IDEA]\n"${currentIdeaContent || '(No idea content)'}"\n\n`;

      if (versionList.length > 0) {
        evolutionContext += `[EVOLUTION HISTORY (${versionList.length} versions)]:\n`;
        versionList.forEach((v, idx) => {
          const verNum = idx + 1;
          evolutionContext += `• Version ${verNum}: "${(v.content || '').slice(0, 200)}"\n`;
          if (v.whatChanged && verNum > 1) evolutionContext += `  - What changed: ${v.whatChanged}\n`;
          if (v.whyChanged && verNum > 1) evolutionContext += `  - Why it changed: ${v.whyChanged}\n`;
          if (v.changeType) evolutionContext += `  - Change type: ${v.changeType}\n`;
          if (v.assumption) evolutionContext += `  - Core assumption: ${v.assumption}\n`;
          if (v.evidenceAssessment) evolutionContext += `  - Evidence: ${String(v.evidenceAssessment).toUpperCase()}\n`;
        });
        evolutionContext += '\n';
      }

      // 2. Save user message to Firestore (best effort)
      let userMsgId = 'msg-' + Date.now();
      try {
        const userMsgRef = db
          .collection('users').doc(uid)
          .collection('ideas').doc(ideaId)
          .collection('conversations').doc('main')
          .collection('messages').doc();

        await userMsgRef.set({
          role: 'user',
          text: messageText,
          timestamp: FieldValue.serverTimestamp(),
        });
        userMsgId = userMsgRef.id;
      } catch (writeErr) {
        console.warn('[ChatRoute] Firestore user message save skipped/failed:', writeErr.message);
      }

      // 3. Detect if the user is explicitly or implicitly asking for empirical proof / web evidence
      const isExplicitEvidenceReq = /\b(evidence|proof|sources|source|market data|competitor|statistics|studies|study|is this growing|verify)\b/i.test(messageText);
      let gate = null;

      if (isExplicitEvidenceReq) {
        try {
          gate = await evaluateEvidenceGate({
            ideaContent: currentIdeaContent,
            assumption: messageText,
          });
        } catch (_gateErr) {}
      }

      let responseText = '';
      let evidenceData = null;

      if (gate && gate.needsEvidence && gate.searchQuery) {
        try {
          const sources = await searchTavily({
            query: gate.searchQuery,
            searchDepth: 'basic',
            maxResults: 4,
          });

          if (sources && sources.length > 0) {
            const sourcesText = sources.map((s, i) => `[Source ${i+1}] (${s.domain}): ${s.title}\nSnippet: ${s.snippet}`).join('\n\n');
            const synthPrompt = `USER QUESTION / CLAIM:
"${messageText}"

IDEA:
"${currentIdeaContent}"

RETRIEVED REAL-WORLD SOURCES:
${sourcesText}

Your task:
Answer the user's question directly and concisely:
1. Start with the clear conclusion (e.g. SUPPORTED, CHALLENGED, MIXED, or INSUFFICIENT).
2. Give 1 to 3 concise bullet points grounded strictly in the sources.
3. List the source titles and domains.
Do not invent data. Keep it crisp.`;

            const synthRes = await callGemini({
              prompt: synthPrompt,
              systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION,
            });

            responseText = synthRes.text;
            evidenceData = {
              assessment: 'completed',
              query: gate.searchQuery,
              sources,
            };
          }
        } catch (tavilyErr) {
          console.warn('[ChatRoute] Tavily evidence lookup failed in reply, falling back to standard LLM:', tavilyErr.message);
        }
      }

      // 4. If not handled by evidence synthesis, answer conversationally with evolution grounding
      if (!responseText) {
        const formattedHistory = history.map(msg => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text || '' }],
        }));

        const contextualPrompt = `${evolutionContext}USER MESSAGE:
"${messageText}"

Answer as the user's Idea Mentor. Be direct, concise, and analytical. Use the evolution history and context when relevant. Do not give generic startup advice.`;

        const result = await callGemini({
          prompt: contextualPrompt,
          history: formattedHistory,
          systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION,
        });

        responseText = result.text;
      }

      // 5. Save model message to Firestore (best effort)
      let modelMsgId = 'model-' + Date.now();
      try {
        const modelMsgRef = db
          .collection('users').doc(uid)
          .collection('ideas').doc(ideaId)
          .collection('conversations').doc('main')
          .collection('messages').doc();

        const modelPayload = {
          role: 'model',
          text: responseText,
          timestamp: FieldValue.serverTimestamp(),
        };
        if (evidenceData) {
          modelPayload.evidenceData = evidenceData;
        }

        await modelMsgRef.set(modelPayload);
        modelMsgId = modelMsgRef.id;
      } catch (saveErr) {
        console.warn('[ChatRoute] Firestore model message save skipped/failed:', saveErr.message);
      }

      return res.json({
        text: responseText,
        evidenceData,
        userMessageId: userMsgId,
        modelMessageId: modelMsgId,
      });
    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[ChatRoute] Reply error:', err);
      return res.status(500).json({ error: 'Failed to reply.' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/chat/evolution-summary
// ---------------------------------------------------------------------------
// Synthesizes the COMPLETE evolution of the idea from V1 to current version.
// ---------------------------------------------------------------------------
router.post(
  '/evolution-summary',
  async (req, res) => {
    const { ideaId, currentContent: bodyContent, versions: bodyVersions } = req.body;
    const uid = req.user.uid;

    if (!ideaId) return res.status(400).json({ error: 'ideaId is required' });

    try {
      let currentContent = bodyContent || '';
      let versions = Array.isArray(bodyVersions) ? bodyVersions : [];

      if (!currentContent || versions.length === 0) {
        try {
          const ideaRef = db.collection('users').doc(uid).collection('ideas').doc(ideaId);
          const [ideaSnap, versionsSnap] = await Promise.all([
            ideaRef.get(),
            ideaRef.collection('versions').orderBy('createdAt', 'asc').get(),
          ]);

          if (ideaSnap.exists && !currentContent) {
            currentContent = ideaSnap.data().currentContent;
          }
          if (versionsSnap.docs && versions.length === 0) {
            versions = versionsSnap.docs.map(d => d.data());
          }
        } catch (dbErr) {
          console.warn('[ChatRoute] Firestore read for evolution-summary fallback:', dbErr.message);
        }
      }

      let summaryText = '';

      if (versions.length <= 1) {
        summaryText = `Your idea was recently captured as: "${currentContent || 'Initial concept'}". It has not yet been revised into new versions. Revise your idea after testing assumptions to track its evolutionary journey.`;
      } else {
        let versionChain = `IDEA CURRENT STATEMENT:\n"${currentContent}"\n\nVERSION HISTORY (${versions.length} versions):\n`;
        versions.forEach((v, idx) => {
          const num = idx + 1;
          versionChain += `[Version ${num}]: "${v.content}"\n`;
          if (v.whatChanged && num > 1) versionChain += `  What Changed: ${v.whatChanged}\n`;
          if (v.whyChanged && num > 1) versionChain += `  Why Changed: ${v.whyChanged}\n`;
          if (v.changeType) versionChain += `  Change Type: ${v.changeType}\n`;
          if (v.assumption) versionChain += `  Core Assumption: ${v.assumption}\n`;
          if (v.evidenceAssessment) versionChain += `  Evidence Assessment: ${v.evidenceAssessment}\n`;
        });

        const prompt = `${versionChain}\nSynthesize the complete evolutionary journey of this idea. State where it started, the major pivots and reasons, what it looks like today, and what remains unproven.`;

        const result = await callGemini({
          prompt,
          systemInstruction: EVOLUTION_SUMMARY_SYSTEM_INSTRUCTION,
        });

        summaryText = result.text.trim();
      }

      // Save summary message to chat stream (best effort)
      let msgId = 'summary-' + Date.now();
      try {
        const ideaRef = db.collection('users').doc(uid).collection('ideas').doc(ideaId);
        const msgRef = ideaRef.collection('conversations').doc('main').collection('messages').doc();
        await msgRef.set({
          role: 'model',
          text: summaryText,
          messageType: 'evolution_summary',
          timestamp: FieldValue.serverTimestamp(),
        });
        msgId = msgRef.id;
      } catch (saveErr) {
        console.warn('[ChatRoute] Firestore evolution summary save skipped/failed:', saveErr.message);
      }

      return res.json({
        text: summaryText,
        summary: summaryText,
        messageId: msgId,
      });
    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[ChatRoute] Evolution summary error:', err);
      return res.status(500).json({ error: 'Failed to generate evolution summary.' });
    }
  }
);



// ---------------------------------------------------------------------------
// POST /api/chat/challenge
// ---------------------------------------------------------------------------
router.post(
  '/challenge',
  validateTextInput('ideaText', { maxLength: 2000 }),
  async (req, res) => {
    const { ideaId, ideaText, history } = req.body;
    const uid = req.user.uid;

    if (!ideaId) return res.status(400).json({ error: 'ideaId is required' });
    if (!Array.isArray(history)) return res.status(400).json({ error: 'history must be an array' });

    try {
      // Build context from idea and user answers
      const userAnswers = history
        .filter(h => h.role === 'user')
        .map(h => `- ${h.text}`)
        .join('\n');

      const prompt = `You are challenging this idea and the user's stated reasoning.

IDEA:
"${ideaText}"

USER'S ANSWERS AND REASONING SO FAR:
${userAnswers || '(No prior conversation yet)'}

Your task: Identify the SINGLE most important assumption this idea depends on that has NOT yet been validated. Focus on decision-relevant risk — the assumption that, if wrong, would most likely cause this idea to fail or require fundamental rethinking.

Do NOT:
- List multiple assumptions
- Be vague ("you should validate your market")
- Use "impossible" unless the evidence is genuinely definitive
- Be encouraging for its own sake

PREFERRED LANGUAGE when describing risk:
- "currently unsupported"
- "depends on an unverified assumption"
- "high execution risk"
- "evidence is insufficient"

Return a JSON object with EXACTLY these five fields:
1. "assumption": A single sentence naming the core assumption being made.
2. "whyItMatters": 1-2 sentences explaining why this assumption is decision-critical — what breaks if it's wrong.
3. "whatWouldValidateIt": One concrete, specific action the user could take to test or disprove this assumption. Be specific (e.g., "Talk to 5 high school students who failed a math exam this semester and ask if they searched for help online").
4. "riskLevel": EXACTLY one of: "PLAUSIBLE", "UNPROVEN", "RISKY", "HIGHLY_QUESTIONABLE".
5. "critique": The full 2-3 sentence prose that names the assumption, explains why it's risky, and what evidence or reasoning supports your concern. Ground this in the idea text and user's answers — do not invent context.

Use these risk level definitions:
- PLAUSIBLE: The assumption is reasonable and partially supported by available evidence, but still unconfirmed.
- UNPROVEN: The assumption is plausible in theory but has no direct evidence yet — common for early-stage ideas.
- RISKY: The assumption depends on conditions that are uncertain or difficult to achieve (e.g., behavior change, market timing, regulatory approval).
- HIGHLY_QUESTIONABLE: The assumption conflicts with known evidence, entrenched behavior, or has significant logical gaps.

Return ONLY raw JSON, no markdown, no code blocks.`;

      const result = await callGemini({ prompt, systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION });

      let structuredResult;
      try {
        const text = result.text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/, '')
          .replace(/```$/, '')
          .trim();
        structuredResult = JSON.parse(text);
      } catch (parseErr) {
        console.error('[Challenge] Failed to parse Gemini JSON:', result.text);
        structuredResult = {
          assumption: 'Could not parse structured result.',
          whyItMatters: result.text,
          whatWouldValidateIt: 'Conduct a user interview.',
          riskLevel: 'UNPROVEN',
          critique: result.text,
        };
      }

      // Intelligent Evidence Gate: evaluate whether external evidence is needed
      try {
        const gate = await evaluateEvidenceGate({
          ideaContent: ideaText,
          assumption: structuredResult.assumption,
          challengeText: structuredResult.whyItMatters,
        });
        structuredResult.evidenceGate = gate;
      } catch (gateErr) {
        console.error('[Challenge] Evidence gate evaluation failed:', gateErr.message);
        structuredResult.evidenceGate = {
          needsEvidence: false,
          reason: 'Evidence gate temporarily unavailable.',
          searchQuery: null,
        };
      }

      const msgRef = db
        .collection('users').doc(uid)
        .collection('ideas').doc(ideaId)
        .collection('conversations').doc('main')
        .collection('messages').doc();

      await msgRef.set({
        role: 'model',
        text: structuredResult.critique,
        structuredChallenge: structuredResult,
        timestamp: FieldValue.serverTimestamp(),
        messageType: 'challenge',
      });

      await logActivity({
        uid,
        ideaId,
        eventType: 'challenge_generated',
        summary: `Challenged assumption: "${(structuredResult.assumption || '').slice(0, 60)}..."`,
        metadata: { riskLevel: structuredResult.riskLevel },
      });

      if (structuredResult.riskLevel === 'RISKY' || structuredResult.riskLevel === 'HIGHLY_QUESTIONABLE') {
        await logActivity({
          uid,
          ideaId,
          eventType: 'risk_identified',
          summary: `Identified ${structuredResult.riskLevel} risk: "${(structuredResult.whyItMatters || '').slice(0, 60)}..."`,
          metadata: { riskLevel: structuredResult.riskLevel },
        });
      }

      return res.json({
        text: structuredResult.critique,
        structuredChallenge: structuredResult,
        messageId: msgRef.id,
      });

    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[ChatRoute] Challenge error:', err);
      return res.status(500).json({ error: 'Failed to challenge idea.' });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/chat/compare
// ---------------------------------------------------------------------------
router.post(
  '/compare',
  async (req, res) => {
    const { v1Content, v1Why, v2Content, v2Why } = req.body;

    if (!v1Content || !v2Content) {
      return res.status(400).json({ error: 'v1Content and v2Content are required' });
    }

    try {
      const prompt = `Compare these two versions of an idea and summarize what actually changed — not just surface wording, but the underlying thinking.

VERSION A:
Content: ${v1Content}
Reasoning at this stage: ${v1Why || 'Initial version — no prior reasoning recorded'}

VERSION B:
Content: ${v2Content}
Reasoning at this stage: ${v2Why || 'Initial version — no prior reasoning recorded'}

Write 1-2 plain sentences that describe the net shift in thinking between these two versions. Focus on what assumption or belief changed, or what problem framing shifted. Do not invent motivations not present in the reasoning. Do not use hollow phrases like "significant evolution" — be specific.`;

      const result = await callGemini({ prompt, systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION });
      return res.json({ text: result.text });
    } catch (err) {
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error('[ChatRoute] Compare error:', err);
      return res.status(500).json({ error: 'Failed to compare versions.' });
    }
  }
);

module.exports = router;
