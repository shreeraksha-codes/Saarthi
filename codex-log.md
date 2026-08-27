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
