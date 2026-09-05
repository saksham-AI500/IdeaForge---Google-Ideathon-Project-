const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { initializeApp, cert } = require('firebase-admin/app');
const { authenticateRequest } = require('./middleware/authMiddleware');

// Load environment variables from .env (local dev only; on Cloud Run, use Secret Manager)
dotenv.config();

const path = require('path');

// ---------------------------------------------------------------------------
// Firebase Admin SDK initialization
// ---------------------------------------------------------------------------
// In production (Cloud Run), use GOOGLE_APPLICATION_CREDENTIALS or the
// default service account. In local dev, set FIREBASE_SERVICE_ACCOUNT_KEY_PATH
// to a service-account JSON file path.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
let serviceAccountKey = null;

if (serviceAccountPath) {
  try {
    const fullPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);
    const key = require(fullPath);
    if (key && key.client_email && key.private_key) {
      serviceAccountKey = key;
      console.log('Firebase Admin initialized with service account:', key.client_email);
    }
  } catch (err) {
    console.warn('Could not load service account from path:', serviceAccountPath, err.message);
  }
}

if (serviceAccountKey) {
  initializeApp({
    credential: cert(serviceAccountKey),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
} else {
  // Default credentials (Cloud Run / gcloud ADC)
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

// Security: Set HTTP headers
app.use(helmet());

// Security: Strict CORS
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// ---------------------------------------------------------------------------
// Health check (unauthenticated — used by Cloud Run)
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ---------------------------------------------------------------------------
// Security: Rate limiting
// ---------------------------------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// ---------------------------------------------------------------------------
// API routes — all routes under /api require authentication (middleware above).
// ---------------------------------------------------------------------------
app.use('/api', authenticateRequest);

const geminiRoutes = require('./routes/geminiRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api', geminiRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Authenticated user info (useful for debugging / frontend to confirm auth)
app.get('/api/me', (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email, isAdmin: Boolean(req.user.admin) });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`IdeaForge backend listening on port ${PORT}`);
});

module.exports = app; // for testing
