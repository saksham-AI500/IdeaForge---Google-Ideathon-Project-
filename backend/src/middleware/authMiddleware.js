// ---------------------------------------------------------------------------
// authMiddleware.js — Token verification and role enforcement middleware.
// ---------------------------------------------------------------------------

const { getAuth } = require('firebase-admin/auth');

/**
 * Verifies the Firebase ID token in Authorization: Bearer <token>.
 * Attaches decoded token to req.user.
 */
async function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Ensures the authenticated user has the admin: true custom claim.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.admin !== true) {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

module.exports = {
  authenticateRequest,
  requireAdmin,
};
