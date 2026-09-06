// ---------------------------------------------------------------------------
// Firestore Data Model Reference
// ---------------------------------------------------------------------------
// This file documents the exact Firestore collections and field schemas used
// by IdeaForge. It also exports helper path builders so that the rest of the
// backend always references consistent collection paths.
//
// Data model (from PROJECT.md — do not add collections beyond these):
//
//   users/{uid}/
//     ideas/{ideaId}
//       title:            string
//       currentContent:   string
//       createdAt:        Timestamp
//       updatedAt:        Timestamp
//
//       versions/{versionId}
//         content:            string
//         whatChanged:         string
//         whyChanged:          string
//         previousVersionId:   string | null
//         createdAt:           Timestamp
//
//       conversations/{conversationId}
//         messages:            array of { role: string, text: string, timestamp: Timestamp }
// ---------------------------------------------------------------------------

/**
 * Returns a Firestore document reference path for a user's root document.
 */
function userPath(uid) {
  return `users/${uid}`;
}

/**
 * Returns a Firestore collection path for a user's ideas.
 */
function ideasCollection(uid) {
  return `users/${uid}/ideas`;
}

/**
 * Returns a Firestore document path for a specific idea.
 */
function ideaPath(uid, ideaId) {
  return `users/${uid}/ideas/${ideaId}`;
}

/**
 * Returns a Firestore collection path for an idea's versions.
 */
function versionsCollection(uid, ideaId) {
  return `users/${uid}/ideas/${ideaId}/versions`;
}

/**
 * Returns a Firestore document path for a specific version.
 */
function versionPath(uid, ideaId, versionId) {
  return `users/${uid}/ideas/${ideaId}/versions/${versionId}`;
}

/**
 * Returns a Firestore collection path for an idea's conversations.
 */
function conversationsCollection(uid, ideaId) {
  return `users/${uid}/ideas/${ideaId}/conversations`;
}

/**
 * Returns a Firestore document path for a specific conversation.
 */
function conversationPath(uid, ideaId, conversationId) {
  return `users/${uid}/ideas/${ideaId}/conversations/${conversationId}`;
}

/**
 * Returns a Firestore collection path for an idea's activities.
 */
function activitiesCollection(uid, ideaId) {
  return `users/${uid}/ideas/${ideaId}/activities`;
}

/**
 * Returns a Firestore document path for a specific activity.
 */
function activityPath(uid, ideaId, activityId) {
  return `users/${uid}/ideas/${ideaId}/activities/${activityId}`;
}

module.exports = {
  userPath,
  ideasCollection,
  ideaPath,
  versionsCollection,
  versionPath,
  conversationsCollection,
  conversationPath,
  activitiesCollection,
  activityPath,
};
