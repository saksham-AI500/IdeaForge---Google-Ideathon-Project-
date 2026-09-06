// ---------------------------------------------------------------------------
// adminRoutes.js — Privileged Admin Endpoints (protected by requireAdmin).
// ---------------------------------------------------------------------------

const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply requireAdmin to all routes in this router
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Returns high-level system overview stats.
 */
router.get('/stats', async (req, res) => {
  try {
    const auth = getAuth();
    const db = getFirestore();

    const listUsersResult = await auth.listUsers(1000);
    const totalUsers = listUsersResult.users.length;
    const adminUsers = listUsersResult.users.filter(u => u.customClaims?.admin === true).length;

    return res.json({
      totalUsers,
      adminUsers,
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
    });
  } catch (err) {
    console.error('Error in GET /api/admin/stats:', err.message);
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

/**
 * GET /api/admin/users
 * Returns a list of all users with metadata and uploaded file counts.
 */
router.get('/users', async (req, res) => {
  try {
    const auth = getAuth();
    const storage = getStorage();

    // 1. List users from Firebase Auth
    const listUsersResult = await auth.listUsers(100);
    const authUsers = listUsersResult.users;

    // 2. Fetch storage bucket to count files per user
    let bucket = null;
    try {
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` : null);
      if (bucketName) {
        bucket = storage.bucket(bucketName);
      }
    } catch (_e) {
      // Storage bucket optional/fallback
    }

    // 3. Construct user summaries
    const users = await Promise.all(
      authUsers.map(async (userRecord) => {
        let fileCount = 0;

        if (bucket) {
          try {
            const [files] = await bucket.getFiles({
              prefix: `users/${userRecord.uid}/`,
              autoPaginate: false,
            });
            fileCount = files.length;
          } catch (_err) {
            // Bucket might not have files or permission
          }
        }

        return {
          uid: userRecord.uid,
          email: userRecord.email || 'No email provided',
          displayName: userRecord.displayName || null,
          createdAt: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          isAdmin: Boolean(userRecord.customClaims?.admin),
          fileCount,
        };
      })
    );

    res.json({ users });
  } catch (err) {
    console.error('Error in GET /api/admin/users:', err.message);
    res.status(500).json({ error: 'Failed to retrieve users list' });
  }
});

/**
 * GET /api/admin/users/:uid/ideas
 * Returns all ideas belonging to a user (admin audit view).
 */
router.get('/users/:uid/ideas', async (req, res) => {
  const { uid } = req.params;
  try {
    const db = getFirestore();
    const snap = await db.collection('users').doc(uid).collection('ideas').get();
    const ideas = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt || null,
    }));

    res.json({ uid, ideas });
  } catch (err) {
    console.error(`Error in GET /api/admin/users/${uid}/ideas:`, err.message);
    res.status(500).json({ error: 'Failed to retrieve user ideas' });
  }
});

/**
 * GET /api/admin/users/:uid/files
 * Returns a list of all uploaded files for a specific user.
 */
router.get('/users/:uid/files', async (req, res) => {
  const { uid } = req.params;
  try {
    const storage = getStorage();
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` : null);
    if (!bucketName) {
      return res.json({ uid, files: [] });
    }

    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({
      prefix: `users/${uid}/`,
    });

    const fileList = files.map((file) => {
      const fileName = file.name.replace(`users/${uid}/`, '');
      return {
        name: fileName,
        fullPath: file.name,
        size: Number(file.metadata.size || 0),
        contentType: file.metadata.contentType || 'application/octet-stream',
        updated: file.metadata.updated || file.metadata.timeCreated,
      };
    });

    res.json({ uid, files: fileList });
  } catch (err) {
    console.error(`Error in GET /api/admin/users/${uid}/files:`, err.message);
    res.status(500).json({ error: 'Failed to retrieve user files' });
  }
});

module.exports = router;
