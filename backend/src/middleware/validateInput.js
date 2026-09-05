// ---------------------------------------------------------------------------
// validateInput.js — Input validation for text sent to Gemini.
// ---------------------------------------------------------------------------
// Per AGENT_RULES.md rule 5: all user text input sent to Gemini should pass
// basic validation (non-empty, reasonable length bounds) before the API call.
// ---------------------------------------------------------------------------

const MAX_INPUT_LENGTH = 10000; // characters — generous but bounded
const MIN_INPUT_LENGTH = 1;

/**
 * Express middleware factory that validates a text field in req.body.
 *
 * @param {string} fieldName — the body field to validate (default: 'prompt')
 * @param {object} [opts]
 * @param {number} [opts.maxLength] — max character count (default: 10000)
 * @param {number} [opts.minLength] — min character count (default: 1)
 * @returns Express middleware function
 */
function validateTextInput(fieldName = 'prompt', opts = {}) {
  const maxLen = opts.maxLength ?? MAX_INPUT_LENGTH;
  const minLen = opts.minLength ?? MIN_INPUT_LENGTH;

  return (req, res, next) => {
    const value = req.body?.[fieldName];

    if (value === undefined || value === null) {
      return res.status(400).json({
        error: `Missing required field: "${fieldName}".`,
      });
    }

    if (typeof value !== 'string') {
      return res.status(400).json({
        error: `Field "${fieldName}" must be a string.`,
      });
    }

    const trimmed = value.trim();

    if (trimmed.length < minLen) {
      return res.status(400).json({
        error: `Field "${fieldName}" must not be empty.`,
      });
    }

    if (trimmed.length > maxLen) {
      return res.status(400).json({
        error: `Field "${fieldName}" exceeds the maximum length of ${maxLen} characters.`,
      });
    }

    // Store the trimmed value back so downstream handlers use clean input
    req.body[fieldName] = trimmed;
    next();
  };
}

module.exports = { validateTextInput, MAX_INPUT_LENGTH, MIN_INPUT_LENGTH };
