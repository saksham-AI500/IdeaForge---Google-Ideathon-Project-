// ---------------------------------------------------------------------------
// searchRoutes.js — User-Scoped Search & Filter over ideas, versions, & evidence.
// ---------------------------------------------------------------------------
// Strictly queries only the authenticated user's data (users/{uid}/...).
// Simple, performant in-memory matching on retrieved user ideas/versions.
// No external vector DB or heavy indexer required.
// ---------------------------------------------------------------------------

const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const { ideasCollection } = require('../models/firestoreModel');

const router = express.Router();
const db = getFirestore();

/**
 * GET /api/search
 * Query params:
 *   - q: string (search keyword/phrase, required, min 2 chars)
 *   - status: 'active' | 'archived' | 'all' (default: 'all')
 *   - limit: number (default 20, max 50)
 */
router.get('/', async (req, res) => {
  const uid = req.user.uid;
  const q = (req.query.q || '').trim().toLowerCase();
  const statusFilter = (req.query.status || 'all').toLowerCase();
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Search query parameter "q" must be at least 2 characters.' });
  }

  try {
    let ideasQuery = db.collection(ideasCollection(uid));
    if (statusFilter === 'active' || statusFilter === 'archived') {
      ideasQuery = ideasQuery.where('status', '==', statusFilter);
    }

    const ideasSnap = await ideasQuery.get();
    if (ideasSnap.empty) {
      return res.json({ results: [], total: 0 });
    }

    const matchedResults = [];

    // Search across ideas and their versions
    for (const ideaDoc of ideasSnap.docs) {
      const ideaData = ideaDoc.data();
      const title = (ideaData.title || '').toLowerCase();
      const currentContent = (ideaData.currentContent || '').toLowerCase();

      let matchedFields = [];
      let score = 0;

      if (title.includes(q)) {
        matchedFields.push('title');
        score += 10;
      }
      if (currentContent.includes(q)) {
        matchedFields.push('currentContent');
        score += 5;
      }

      // Check versions subcollection for matching historical reasoning or evidence
      const versionsSnap = await ideaDoc.ref.collection('versions').get();
      const matchedVersions = [];

      for (const vDoc of versionsSnap.docs) {
        const vData = vDoc.data();
        const content = (vData.content || '').toLowerCase();
        const whatChanged = (vData.whatChanged || '').toLowerCase();
        const whyChanged = (vData.whyChanged || '').toLowerCase();
        const assumption = (vData.assumption || '').toLowerCase();
        const evidenceSummary = (vData.evidenceSummary || '').toLowerCase();

        const vMatches = [];
        if (content.includes(q)) vMatches.push('content');
        if (whatChanged.includes(q)) vMatches.push('whatChanged');
        if (whyChanged.includes(q)) vMatches.push('whyChanged');
        if (assumption.includes(q)) vMatches.push('assumption');
        if (evidenceSummary.includes(q)) vMatches.push('evidenceSummary');

        if (vMatches.length > 0) {
          matchedVersions.push({
            versionId: vDoc.id,
            versionNumber: vData.versionNumber,
            matchedFields: vMatches,
            whyChanged: vData.whyChanged || null,
            assumption: vData.assumption || null,
            evidenceSummary: vData.evidenceSummary || null,
          });
          score += 3 * vMatches.length;
        }
      }

      if (matchedFields.length > 0 || matchedVersions.length > 0) {
        matchedResults.push({
          ideaId: ideaDoc.id,
          title: ideaData.title || 'Untitled Idea',
          currentContent: ideaData.currentContent || '',
          status: ideaData.status || 'active',
          currentVersionNumber: ideaData.currentVersionNumber || 1,
          matchedFields,
          matchedVersions,
          score,
          updatedAt: ideaData.updatedAt?.toDate?.()?.toISOString() || ideaData.updatedAt || null,
        });
      }
    }

    // Sort by relevance score desc
    matchedResults.sort((a, b) => b.score - a.score);
    const paginated = matchedResults.slice(0, limit);

    return res.json({
      query: q,
      total: matchedResults.length,
      results: paginated,
    });
  } catch (err) {
    console.error('[SearchRoute] Error searching user ideas:', err.message);
    return res.status(500).json({ error: 'Failed to search your ideas.' });
  }
});

module.exports = router;
