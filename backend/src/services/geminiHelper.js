// ---------------------------------------------------------------------------
// geminiHelper.js — Shared Gemini API helper with model fallback ladder.
// ---------------------------------------------------------------------------
// EVERY Gemini call in this project MUST go through callGemini() below.
// This ensures:
//   1. The API key is read from env vars (Secret Manager in production) — never
//      hardcoded, never sent to the frontend.
//   2. Recoverable errors (timeout, rate limit, transient 5xx) trigger one
//      automatic retry against a fallback model.
//   3. Non-recoverable errors (bad input, auth failure) fail fast — no retry.
//   4. All failures return clean, structured errors — no raw stack traces.
//
// Usage by downstream route handlers:
//
//   const { callGemini } = require('./geminiHelper');
//
//   const result = await callGemini({
//     prompt: 'Some prompt text',
//     systemInstruction: 'Optional system instruction',
//     history: [{ role: 'user', parts: [{ text: '...' }] }],  // optional
//   });
//   // result = { text: '...', model: 'gemini-2.0-flash' }
//
//   If both models fail, callGemini throws a GeminiError with a user-friendly
//   message and an HTTP status code.
// ---------------------------------------------------------------------------

const { GoogleGenAI } = require('@google/genai');

// ---------------------------------------------------------------------------
// Configuration — all from environment variables
// ---------------------------------------------------------------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Normalize deprecated model names per Gemini API deprecation policies
const DEPRECATED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-thinking',
  'gemini-2.5-flash',
];

function resolveActiveModel(envValue, fallbackDefault) {
  if (!envValue || DEPRECATED_MODELS.includes(envValue)) {
    return fallbackDefault;
  }
  return envValue;
}

const PRIMARY_MODEL = resolveActiveModel(process.env.GEMINI_PRIMARY_MODEL, 'gemini-3.8-flash');
const FALLBACK_MODEL = resolveActiveModel(process.env.GEMINI_FALLBACK_MODEL, 'gemini-3.1-pro-preview');
const rawPrimaryTimeout = parseInt(process.env.GEMINI_PRIMARY_TIMEOUT_MS, 10);
const PRIMARY_TIMEOUT_MS = (!isNaN(rawPrimaryTimeout) && rawPrimaryTimeout >= 10000) ? rawPrimaryTimeout : 20000;
const rawFallbackTimeout = parseInt(process.env.GEMINI_FALLBACK_TIMEOUT_MS, 10);
const FALLBACK_TIMEOUT_MS = (!isNaN(rawFallbackTimeout) && rawFallbackTimeout >= 15000) ? rawFallbackTimeout : 25000;

// Lazy-initialized — created on first call so the module can be required
// before env vars are loaded (e.g. during test setup).
let genAI = null;

function getGenAI() {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new GeminiError(
        'Gemini API key is not configured. Set GEMINI_API_KEY in the environment.',
        500,
        false, // not recoverable — config issue
      );
    }
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return genAI;
}

// ---------------------------------------------------------------------------
// Custom error class for structured Gemini failures
// ---------------------------------------------------------------------------
class GeminiError extends Error {
  /**
   * @param {string} message    — user-friendly error message
   * @param {number} statusCode — HTTP status to return (default 500)
   * @param {boolean} recoverable — was this a transient failure?
   */
  constructor(message, statusCode = 500, recoverable = false) {
    super(message);
    this.name = 'GeminiError';
    this.statusCode = statusCode;
    this.recoverable = recoverable;
  }
}

// ---------------------------------------------------------------------------
// Classify whether an error is recoverable (should trigger fallback)
// ---------------------------------------------------------------------------
function isRecoverableError(err) {
  // Check if error message is a model availability or deprecation issue -> recoverable via fallback
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('no longer available') || msg.includes('models/')) {
    return true;
  }

  // Explicit non-recoverable: bad request, auth, permission
  const nonRecoverableStatuses = [400, 401, 403, 404];
  const status = err?.status || err?.statusCode || err?.code;

  if (typeof status === 'number' && nonRecoverableStatuses.includes(status)) {
    return false;
  }

  // String status codes from the SDK
  const statusStr = String(status).toLowerCase();
  if (['invalid_argument', 'permission_denied', 'unauthenticated', 'not_found'].includes(statusStr)) {
    return false;
  }

  // Check the error message for known non-recoverable patterns
  if (msg.includes('api key') || msg.includes('invalid api') || msg.includes('permission')) {
    return false;
  }

  // Everything else is treated as recoverable:
  // - 429 (rate limit), 500/502/503/504 (transient server errors)
  // - Network timeouts, ECONNRESET, ETIMEDOUT
  // - Unknown errors (safer to retry once than to fail immediately)
  return true;
}

// ---------------------------------------------------------------------------
// Bounded Timeout Promise Wrapper
// ---------------------------------------------------------------------------
function withTimeout(promise, timeoutMs, modelName) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new GeminiError(`Request to model ${modelName} timed out after ${timeoutMs}ms.`, 504, true));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------------------
// Call a single Gemini model — low-level, with timeout
// ---------------------------------------------------------------------------
async function callModel(modelName, timeoutMs, { prompt, systemInstruction, history }) {
  const ai = getGenAI();

  const config = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  const executeCall = async () => {
    let contents;
    if (history && history.length > 0) {
      contents = [...history, { role: 'user', parts: [{ text: prompt }] }];
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    const text = response.text;
    if (!text) {
      throw new GeminiError(
        'Gemini returned an empty response. The model may have filtered the output.',
        502,
        true,
      );
    }
    return { text, model: modelName };
  };

  return withTimeout(executeCall(), timeoutMs, modelName);
}

// ---------------------------------------------------------------------------
// callGemini() — the single shared entry point for ALL Gemini calls.
// Implements the fallback ladder per AGENT_RULES.md rule 7.
// ---------------------------------------------------------------------------
/**
 * @param {object} options
 * @param {string} options.prompt          — the user/system prompt text (required)
 * @param {string} [options.systemInstruction] — optional system-level instruction
 * @param {Array}  [options.history]       — optional chat history for multi-turn
 * @returns {Promise<{ text: string, model: string }>}
 * @throws {GeminiError} with a user-friendly message and HTTP status code
 */
async function callGemini({ prompt, systemInstruction, history }) {
  const startTime = Date.now();

  // --- Step 1: Try the primary model with bounded timeout ---
  try {
    console.log(`[Gemini] Attempting primary model (${PRIMARY_MODEL}, timeout: ${PRIMARY_TIMEOUT_MS}ms)...`);
    const result = await callModel(PRIMARY_MODEL, PRIMARY_TIMEOUT_MS, { prompt, systemInstruction, history });
    const elapsed = Date.now() - startTime;
    console.log(`[Gemini] Primary model ${PRIMARY_MODEL} succeeded in ${elapsed}ms.`);
    return result;
  } catch (primaryErr) {
    const primaryElapsed = Date.now() - startTime;

    // Non-recoverable? Fail fast — do not try fallback.
    if (!isRecoverableError(primaryErr)) {
      console.error(`[Gemini] Primary model ${PRIMARY_MODEL} failed in ${primaryElapsed}ms (non-recoverable):`, primaryErr.message);
      throw primaryErr instanceof GeminiError
        ? primaryErr
        : new GeminiError(
            userFriendlyMessage(primaryErr),
            primaryErr.status || primaryErr.statusCode || 500,
            false,
          );
    }

    console.warn(`[Gemini] Primary model ${PRIMARY_MODEL} failed in ${primaryElapsed}ms (recoverable: ${primaryErr.message}). Initiating fallback model ${FALLBACK_MODEL}...`);
  }

  // --- Step 2: Try the fallback model (bounded timeout, single attempt) ---
  const fallbackStart = Date.now();
  try {
    const result = await callModel(FALLBACK_MODEL, FALLBACK_TIMEOUT_MS, { prompt, systemInstruction, history });
    const fallbackElapsed = Date.now() - fallbackStart;
    const totalElapsed = Date.now() - startTime;
    console.log(`[Gemini] Fallback model ${FALLBACK_MODEL} succeeded in ${fallbackElapsed}ms (total time: ${totalElapsed}ms).`);
    return result;
  } catch (fallbackErr) {
    const totalElapsed = Date.now() - startTime;
    console.error(`[Gemini] Fallback model ${FALLBACK_MODEL} also failed after ${totalElapsed}ms:`, fallbackErr.message);
    throw fallbackErr instanceof GeminiError
      ? fallbackErr
      : new GeminiError(
          'Our AI service is temporarily unavailable. Please try again in a moment.',
          502,
          true,
        );
  }
}


// ---------------------------------------------------------------------------
// Map raw SDK errors to user-friendly messages (no stack traces, no internals)
// ---------------------------------------------------------------------------
function userFriendlyMessage(err) {
  const msg = (err?.message || '').toLowerCase();

  if (msg.includes('api key')) {
    return 'AI service configuration error. Please contact support.';
  }
  if (msg.includes('rate limit') || msg.includes('429') || msg.includes('resource_exhausted')) {
    return 'AI service is busy. Please try again in a moment.';
  }
  if (msg.includes('timeout') || msg.includes('deadline')) {
    return 'AI request timed out. Please try again.';
  }
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('filter')) {
    return 'The AI could not process this request due to content safety filters.';
  }

  return 'Something went wrong with the AI service. Please try again.';
}

module.exports = {
  callGemini,
  GeminiError,
  isRecoverableError, // exported for testing
  // Constants exported for logging/debugging only — not for direct use
  _PRIMARY_MODEL: PRIMARY_MODEL,
  _FALLBACK_MODEL: FALLBACK_MODEL,
};
