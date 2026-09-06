// ---------------------------------------------------------------------------
// activityLogger.js — Lightweight Activity Timeline Logger for IdeaForge.
// ---------------------------------------------------------------------------
// Records meaningful lifecycle events for ideas:
//   - idea_created
//   - idea_edited
//   - challenge_generated
//   - risk_identified
//   - evidence_checked
//   - revision_completed
//   - version_created
//   - idea_archived
//   - idea_restored
//
// Guaranteed non-blocking: Never throws or breaks the main request flow.
// ---------------------------------------------------------------------------

const { getFirestore, FieldValue } = require('firebase-admin/firestore');

/**
 * Valid event types for the activity timeline.
 */
const VALID_EVENT_TYPES = [
  'idea_created',
  'idea_edited',
  'challenge_generated',
  'risk_identified',
  'evidence_checked',
  'revision_completed',
  'version_created',
  'idea_archived',
  'idea_restored',
];

/**
 * Logs a meaningful lifecycle event to the idea's activity subcollection.
 *
 * @param {object} params
 * @param {string} params.uid        — Authenticated user ID
 * @param {string} params.ideaId     — Idea document ID
 * @param {string} params.eventType  — One of VALID_EVENT_TYPES
 * @param {string} params.summary    — Human-readable 1-sentence summary
 * @param {object} [params.metadata] — Compact optional context (e.g. versionNum, riskLevel)
 * @returns {Promise<string|null>}   — Document ID of logged event or null if failed
 */
async function logActivity({ uid, ideaId, eventType, summary, metadata = {} }) {
  if (!uid || !ideaId || !eventType || !summary) {
    return null;
  }

  try {
    const db = getFirestore();
    const activitiesRef = db
      .collection('users').doc(uid)
      .collection('ideas').doc(ideaId)
      .collection('activities');

    // Clean metadata to avoid undefined or huge blobs
    const sanitizedMeta = {};
    for (const [key, val] of Object.entries(metadata)) {
      if (val !== undefined && val !== null) {
        if (typeof val === 'string') {
          sanitizedMeta[key] = val.slice(0, 300);
        } else if (typeof val === 'number' || typeof val === 'boolean') {
          sanitizedMeta[key] = val;
        }
      }
    }

    const docRef = activitiesRef.doc();
    await docRef.set({
      eventType,
      summary: summary.slice(0, 300),
      metadata: sanitizedMeta,
      timestamp: FieldValue.serverTimestamp(),
    });

    return docRef.id;
  } catch (err) {
    // Non-blocking: failure to record activity must never abort user's primary action
    console.warn(`[ActivityLogger] Non-blocking failure logging ${eventType} for ${ideaId}:`, err.message);
    return null;
  }
}

module.exports = {
  logActivity,
  VALID_EVENT_TYPES,
};
