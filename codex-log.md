# Engineering Log

## 2026-08-28 — Phase 1: Backend foundation + persistent journey

- **Objective:** turn the Figma Make React prototype into a persistent application foundation while preserving the existing interface.
- **Files modified:** `.env.example`, `.gitignore`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `server/db.js`, `server/index.js`, `src/api/client.ts`, `src/App.tsx`, `src/components/Nav.tsx`, `src/pages/ApplicationEntry.tsx`, `src/pages/Dashboard.tsx`, `src/pages/SignIn.tsx`, and `vite.config.ts`.
- **Architecture decisions:** use one Node/Express service and a local SQLite database; use signed HTTP-only cookies backed by a `sessions` table; keep frontend server state behind a typed API client; keep UI-only input and loading state in React.
- **Implementation details:** added a deterministic OTP (`123456`) verified by the backend; created/retrieved an application by user and intent to prevent duplicates; preserved `first-ll` and `existing-ll` intents; restored the authenticated user and current application on browser refresh; connected My Journey summary data to the persisted application.
- **Tests run:** `pnpm typecheck`; `pnpm build`; direct API checks for first-LL, existing-LL, duplicate creation, refresh persistence, logout protection; Vite proxy check.
- **Bugs discovered and fixed:** package manifest dependency entries were initially malformed during setup; corrected before dependency installation. TypeScript target did not support `String.replaceAll`; replaced with compatible regular-expression replacements.
- **Known limitations:** no real SMS, passwords, document storage, payment processing, full LL/DL workflow persistence, or production deployment yet.
- **Commit:** `f8153d2` — `Phase 1: add persistent backend and authentication`

## 2026-08-28 — Phase 2: Complete Learner's Licence journey

- **Objective:** port useful LL behavior into Saarthi's persistent Express/SQLite architecture without copying the older vanilla-JS interface or localStorage state model.
- **Files modified:** `server/db.js`, `server/index.js`, `src/api/client.ts`, `src/App.tsx`, `src/pages/ApplicationFlow.tsx`, `src/pages/Dashboard.tsx`, `plan.md`, `progress.md`, `codex-log.md`, and `checklist.md`.
- **Architecture decisions:** application details are persisted as a bounded JSON payload; document statuses, payment attempts, learner-test results, and learner licences use dedicated SQLite tables. The server remains the source of truth.
- **Old-repository behavior adapted:** shared progression, five-question learner quiz/scoring, non-punitive retry copy, demo receipt/reference behavior, print simulation, and a clearly labelled wait state. The old localStorage-only persistence, vanilla-JS renderer, full DL behavior, and camera simulation were intentionally not ported.
- **Implementation details:** payment success is idempotent; a failed payment creates a distinct persisted attempt; document recovery updates the document state; LL issue writes a six-month validity and 30-day eligibility date; the dashboard derives its active phase from the saved journey step.
- **Tests run:** `pnpm typecheck`, `pnpm build`, and API-level full LL happy path plus document, payment-failure/retry, and refresh persistence checks.
- **Bugs fixed:** documents originally advanced the journey after the first ready item; corrected to advance only after all three are ready. Step-only state transitions were initially rejected; corrected to permit validated transitions.
- **Known limitations:** Phase 3 DL work, comprehensive resources/recovery, AI guidance, and real external services are not implemented.

## 2026-08-28 — Phase 3: Complete Driving Licence journey

- **Objective:** complete the DL continuation path using the same Express/SQLite application record and Figma-derived visual language.
- **Files modified:** `server/db.js`, `server/index.js`, `src/api/client.ts`, `src/pages/ApplicationFlow.tsx`, `src/pages/DrivingLicenceFlow.tsx`, `src/pages/Dashboard.tsx`, and the project tracking documents.
- **Architecture decisions:** a `dl_applications` row carries forward relevant LL data without duplicating the user/application; dedicated appointment, driving-test, and driving-licence tables persist DL-only history. Payments are tagged by stage.
- **Implementation details:** existing-LL applications may start DL directly; completed LL applications are gated by the persisted eligibility date. DL payment is idempotent after success; appointment slots are bounded demo inventory; a driving test stores every attempt; delivery advances deterministically from issued to delivered.
- **Tests run:** `pnpm typecheck`, `pnpm build`, clean-database existing-LL happy path, payment failure/retry and duplicate-success protection, unavailable appointment rejection, cancellation/rescheduling, driving-test failure/retest, delivery progression, LL waiting-period gate, and refresh/session persistence.
- **Known limitations:** no real booking, payment, licence creation, postal service, or state/RTO data integration. The full Resources, generalized Help, and AI-guided work remain for Phase 4.
