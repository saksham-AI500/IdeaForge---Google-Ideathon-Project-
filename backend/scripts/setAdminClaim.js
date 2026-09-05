// ---------------------------------------------------------------------------
// setAdminClaim.js — Server-side script to assign admin: true custom claim.
// ---------------------------------------------------------------------------
// Usage: node scripts/setAdminClaim.js <UID> [true|false]
// ---------------------------------------------------------------------------

const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const projectId = process.env.FIREBASE_PROJECT_ID || 'saksham-genai-academy-track-3';
const targetUid = process.argv[2];
const enableAdmin = process.argv[3] !== 'false';

if (!targetUid) {
  console.error('Error: Please provide a target user UID.');
  console.error('Example: node scripts/setAdminClaim.js <UID>');
  process.exit(1);
}

async function setClaimViaRest(token) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-goog-user-project': projectId,
    },
    body: JSON.stringify({
      localId: targetUid,
      customAttributes: JSON.stringify({ admin: enableAdmin }),
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Unexpected non-JSON response from API: ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  try {
    let token;
    try {
      token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
    } catch (e) {
      console.warn('Could not retrieve gcloud token, attempting standard SDK initialization...');
    }

    if (token) {
      await setClaimViaRest(token);
      console.log(`✓ Successfully updated custom claim: { admin: ${enableAdmin} } for UID: ${targetUid}`);
      console.log('Note: The user must refresh their ID token (or re-sign in) to receive the updated claim in their JWT.');
      return;
    }

    console.error('No valid token found. Please run: gcloud auth login');
  } catch (err) {
    console.error('Failed to set custom claim:', err.message);
    process.exit(1);
  }
}

run();
