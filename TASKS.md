# Tasks — Day-by-Day Plan (Updated)

Today: Aug 29, 2026. Deadline: Sep 6, 2026, 11:59 PM IST. Target submission: Sep 5 (buffer day held back).

Updated after a Codelab gap review added: Google Sign-In, per-interaction test coverage (TESTING.md), Gemini model fallback ladder, Retry Save on persistence failure, Cloud Run verification label, and expanded README deployment docs. These are folded into the days below — the plan is compressed, not extended, to keep the Sep 5 submission target.

Check items off as completed. Do not start a later day's tasks while an earlier day's core item is unfinished — see priority order in AGENT_RULES.md.

## Day 1 — Fri Aug 29: Foundation (no feature code yet)
- [ ] Create Firebase project
- [ ] Enable Firebase Authentication: email/password **and Google Sign-In** providers
- [ ] Enable Cloud Firestore
- [ ] Create Gemini API key, store it in Google Cloud Secret Manager (not in any code file)
- [ ] Set up backend skeleton: Node/Express, deployable to Cloud Run
- [ ] Write Firestore security rules per the data model in PROJECT.md; deploy them
- [ ] Draft Google AI Studio Custom Instructions (security constitution: input validation, no hardcoded secrets, per-user isolation, safe error handling, fallback ladder, retry-save)
- [ ] Create empty TESTING.md with section headers matching the workflow stages in PROJECT.md — will be filled in incrementally, not at the end

## Day 2 — Sat Aug 30: Auth + Gemini plumbing
- [ ] Sign up / log in / log out working end-to-end via email/password
- [ ] Google Sign-In working end-to-end
- [ ] One backend endpoint: user message → Gemini API → response → saved to Firestore under `users/{uid}/`
- [ ] Implement the Gemini model fallback ladder in this first endpoint now, so every later endpoint can reuse the same helper function instead of re-implementing it
- [ ] Create two test accounts (one via each auth method); manually verify neither can read the other's data. Fix immediately if this fails.
- [ ] Add test cases for: email/password sign-up, email/password login, Google sign-in, logout, cross-user isolation — to TESTING.md

## Day 3 — Sun Aug 31: Capture → Clarify → Challenge loop
- [ ] Idea capture UI (free text input)
- [ ] Clarify step wired to Gemini (using the shared fallback-ladder helper) with the Clarify prompt template in PROJECT.md
- [ ] Challenge step wired to Gemini with the Challenge prompt template
- [ ] Conversation messages persisted to `conversations/{conversationId}`
- [ ] Implement Retry Save behavior on this first save path (idea capture) — input preserved on failure, clear error, explicit Retry Save action — so the pattern exists to reuse in Day 4
- [ ] No UI polish yet — function first
- [ ] Add test cases for: idea capture, clarify question flow, challenge flow, save failure + retry — to TESTING.md

## Day 4 — Mon Sep 1: Idea Evolution Engine (highest priority day — protect this)
- [ ] `versions` subcollection write logic: new version created on meaningful revision
- [ ] Reuse the Retry Save pattern from Day 3 for version-creation writes
- [ ] Gemini generates `whyChanged` using the Evolution summary prompt template (via fallback-ladder helper)
- [ ] `previousVersionId` linking between versions
- [ ] Timeline UI: vertical list, V1 → V2 → V3, with "why changed" visible per entry
- [ ] This is the core differentiator — do not let other tasks interrupt this day
- [ ] Add test cases for: version creation, whyChanged generation, version-save failure + retry, previousVersionId chain integrity — to TESTING.md

## Day 5 — Tue Sep 2: Ask My Idea + UI polish
- [ ] "Ask My Idea" endpoint: passes version history into Gemini prompt as context, via fallback-ladder helper
- [ ] Polish the version timeline visually — this is the primary demo/screenshot asset
- [ ] Start README skeleton in parallel, including placeholders for the deployment section (APIs, IAM, Firestore rules, Cloud Run steps, verification label)
- [ ] Add test cases for: Ask My Idea with grounded answer, Ask My Idea with no version history yet (empty state) — to TESTING.md

## Day 6 — Wed Sep 3: Deploy + security pass
- [ ] Deploy backend + frontend to Cloud Run
- [ ] Apply the required Cloud Run label: `dev-tutorial=cloud-run-ai-challenge`
- [ ] Re-verify: no hardcoded keys anywhere in the deployed build
- [ ] Re-test Firestore isolation with two accounts (both auth methods) against the deployed version
- [ ] Verify Secret Manager access works correctly in the deployed environment
- [ ] Test the Gemini fallback ladder actually triggers correctly (simulate primary model failure)
- [ ] Test Retry Save actually works end-to-end on the deployed version (simulate a Firestore write failure)
- [ ] Finish TESTING.md — review it end to end and confirm every user-visible interaction in the app has a corresponding test case, not just the ones added incrementally above

## Day 7 — Thu Sep 4: Demo, README, social post
- [ ] Rehearse the 2-minute demo script (see PROJECT.md) with a stopwatch, more than once
- [ ] Finish README with explicit deployment documentation: APIs to enable, Secret Manager IAM permissions, Firestore rules deployment steps, exact Cloud Run deploy commands, the verification label requirement, plus purpose/architecture/security model/confirmed-vs-roadmap features
- [ ] Write and publish the required social post with `#AccelerateAIwithCloudRun`, using a timeline screenshot as the hero image

## Day 8 — Fri Sep 5: Buffer + early submission
- [ ] Fix anything that broke during rehearsal
- [ ] Final check: Cloud Run label present, TESTING.md complete, README deployment section accurate against the actual deployed steps
- [ ] Submit today — do not wait for the Sep 6 deadline

## Sat Sep 6: Slack day
- [ ] Only touch the project if something is actively broken. No new features.

---

## Status tracker

| Component | Status |
|---|---|
| Firebase Auth (email/password) | Not started |
| Firebase Auth (Google Sign-In) | Not started |
| Firestore + security rules | Not started |
| Secret Manager | Not started |
| Gemini conversation loop | Not started |
| Gemini fallback ladder | Not started |
| Retry Save on persistence failure | Not started |
| Idea Evolution Engine | Not started |
| Ask My Idea | Not started |
| Cloud Run deployment | Not started |
| Cloud Run verification label | Not started |
| AI Studio Custom Instructions | Not started |
| TESTING.md (per-interaction coverage) | Not started |
| README (with deployment docs) | Not started |
| Social post | Not started |
| Submission | Not started |
