# Agent Rules — Read Before Writing Any Code

These are locked decisions from project planning. Treat them as hard constraints, not suggestions. If a task seems to require violating one of these, stop and flag it instead of proceeding.

## Scope boundaries — do not build these

| Feature | Status | Why |
|---|---|---|
| Project Memory Graph (entity/relationship extraction across files) | **Cut from MVP.** Roadmap mention only, in README/comments. | Too complex to build correctly in the available time at the current skill level. A shallow/broken version would hurt the Stability and Authenticity judging pillars more than help. |
| Idea Collision detection (cross-idea similarity) | **Cut from MVP.** Roadmap mention only. | Same reason — not enough time, not the core bet. |
| Assumption Stress Test as a dedicated feature (structured risk/evidence/success-criteria UI) | **Cut as standalone feature.** | Its spirit lives inside the "Challenge" step of the conversation loop already — do not build a separate schema/UI for it. |
| Vector database, embeddings, semantic search | **Not used anywhere in this project.** | "Ask My Idea" works by passing version history directly into the Gemini prompt as context. This is sufficient at this scale — do not introduce retrieval infrastructure. |
| Graph database (Neo4j or similar) | **Not used.** | Same reasoning as above. The `previousVersionId` linked-list field is intentionally the only "graph-like" structure in this project. |
| LangChain, LlamaIndex, Cognee, or any agent framework | **Not used.** | Direct Gemini API calls only. Do not add orchestration frameworks — they add complexity with no benefit at this scope. |
| Google Sign-In | **Added, alongside email/password.** | Codelab explicitly recommends it; evaluation references SSO. Low incremental integration cost — do not treat this as equivalent risk to the cut features above. |

**If you (the agent) think one of these cut features would meaningfully improve the project, say so explicitly and ask — do not scaffold it silently.**

## Non-negotiable security rules

1. The Gemini API key must **never** appear in any frontend code, client bundle, or be sent to the browser. It is stored in Google Cloud Secret Manager and read only server-side (Cloud Run backend).
2. All Gemini API calls are proxied through the backend. The frontend never calls the Gemini API directly.
3. Every Firestore read/write must be scoped to the authenticated user's own UID (`users/{uid}/...`). Write and test Firestore security rules early — not on the last day.
4. No hardcoded credentials, API keys, or secrets anywhere in the repository, including in comments or example config files. Use environment variables / Secret Manager references only.
5. All user text input sent to Gemini should pass basic validation (non-empty, reasonable length bounds) before the API call.
6. Every Gemini call and every Firestore call must have graceful error handling — a failure should show the user a clear message, never an unhandled crash or raw stack trace. This is judged under the "Stability" pillar.
7. Every Gemini call (Clarify, Challenge, Evolution summary, Ask My Idea) must use a fallback ladder: on a recoverable error, retry once against a secondary Gemini model before surfacing an error to the user. Do not fail immediately to the user on a single recoverable failure.
8. Every Firestore write that can fail (idea revision, version creation, message save) must preserve the user's unsaved input on failure, show a specific error, and offer an explicit Retry Save action — never silently lose input or show a generic error with no recovery path.
9. The Cloud Run service must be deployed with the label `dev-tutorial=cloud-run-ai-challenge`. This is a submission requirement, not optional.
10. Every user-visible interaction must have a corresponding named test case in TESTING.md — not just general isolation/stability spot-checks. Build this checklist incrementally as features are built, not all at once at the end.

## Build priorities, in order

If time is short, protect these in this order — do not sacrifice an earlier item to build a later one:

1. Auth (email/password + Google Sign-In) + Firestore + basic Gemini conversation loop, fully working
2. Firestore security rules verified with two separate test accounts across both auth providers (no cross-user data leakage)
3. Gemini fallback ladder and Retry Save built once as shared, reusable patterns — every later feature depends on these existing first
4. **Idea Evolution Engine** (version creation + timeline UI) — this is the entire differentiator for this submission
5. Secret Manager wired correctly, no exposed keys
6. Cloud Run deployment, including the required verification label `dev-tutorial=cloud-run-ai-challenge`
7. "Ask My Idea" grounded Q&A
8. UI polish beyond the version timeline
9. TESTING.md completeness pass (per-interaction test coverage)
10. README with full deployment documentation, demo rehearsal, social post

## Definition of done for this submission

The submission is ready when: a user can sign up (email/password or Google Sign-In), capture an idea, go through Clarify → Challenge, revise the idea, see a new version appear in a clean timeline with a "why changed" summary, ask a grounded question about the idea's history, and all of this runs on a deployed Cloud Run URL — labeled `dev-tutorial=cloud-run-ai-challenge` — with no exposed secrets, verified per-user data isolation, a working Gemini model fallback ladder, working Retry Save behavior on persistence failures, a complete TESTING.md covering every user-visible interaction, and a README with explicit deployment documentation. Nothing beyond this is required and nothing beyond this should be prioritized before this is solid.
