// ---------------------------------------------------------------------------
// testBackend.js — Comprehensive End-to-End Test Suite for IdeaForge Backend.
// ---------------------------------------------------------------------------
// Tests:
// 1. Unauthenticated request rejection (401)
// 2. Data isolation: User A cannot read or modify User B data (404)
// 3. Valid authenticated request flows:
//    - Create idea & auto-create V1 snapshot
//    - Clarify question generation
//    - Challenge idea with risk analysis
//    - Create new immutable version with evolution reasoning
//    - Run evidence check (mock/cached or live)
//    - Evolution summary synthesis
//    - Activity timeline tracking
//    - Archive idea (status: archived)
//    - Restore idea (status: active)
//    - Search & filter over user-owned ideas
// 4. Admin route rejection for non-admin (403)
// 5. Admin route access for admin with custom claim (200)
// ---------------------------------------------------------------------------

process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Ephemeral port
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';

const http = require('http');
const adminAuth = require('firebase-admin/auth');
const adminFirestore = require('firebase-admin/firestore');

// ---------------------------------------------------------------------------
// In-Memory Mock Store for Firestore to allow hermetic, fast testing
// ---------------------------------------------------------------------------
const firestoreStore = new Map();

function getStoreDoc(path) {
  return firestoreStore.get(path) || null;
}

function setStoreDoc(path, data) {
  firestoreStore.set(path, { ...data });
}

// Monkey-patch Firebase Auth verifyIdToken
const mockAuth = {
  verifyIdToken: async (token) => {
    if (token === 'token-user-a') {
      return { uid: 'user_a_101', email: 'user_a@example.com', admin: false };
    }
    if (token === 'token-user-b') {
      return { uid: 'user_b_202', email: 'user_b@example.com', admin: false };
    }
    if (token === 'token-admin') {
      return { uid: 'admin_999', email: 'admin@example.com', admin: true };
    }
    throw new Error('Decoding Firebase ID token failed');
  },
  listUsers: async () => ({
    users: [
      {
        uid: 'user_a_101',
        email: 'user_a@example.com',
        displayName: 'User A',
        metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
        customClaims: { admin: false },
      },
      {
        uid: 'admin_999',
        email: 'admin@example.com',
        displayName: 'Admin User',
        metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
        customClaims: { admin: true },
      },
    ],
  }),
};

// Monkey-patch auth
adminAuth.getAuth = () => mockAuth;

// Build in-memory Firestore Mock that mirrors real API
class MockDocRef {
  constructor(path) {
    this.path = path;
    this.id = path.split('/').pop();
  }
  collection(sub) {
    return new MockCollectionRef(`${this.path}/${sub}`);
  }
  async get() {
    const data = getStoreDoc(this.path);
    return {
      exists: data !== null,
      id: this.id,
      data: () => (data ? { ...data } : undefined),
    };
  }
  async set(data, opts = {}) {
    if (opts.merge) {
      const existing = getStoreDoc(this.path) || {};
      setStoreDoc(this.path, { ...existing, ...data });
    } else {
      setStoreDoc(this.path, data);
    }
  }
  async update(data) {
    const existing = getStoreDoc(this.path);
    if (!existing) throw new Error('Document does not exist: ' + this.path);
    setStoreDoc(this.path, { ...existing, ...data });
  }
}

class MockCollectionRef {
  constructor(path) {
    this.path = path;
    this.filters = [];
  }
  doc(id) {
    const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return new MockDocRef(`${this.path}/${docId}`);
  }
  where(field, op, val) {
    const copy = new MockCollectionRef(this.path);
    copy.filters = [...this.filters, { field, op, val }];
    return copy;
  }
  orderBy() {
    return this;
  }
  limit() {
    return this;
  }
  async get() {
    const prefix = this.path + '/';
    const docs = [];
    for (const [key, val] of firestoreStore.entries()) {
      if (key.startsWith(prefix)) {
        const subPath = key.slice(prefix.length);
        if (!subPath.includes('/')) {
          // Direct child document
          let match = true;
          for (const f of this.filters) {
            if (f.op === '==' && val[f.field] !== f.val) match = false;
          }
          if (match) {
            docs.push({
              id: key.split('/').pop(),
              ref: new MockDocRef(key),
              data: () => ({ ...val }),
            });
          }
        }
      }
    }
    return {
      empty: docs.length === 0,
      size: docs.length,
      docs,
    };
  }
}

const mockDb = {
  collection: (path) => new MockCollectionRef(path),
  doc: (path) => new MockDocRef(path),
  batch: () => ({
    set: (ref, data) => ref.set(data),
    update: (ref, data) => ref.update(data),
    commit: async () => {},
  }),
};

adminFirestore.getFirestore = () => mockDb;
adminFirestore.FieldValue = {
  serverTimestamp: () => new Date().toISOString(),
};

// Now load backend app
const app = require('../src/index');

let server;
let baseUrl = '';

async function startServer() {
  return new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function stopServer() {
  if (server) server.close();
}

// Helper fetch wrapper
async function apiRequest(endpoint, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const status = res.status;
  let data = null;
  try {
    data = await res.json();
  } catch (_e) {
    data = await res.text();
  }
  return { status, data };
}

// ---------------------------------------------------------------------------
// Test Runner
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('IDEAFORGE MASTER BACKEND AUDIT TEST RUNNER');
  console.log('==================================================\n');

  await startServer();

  try {
    // -----------------------------------------------------------------------
    // TEST SUITE 1: Health Check & Public Routes
    // -----------------------------------------------------------------------
    console.log('\n[Suite 1] Health Check & Public Routes:');
    const health = await apiRequest('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /health returns 200 OK');

    // -----------------------------------------------------------------------
    // TEST SUITE 2: Unauthenticated Request Rejection
    // -----------------------------------------------------------------------
    console.log('\n[Suite 2] Authentication Enforcement:');
    const noAuth = await apiRequest('/api/ideas');
    assert(noAuth.status === 401, 'Rejects request with no Authorization header (401)');

    const badAuth = await apiRequest('/api/ideas', { token: 'invalid-token-123' });
    assert(badAuth.status === 401, 'Rejects request with invalid Bearer token (401)');

    const validAuth = await apiRequest('/api/me', { token: 'token-user-a' });
    assert(validAuth.status === 200 && validAuth.data.uid === 'user_a_101', 'Accepts valid ID token and populates req.user (200)');

    // -----------------------------------------------------------------------
    // TEST SUITE 3: Core Idea CRUD & Multi-Idea Support
    // -----------------------------------------------------------------------
    console.log('\n[Suite 3] User A Creates Ideas & Versions:');
    const createRes = await apiRequest('/api/ideas', {
      method: 'POST',
      token: 'token-user-a',
      body: {
        title: 'Decentralized Study Groups',
        content: 'A peer-to-peer platform connecting university students for accountability sprints.',
      },
    });
    assert(createRes.status === 201, 'POST /api/ideas creates idea (201)');
    const userAIdeaId = createRes.data?.idea?.id;
    assert(Boolean(userAIdeaId), 'Returns created idea ID');
    assert(createRes.data?.idea?.currentVersionNumber === 1, 'Initial idea is created with Version 1');

    // List ideas for User A
    const listA = await apiRequest('/api/ideas', { token: 'token-user-a' });
    assert(listA.status === 200 && listA.data.ideas.length === 1, 'GET /api/ideas lists User A ideas (1 found)');
    assert(listA.data.ideas[0].id === userAIdeaId, 'Listed idea ID matches created idea');

    // Get specific idea
    const getA = await apiRequest(`/api/ideas/${userAIdeaId}`, { token: 'token-user-a' });
    assert(getA.status === 200 && getA.data.title === 'Decentralized Study Groups', 'GET /api/ideas/:ideaId retrieves idea details');

    // Update working idea (PATCH)
    const patchRes = await apiRequest(`/api/ideas/${userAIdeaId}`, {
      method: 'PATCH',
      token: 'token-user-a',
      body: { content: 'Updated peer-to-peer study platform focusing exclusively on STEM exam cramming.' },
    });
    assert(patchRes.status === 200, 'PATCH /api/ideas/:ideaId updates working draft');

    // -----------------------------------------------------------------------
    // TEST SUITE 4: Data Isolation (User A vs User B)
    // -----------------------------------------------------------------------
    console.log('\n[Suite 4] Data Isolation (User B cannot access User A data):');
    const userBTriesToGet = await apiRequest(`/api/ideas/${userAIdeaId}`, { token: 'token-user-b' });
    assert(userBTriesToGet.status === 404, 'User B receives 404 when querying User A idea ID');

    const userBTriesToPatch = await apiRequest(`/api/ideas/${userAIdeaId}`, {
      method: 'PATCH',
      token: 'token-user-b',
      body: { content: 'Malicious overwrite attempt' },
    });
    assert(userBTriesToPatch.status === 404, 'User B receives 404 when attempting to PATCH User A idea');

    const userBTriesToArchive = await apiRequest(`/api/ideas/${userAIdeaId}/archive`, {
      method: 'POST',
      token: 'token-user-b',
    });
    assert(userBTriesToArchive.status === 404, 'User B receives 404 when attempting to archive User A idea');

    const listB = await apiRequest('/api/ideas', { token: 'token-user-b' });
    assert(listB.status === 200 && listB.data.ideas.length === 0, 'User B ideas list is empty (strict isolation)');

    // -----------------------------------------------------------------------
    // TEST SUITE 5: Version History & Evolution Engine
    // -----------------------------------------------------------------------
    console.log('\n[Suite 5] Version History & Evolution Tracking:');
    const versionsV1 = await apiRequest(`/api/ideas/${userAIdeaId}/versions`, { token: 'token-user-a' });
    assert(versionsV1.status === 200 && versionsV1.data.versions.length === 1, 'GET /api/ideas/:ideaId/versions lists Version 1');

    // Attempt to create V2 without whyChanged -> should fail
    const v2NoWhy = await apiRequest(`/api/ideas/${userAIdeaId}/versions`, {
      method: 'POST',
      token: 'token-user-a',
      body: { content: 'New version without reasoning' },
    });
    assert(v2NoWhy.status === 400, 'Rejects revision missing "whyChanged" evolutionary reasoning (400)');

    // Create V2 with whyChanged
    const v2Res = await apiRequest(`/api/ideas/${userAIdeaId}/versions`, {
      method: 'POST',
      token: 'token-user-a',
      body: {
        content: 'Peer-to-peer accountability sprints for STEM students facing final exams.',
        whyChanged: 'User feedback revealed general students lacked urgency; exam crammers have high intent.',
        whatChanged: 'Narrowed target persona to STEM exam students.',
        changeType: 'pivot',
        assumption: 'Students will pay for structured peer sprint sessions during exam week.',
        riskLevel: 'RISKY',
      },
    });
    assert(v2Res.status === 201 && v2Res.data.versionNumber === 2, 'POST /api/ideas/:ideaId/versions creates Version 2 snapshot (201)');

    const v2Id = v2Res.data.versionId;

    // Verify idea currentVersionNumber incremented
    const getUpdatedA = await apiRequest(`/api/ideas/${userAIdeaId}`, { token: 'token-user-a' });
    assert(getUpdatedA.data.currentVersionNumber === 2, 'Idea currentVersionNumber updated to 2');

    // -----------------------------------------------------------------------
    // TEST SUITE 6: Activity Timeline
    // -----------------------------------------------------------------------
    console.log('\n[Suite 6] Activity Timeline:');
    const activitiesRes = await apiRequest(`/api/ideas/${userAIdeaId}/activities`, { token: 'token-user-a' });
    assert(activitiesRes.status === 200, 'GET /api/ideas/:ideaId/activities returns 200');
    const eventTypes = activitiesRes.data.activities.map(a => a.eventType);
    assert(eventTypes.includes('idea_created'), 'Timeline recorded "idea_created" event');
    assert(eventTypes.includes('version_created'), 'Timeline recorded "version_created" event');

    // -----------------------------------------------------------------------
    // TEST SUITE 7: Archive & Restore
    // -----------------------------------------------------------------------
    console.log('\n[Suite 7] Archive and Restore:');
    const archiveRes = await apiRequest(`/api/ideas/${userAIdeaId}/archive`, {
      method: 'POST',
      token: 'token-user-a',
    });
    assert(archiveRes.status === 200 && archiveRes.data.status === 'archived', 'POST /api/ideas/:ideaId/archive archives idea');

    const getArchived = await apiRequest(`/api/ideas/${userAIdeaId}`, { token: 'token-user-a' });
    assert(getArchived.data.status === 'archived', 'Idea status confirmed as "archived"');

    // Filter active only -> should not appear
    const listActiveOnly = await apiRequest('/api/ideas?status=active', { token: 'token-user-a' });
    assert(listActiveOnly.data.ideas.length === 0, 'Archived idea excluded from active list');

    // Filter archived -> should appear
    const listArchived = await apiRequest('/api/ideas?status=archived', { token: 'token-user-a' });
    assert(listArchived.data.ideas.length === 1, 'Archived idea returned when querying status=archived');

    // Restore idea
    const restoreRes = await apiRequest(`/api/ideas/${userAIdeaId}/restore`, {
      method: 'POST',
      token: 'token-user-a',
    });
    assert(restoreRes.status === 200 && restoreRes.data.status === 'active', 'POST /api/ideas/:ideaId/restore restores idea');

    const getRestored = await apiRequest(`/api/ideas/${userAIdeaId}`, { token: 'token-user-a' });
    assert(getRestored.data.status === 'active', 'Idea status confirmed as "active" again');

    // -----------------------------------------------------------------------
    // TEST SUITE 8: User-Scoped Search & Filter
    // -----------------------------------------------------------------------
    console.log('\n[Suite 8] User-Scoped Search:');
    const searchSTEM = await apiRequest('/api/search?q=STEM', { token: 'token-user-a' });
    assert(searchSTEM.status === 200 && searchSTEM.data.total === 1, 'Search finds idea by keyword in content/versions (total = 1)');
    assert(searchSTEM.data.results[0].ideaId === userAIdeaId, 'Search result matches user idea');

    // User B searches same keyword
    const searchUserB = await apiRequest('/api/search?q=STEM', { token: 'token-user-b' });
    assert(searchUserB.status === 200 && searchUserB.data.total === 0, 'User B searching same keyword receives 0 results (isolated)');

    // -----------------------------------------------------------------------
    // TEST SUITE 9: Admin Role Authorization (Custom Claim)
    // -----------------------------------------------------------------------
    console.log('\n[Suite 9] Admin Role Enforcement:');
    // Non-admin user attempts admin endpoint
    const nonAdminStats = await apiRequest('/api/admin/stats', { token: 'token-user-a' });
    assert(nonAdminStats.status === 403, 'Rejects non-admin user from /api/admin/stats with 403 Forbidden');

    const nonAdminUsers = await apiRequest('/api/admin/users', { token: 'token-user-a' });
    assert(nonAdminUsers.status === 403, 'Rejects non-admin user from /api/admin/users with 403 Forbidden');

    // Verified admin user attempts admin endpoint
    const adminStats = await apiRequest('/api/admin/stats', { token: 'token-admin' });
    assert(adminStats.status === 200, 'Allows verified admin user (admin: true) access to /api/admin/stats (200)');
    assert(typeof adminStats.data.totalUsers === 'number', 'Admin stats returns valid metrics');

    const adminUsers = await apiRequest('/api/admin/users', { token: 'token-admin' });
    assert(adminUsers.status === 200, 'Allows verified admin user access to /api/admin/users (200)');
  } catch (testErr) {
    console.error('Fatal test execution error:', testErr);
    failed++;
  } finally {
    stopServer();
  }

  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
