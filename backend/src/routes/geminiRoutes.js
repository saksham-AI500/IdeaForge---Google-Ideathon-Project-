// ---------------------------------------------------------------------------
// geminiRoutes.js — Gemini proxy endpoints.
// ---------------------------------------------------------------------------
// All routes in this file are mounted under /api (which already requires
// authentication via the authenticateRequest middleware in index.js).
//
// The frontend NEVER calls the Gemini API directly — only through these
// endpoints. The Gemini API key exists only in backend env vars / Secret
// Manager — it is not in any frontend code or bundle.
// ---------------------------------------------------------------------------

const express = require('express');
const { callGemini, GeminiError } = require('../services/geminiHelper');
const { validateTextInput } = require('../middleware/validateInput');
const { IDEAFORGE_SYSTEM_INSTRUCTION } = require('../services/systemPrompt');

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/gemini/chat
// ---------------------------------------------------------------------------
// Generic Gemini proxy endpoint. Accepts a prompt (required), optional
// systemInstruction, and optional history array for multi-turn conversations.
//
// This is the single entry point for all Gemini calls from the frontend.
// Specific conversation logic (Clarify, Challenge, Evolution summary, etc.)
// will be implemented in later prompts by building on top of callGemini().
//
// Request body:
//   { prompt: string, systemInstruction?: string, history?: array }
//
// Response (success):
//   { text: string, model: string }
//
// Response (error):
//   { error: string }
// ---------------------------------------------------------------------------
router.post(
  '/gemini/chat',
  validateTextInput('prompt'),
  async (req, res) => {
    const { prompt, systemInstruction, history } = req.body;

    // Optional: validate history if provided
    if (history !== undefined) {
      if (!Array.isArray(history)) {
        return res.status(400).json({ error: 'Field "history" must be an array.' });
      }
      // Validate each history entry has required shape
      for (let i = 0; i < history.length; i++) {
        const entry = history[i];
        if (!entry.role || !entry.parts || !Array.isArray(entry.parts)) {
          return res.status(400).json({
            error: `Invalid history entry at index ${i}: each entry must have "role" (string) and "parts" (array).`,
          });
        }
      }
    }

    try {
      const result = await callGemini({
        prompt,
        systemInstruction: IDEAFORGE_SYSTEM_INSTRUCTION,
        history: history || undefined,
      });

      return res.json({
        text: result.text,
        model: result.model,
      });
    } catch (err) {
      // GeminiError has a clean user-friendly message and status code.
      // Any other error gets a generic 500 response — never expose internals.
      if (err instanceof GeminiError) {
        return res.status(err.statusCode).json({ error: err.message });
      }

      console.error('[GeminiRoute] Unexpected error:', err.message);
      return res.status(500).json({
        error: 'An unexpected error occurred. Please try again.',
      });
    }
  },
);

module.exports = router;
