# IdeaForge

> "Most AI tools help you generate an idea. This one helps you watch an idea get better — and remembers why."

IdeaForge is a private AI workspace that helps a user develop a rough idea through Gemini-guided conversation. Instead of treating the conversation as disposable, IdeaForge automatically preserves *why* the idea changed over time, capturing the insight that caused a pivot and preserving it as structured, navigable history via the **Idea Evolution Engine**.

Built for the Google Gen AI Academy APAC Cohort 3 — Ideathon Prototype Submission.

---

## 🏗 Architecture Overview

| Technology | Role |
|---|---|
| **Frontend** | React (Vite) + Firebase Auth (Email/Password & Google Sign-In) |
| **Backend** | Node.js / Express (Hosted on Cloud Run) |
| **Database** | Cloud Firestore (Client-side reads, Backend proxy writes) |
| **AI** | Gemini API (Multi-turn chat, Grounded Q&A, Summarization) |
| **Security** | Google Cloud Secret Manager (API Keys) |

### 🔒 Security Model

1. **Authentication:** All users authenticate via Firebase Auth.
2. **Data Isolation:** All data in Firestore is scoped to `users/{uid}/...`. Strict Firestore Security Rules (`request.auth.uid == uid`) ensure absolute tenant isolation. Users cannot read or write data outside their own path.
3. **API Key Protection:** The Gemini API key is *never* exposed to the frontend. All Gemini interactions are securely proxied through the Node.js backend. In production, the key is stored in Google Cloud Secret Manager.

---

## ✅ Confirmed Features vs 🗺 Roadmap

**Confirmed (Built for MVP)**
- **Capture:** User enters a raw, initial idea.
- **Clarify:** Gemini asks 2–3 targeted clarifying questions about problem/users/goal.
- **Challenge:** Gemini identifies ONE weak assumption in the idea and pushes back.
- **Revise:** User updates the idea based on the challenge.
- **Idea Evolution Engine:** Meaningful changes are automatically versioned. Gemini generates a 1-2 sentence `whyChanged` summary based on the conversation.
- **Ask My Idea:** Grounded Q&A over the idea's version history, fully answered by Gemini using the structured timeline as context.
- **Retry Save Protocol:** Non-destructive persistence failure recovery. If a save fails, user inputs are retained with an explicit "Retry Save" option.
- **Gemini Fallback Ladder:** Automatic retries on recoverable 5xx/429 errors using a secondary fallback model.

**Roadmap (Future Enhancements)**
- **Project Memory Graph:** Visualizing interconnected ideas and shared themes across multiple distinct projects.
- **Idea Collision:** AI-driven suggestions combining two separate saved ideas into a single novel concept.

---

## 🛠 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Authentication (Email/Password & Google) and Firestore enabled.

### 2. Environment Variables
**Backend (`backend/.env`):**
```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json
```
*(Place your downloaded Firebase Admin SDK service account JSON in the backend root as `service-account.json`)*

**Frontend (`frontend/.env`):**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run the App
```bash
# Terminal 1 (Backend)
cd backend
npm install
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm install
npm run dev
```

---

## 🚀 Cloud Run Deployment Guide

This project must be deployed to Google Cloud Run. Follow these exact steps to deploy securely from scratch.

### 1. Enable Required Google Cloud APIs
In your Google Cloud Console, enable the following APIs:
- Cloud Run API (`run.googleapis.com`)
- Secret Manager API (`secretmanager.googleapis.com`)
- Cloud Build API (`cloudbuild.googleapis.com`)
- Artifact Registry API (`artifactregistry.googleapis.com`)
- Generative Language API (`generativelanguage.googleapis.com`)

### 2. Configure Secret Manager & IAM Permissions
You must store your Gemini API key in Secret Manager so the backend can access it securely.

1. **Create the Secret:**
   ```bash
   echo -n "your_gemini_api_key" | gcloud secrets create GEMINI_API_KEY --data-file=-
   ```
2. **Grant IAM Permissions:**
   The default Compute Engine service account (which Cloud Run uses by default) must be granted permission to read the secret:
   ```bash
   # Get your project number
   PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
   
   # Grant the Secret Accessor role
   gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

### 3. Deploy Firestore Security Rules
Ensure cross-user isolation is enforced in production. Run this from the root of the repository (where your `firebase.json` and `firestore.rules` are located):
```bash
firebase deploy --only firestore:rules
```

### 4. Exact Cloud Run Deployment Steps
To deploy the backend to Cloud Run, execute the following from the `backend/` directory:

```bash
gcloud run deploy ideaforge-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --update-labels="dev-tutorial=cloud-run-ai-challenge"
```

> **⚠️ CRITICAL: Verification Label**
> The flag `--update-labels="dev-tutorial=cloud-run-ai-challenge"` applies the mandatory verification label to the Cloud Run service. The submission will not be validated without this exact label applied to the deployed service.

Once the backend is deployed, copy the resulting Service URL.
1. Update `frontend/src/api.js` (or your frontend `.env`) to point to this Cloud Run URL instead of `http://localhost:8080`.
2. Build the frontend (`npm run build`).
3. Deploy the frontend to Firebase Hosting (`firebase deploy --only hosting`).
