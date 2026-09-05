// ---------------------------------------------------------------------------
// evidenceSynthesizer.js — Synthesizes real-world evidence with Gemini.
// ---------------------------------------------------------------------------

const { callGemini } = require('./geminiHelper');
const {
  EVIDENCE_GATE_SYSTEM_INSTRUCTION,
  EVIDENCE_SYNTHESIZER_SYSTEM_INSTRUCTION,
} = require('./systemPrompt');

/**
 * Generates a concise, privacy-safe search query based strictly on the idea & assumption.
 * Never includes full conversation transcripts or user identity.
 *
 * @param {object} params
 * @param {string} params.ideaContent
 * @param {string} params.assumption
 * @returns {Promise<string>}
 */
async function generateSanitizedQuery({ ideaContent, assumption }) {
  if (!assumption && !ideaContent) {
    return 'startup market validation assumptions';
  }

  const prompt = `IDEA SUMMARY:
"${(ideaContent || '').slice(0, 200)}"

CORE ASSUMPTION TO CHECK:
"${(assumption || ideaContent || '').slice(0, 200)}"

Generate a single concise search query (4 to 8 words) optimized for search engines to find real-world statistics, studies, industry reports, or counter-evidence.
- Do NOT include quotes, boolean operators, punctuation, or conversational words.
- Focus strictly on the core problem/behavior.

Return ONLY the search query text. Nothing else.`;

  try {
    const result = await callGemini({
      prompt,
      systemInstruction: EVIDENCE_GATE_SYSTEM_INSTRUCTION,
    });
    const cleanQuery = result.text.replace(/["'\n\r]/g, ' ').trim();
    return cleanQuery || `evidence ${assumption || ideaContent}`.slice(0, 100);
  } catch (_e) {
    // Fallback if LLM query builder fails
    return `evidence ${assumption || ideaContent}`.replace(/[^a-zA-Z0-9\s]/g, ' ').slice(0, 100);
  }
}

/**
 * Synthesizes retrieved Tavily sources against the assumption using Gemini.
 *
 * @param {object} params
 * @param {string} params.ideaContent
 * @param {string} params.assumption
 * @param {Array<{ title: string, url: string, domain: string, snippet: string }>} params.sources
 * @returns {Promise<{ evidenceAssessment: 'supporting'|'challenging'|'mixed'|'insufficient', evidenceSummary: string }>}
 */
async function synthesizeEvidence({ ideaContent, assumption, sources = [] }) {
  if (!sources || sources.length === 0) {
    return {
      evidenceAssessment: 'insufficient',
      evidenceSummary: 'No relevant real-world studies, market reports, or articles were found for this specific assumption.',
    };
  }

  // Format sources cleanly for the prompt
  const sourcesText = sources
    .map((s, idx) => `[Source ${idx + 1}] (${s.domain}): ${s.title}\nSnippet: ${s.snippet}`)
    .join('\n\n');

  const prompt = `IDEA:
"${(ideaContent || '').slice(0, 250)}"

ASSUMPTION BEING CHECKED:
"${(assumption || '').slice(0, 250)}"

RETRIEVED REAL-WORLD SOURCES:
${sourcesText}

Evaluate these sources and return a JSON object with:
1. "evidenceAssessment": "supporting" | "challenging" | "mixed" | "insufficient"
2. "evidenceSummary": 2 to 3 concise, objective sentences grounded ONLY in the retrieved evidence.`;

  const result = await callGemini({
    prompt,
    systemInstruction: EVIDENCE_SYNTHESIZER_SYSTEM_INSTRUCTION,
  });


  try {
    const text = result.text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '')
      .trim();
    const parsed = JSON.parse(text);

    const validAssessments = ['supporting', 'challenging', 'mixed', 'insufficient'];
    const assessment = validAssessments.includes(parsed.evidenceAssessment)
      ? parsed.evidenceAssessment
      : 'mixed';

    return {
      evidenceAssessment: assessment,
      evidenceSummary: parsed.evidenceSummary || 'Evidence check completed.',
    };
  } catch (err) {
    console.error('[EvidenceSynthesizer] Failed to parse JSON synthesis:', result.text);
    return {
      evidenceAssessment: 'mixed',
      evidenceSummary: result.text.slice(0, 300),
    };
  }
}

module.exports = {
  generateSanitizedQuery,
  synthesizeEvidence,
};
