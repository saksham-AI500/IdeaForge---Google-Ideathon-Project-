// ---------------------------------------------------------------------------
// evidenceGate.js — Intelligent Evidence Gate service using Gemini.
// ---------------------------------------------------------------------------
// Determines whether an assumption or challenge warrants real-world external
// web research via Tavily, and generates a concise neutral query if true.
// ---------------------------------------------------------------------------

const { callGemini } = require('./geminiHelper');
const { EVIDENCE_GATE_SYSTEM_INSTRUCTION } = require('./systemPrompt');

/**
 * Evaluates whether an assumption/challenge requires external evidence.
 *
 * @param {object} params
 * @param {string} [params.ideaContent]
 * @param {string} [params.assumption]
 * @param {string} [params.challengeText]
 * @returns {Promise<{ needsEvidence: boolean, reason: string, searchQuery: string|null }>}
 */
async function evaluateEvidenceGate({ ideaContent = '', assumption = '', challengeText = '' }) {
  if (!assumption && !ideaContent) {
    return {
      needsEvidence: false,
      reason: 'No concrete assumption provided to verify.',
      searchQuery: null,
    };
  }

  const prompt = `IDEA:
"${(ideaContent || '').slice(0, 300)}"

ASSUMPTION / CORE CLAIM:
"${(assumption || ideaContent || '').slice(0, 300)}"

${challengeText ? `CHALLENGE / CONTEXT:\n"${challengeText.slice(0, 300)}"\n` : ''}
Determine if external real-world research (market data, user behavior studies, statistics, competitor presence, feasibility) is needed to evaluate this claim.
Return ONLY raw JSON with keys: "needsEvidence", "reason", "searchQuery".`;

  try {
    const result = await callGemini({
      prompt,
      systemInstruction: EVIDENCE_GATE_SYSTEM_INSTRUCTION,
    });

    const text = (result.text || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(text);

    return {
      needsEvidence: Boolean(parsed.needsEvidence),
      reason: parsed.reason || (parsed.needsEvidence ? 'External evidence warrants real-world verification.' : 'Subjective or internal reasoning — external evidence not required.'),
      searchQuery: parsed.needsEvidence && parsed.searchQuery ? String(parsed.searchQuery).replace(/["'\n\r]/g, ' ').trim() : null,
    };
  } catch (err) {
    console.error('[EvidenceGate] Evaluation failed or returned non-JSON:', err.message);
    // Safe heuristic fallback: if assumption discusses behavior/market/competitors, default true
    const textLower = (assumption + ' ' + ideaContent).toLowerCase();
    const indicatesExternal = /competitor|market|adoption|pricing|students|users|pay|behavior|regulat|legal|statist|feasib/i.test(textLower);

    return {
      needsEvidence: indicatesExternal,
      reason: indicatesExternal ? 'Assumption touches on external market or user behavior.' : 'Internal logic/creative choice does not require external search.',
      searchQuery: indicatesExternal ? `evidence ${assumption || ideaContent}`.slice(0, 80) : null,
    };
  }
}

module.exports = {
  evaluateEvidenceGate,
};
