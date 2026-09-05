# IdeaForge — Testing Checklist

> Each section corresponds to a workflow stage from PROJECT.md.
> Test cases will be added incrementally as each feature is built.
> Every user-visible interaction must have a named test case here.

---

## Auth

### AUTH-01: Email/password sign-up — happy path
- **Steps:** Go to `/signup`. Enter a valid email, a 6+ character password, and the same password in confirm. Click "Create Account".
- **Expected:** Account is created. User is redirected to `/` (dashboard). Firestore document exists at `users/{uid}/profile/main` with `createdAt` timestamp, `email`, and `provider: "password"`.

### AUTH-02: Email/password sign-up — validation errors
- **Steps:** (a) Submit with empty email → error "Email is required." (b) Submit with password < 6 chars → error about length. (c) Submit with mismatched passwords → error "Passwords do not match." (d) Submit with an already-registered email → error "An account with this email already exists."
- **Expected:** Each error appears in the red error banner. Errors clear when the user starts typing again.

### AUTH-03: Email/password login — happy path
- **Steps:** Go to `/login`. Enter credentials for an existing email/password account. Click "Sign In".
- **Expected:** User is redirected to `/`. Dashboard shows the user's email and "Email/Password" provider badge.

### AUTH-04: Email/password login — wrong credentials
- **Steps:** Enter a valid email with an incorrect password. Click "Sign In".
- **Expected:** Error "Invalid email or password." is shown. User stays on `/login`.

### AUTH-05: Google Sign-In — happy path
- **Steps:** Go to `/login`. Click "Sign in with Google". Complete the Google OAuth popup.
- **Expected:** User is redirected to `/`. Dashboard shows the Google account email and "Google" provider badge. Firestore document exists at `users/{uid}/profile/main` with `provider: "google.com"`.

### AUTH-06: Google Sign-In — popup closed
- **Steps:** Click "Sign in with Google". Close the popup without completing sign-in.
- **Expected:** No error is shown (silent handling). User stays on `/login`.

### AUTH-07: Logout — email/password user
- **Steps:** Sign in via email/password. Click "Sign Out" on the dashboard.
- **Expected:** User is redirected to `/login`. Navigating to `/` redirects back to `/login`.

### AUTH-08: Logout — Google user
- **Steps:** Sign in via Google. Click "Sign Out" on the dashboard.
- **Expected:** Same as AUTH-07 — redirected to `/login`.

### AUTH-09: Auth state persists across refresh
- **Steps:** Sign in (either provider). Reload the page (F5 / Ctrl+R).
- **Expected:** User remains signed in. Dashboard loads without showing the login page.

### AUTH-10: Unauthenticated route protection
- **Steps:** Without signing in, navigate directly to `/` in the browser.
- **Expected:** User is redirected to `/login`.

### AUTH-11: Cross-user data isolation
- **Steps:** Create two test accounts (one email/password, one Google). Sign in as User A → note the UID and Firestore path `users/{uidA}/`. Sign out. Sign in as User B → note the UID and Firestore path `users/{uidB}/`. Open the Firebase Console → Firestore Data tab. Verify: (a) User A's profile document exists only under `users/{uidA}/profile/main`. (b) User B's profile document exists only under `users/{uidB}/profile/main`. (c) Firestore security rules prevent User B from reading `users/{uidA}/...` (test in Rules Playground or via client-side code).
- **Expected:** Each user's data is completely isolated. Cross-user reads/writes are denied by Firestore security rules.


---

## Capture

### CAPTURE-01: Happy path idea submission
- **Steps:** On the dashboard, enter a rough idea (e.g., "An app for tracking habits"). Click "Submit".
- **Expected:** The idea is saved to Firestore under `users/{uid}/ideas/{ideaId}`. The UI transitions to the active idea view. An initial version (V1) is created in the `versions` subcollection.

### CAPTURE-02: Empty idea submission
- **Steps:** Leave the idea input field blank and click "Submit".
- **Expected:** The UI prevents submission. An error message "Idea cannot be empty" is displayed. No Firestore write is attempted.

### CAPTURE-03: Save failure + Retry Save
- **Steps:** Disconnect from the internet. Enter a valid idea and click "Submit".
- **Expected:** The save fails. The input field remains populated with the user's idea. An error message appears with a distinct "Retry Save" button. Reconnecting and clicking retry succeeds.

---

## Clarify

### CLARIFY-01: Gemini generates targeted questions
- **Steps:** Submit a new idea. Wait for Gemini to respond in the conversation UI.
- **Expected:** Gemini responds with 2-3 clarifying questions about the problem, users, and goal (per the prompt template). The response is saved to Firestore under the `conversations/{conversationId}/messages` subcollection.

### CLARIFY-02: Mid-conversation save failure + Retry Save
- **Steps:** During the Clarify conversation, enter a reply. Disconnect from the internet. Click "Send".
- **Expected:** The send fails. The user's typed reply is not cleared from the input box. A "Retry Save" action is shown. Reconnecting and retrying successfully saves the message and gets a response from Gemini.

---

## Challenge

### CHALLENGE-01: Gemini identifies weak assumption
- **Steps:** Complete the Clarify step. Request a challenge (or wait for the automatic challenge prompt).
- **Expected:** Gemini explicitly identifies ONE weak assumption the idea depends on and pushes back directly. The message is persisted to the conversation history.

### CHALLENGE-02: Structured Risk and Disproving Test
- **Steps:** Click "Challenge Me" to trigger a new challenge.
- **Expected:** The response displays a distinct, colored "Risk Level" badge (e.g., High, Medium, Low) and a prominent "Test this:" statement offering a concrete way to disprove the assumption, rendered before the full prose critique.

---

## Revise / Evolve

### EVOLVE-01: Version creation & whyChanged generation
- **Steps:** In the Evolve test UI, create a dummy idea. Enter a previous content, a revised content, and a simulated conversation. Click "Generate whyChanged". Then click "Save Revision".
- **Expected:** Gemini successfully generates a 1-2 sentence summary. The save is successful. A new version document is created in Firestore at `users/{uid}/ideas/{ideaId}/versions/{versionId}` containing the new content, `whyChanged` summary, and a `createdAt` timestamp.

### EVOLVE-02: Parent idea updated
- **Steps:** After saving a revision (EVOLVE-01).
- **Expected:** The parent idea document at `users/{uid}/ideas/{ideaId}` is updated so that `currentContent` matches the new content, and `updatedAt` is refreshed.

### EVOLVE-03: previousVersionId chain integrity
- **Steps:** Create a dummy idea (which creates an initial version). Note its Version ID. Save a revision.
- **Expected:** The newly created version document has a `previousVersionId` field that exactly matches the Version ID of the initial version.

### EVOLVE-04: Retry Save pattern on failure
- **Steps:** Disconnect from the internet or change Firestore rules temporarily to simulate a write failure. Click "Save Revision".
- **Expected:** The UI does not crash or lose the revised text. An error message is shown, and a distinct "Retry Save" button appears. Clicking it after restoring connection/rules successfully saves the version.

### EVOLVE-05: Trivial whitespace/punctuation edits blocked
- **Steps:** Open an idea. Click "Revise Idea". Add a space or comma to the content without changing any words. Click "Save Revision".
- **Expected:** The save is blocked with an error "No meaningful changes detected. Please make substantial edits before saving a new version." No new version is created.

### EVOLVE-06: Edit Idea does not create a version
- **Steps:** Open an idea. Click "Edit Idea". Fix a typo or make a major text change. Click "Save Edit".
- **Expected:** The current idea content is updated in place and the latest version's content is also updated. No new version is added to the timeline, and the evolution engine (whyChanged) is not triggered.

### EVOLVE-07: Version changeType classification
- **Steps:** Open an idea and make a meaningful change via "Revise Idea". Click "Save Revision".
- **Expected:** A new version is created. The new version in the timeline displays a small colored tag next to its version title with exactly one of these values: "Pivot", "Refinement", "Scope narrowed", or "Scope expanded".

### EVOLVE-08: Compare Versions
- **Steps:** In the Evolution History, click "Compare". Select two non-adjacent versions (e.g. V1 and V4). Click "Generate Comparison".
- **Expected:** A dedicated panel displays a short plain-language summary of the net change across that span. Comparing a version to itself gracefully reports no changes instead of calling Gemini.

---

## Ask My Idea

### ASK-01: Grounded Q&A on existing history
- **Steps:** Open an idea that has been revised multiple times (V1, V2, V3). In the "Ask My Idea" input, ask "Why did I add social features?".
- **Expected:** Gemini answers accurately based *only* on the `whyChanged` and content history in the version chain.

### ASK-02: Version chain with only one version (no history yet)
- **Steps:** Open a brand new idea that has never been revised (only V1 exists). Attempt to use "Ask My Idea" to ask "Why did this idea change?".
- **Expected:** The UI handles this gracefully. Either Gemini responds that the idea hasn't changed yet, or the UI indicates that history tracking begins after the first revision.
 
---
