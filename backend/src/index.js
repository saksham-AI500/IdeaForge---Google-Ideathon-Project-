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
    projectId: process.env.FIREBASE_PROJECT_ID || 'ideaforge-a62ba',
  });
} else {
  // Default credentials (Cloud Run / gcloud ADC)
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'ideaforge-a62ba',
  });
}

// ---------------------------------------------------------------------------
// Express app setup
// ---------------------------------------------------------------------------
const app = express();

// Trust proxy for Cloud Run and container ingress routing
app.set('trust proxy', 1);

// Security: Set HTTP headers
app.use(helmet());

// Security: Dynamic origin verification
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      // Default to allowing local development and cloud run subdomains
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Allow localhost/127.0.0.1 in non-production
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed for this origin.'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Health check (unauthenticated — used by Cloud Run)
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ---------------------------------------------------------------------------
// Security: Rate limiting
// ---------------------------------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// ---------------------------------------------------------------------------
// API routes — all routes under /api require authentication.
// ---------------------------------------------------------------------------
app.use('/api', authenticateRequest);

const geminiRoutes = require('./routes/geminiRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const chatRoutes = require('./routes/chatRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api', geminiRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Authenticated user info
app.get('/api/me', (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email || null,
    isAdmin: Boolean(req.user.admin),
  });
});

// 404 handler for undefined API routes
app.use('/api/*all', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.',
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IdeaForge backend listening on 0.0.0.0:${PORT}`);
  });
}

module.exports = app; // for testing
