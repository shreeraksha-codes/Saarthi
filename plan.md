# Sarathi Citizen Journey — Master Plan

## Product and goal

**Product:** Sarathi Citizen Journey

**Goal:** provide a simpler citizen-facing journey from **New Learner's Licence → Full Driving Licence**.

## Scope

Included:

- First Learner's Licence
- Existing Learner's Licence → Full Driving Licence

Out of scope:

- Renewal
- Duplicate licence
- Licence upgrade
- International licence
- Other Parivahan services
- “Something else”

## UX principles

- Government process underneath, consumer-grade simplicity on top
- Mobile-first and accessible to senior citizens
- Lightweight on slow connections
- A clear next action at every stage
- Public Resources; login only when needed
- My Journey is the central personalized dashboard
- AI guidance and the Classic Form share the same application data

## Technical architecture

React 19 + Vite + TypeScript + Tailwind CSS v4, with a Node/Express backend, SQLite persistence, HTTP-only session cookie, and REST API.

## Delivery phases

### Phase 1 — Backend foundation + persistent journey ✅ Complete

- [x] Create the Express + SQLite foundation.
- [x] Add demo OTP authentication with HTTP-only sessions.
- [x] Persist users, applications, and journey events.
- [x] Restore authenticated sessions and My Journey after refresh.

### Phase 2 — Complete Learner's Licence journey ✅ Complete

- [x] Persist LL application fields, State/RTO selection, eligibility, and personal details.
- [x] Implement document statuses/recovery, fitness, review, demo payment success/failure, and submission states.
- [x] Add LL preparation, test, pass/fail, issue/download simulation, and validity information.
- [x] Model the persisted 30-day minimum holding period with a clearly labelled demo fast-forward.

### Phase 3 — Complete Driving Licence journey ✅ Complete

- [x] Build the existing-LL continuation path and carried-forward information.
- [x] Implement DL application, payment, appointment, RTO preparation, and vehicle reminder.
- [x] Implement driving-test pass/fail, retest, issuance, dispatch, and delivery states.

### Phase 4 — Resources + Help/Recovery + AI-guided mode ✅ Complete

- [x] Make Resources content and interactive cards functional.
- [x] Connect help and recovery paths to the persisted application state.
- [x] Add a deterministic guided mode that writes to the same application data as the Classic Form.

### Phase 4.1 — Real LLM guided application with fallback ✅ Complete

- [x] Add a server-only OpenAI Responses API path using structured JSON output.
- [x] Validate the allowlisted extraction result and require confirmation before persistence.
- [x] Preserve deterministic guidance as the missing-key, error, timeout, and invalid-output fallback.

### Phase 5 — Accessibility + visual polish + performance ✅ Complete

- [x] Improve readable typography, focus treatment, touch targets, semantic landmarks, print rules, and responsive navigation/dialog behavior.
- [x] Verify 320px, 360px, 390px, 412px, and desktop responsive layouts with no important horizontal overflow; dialogs and controls remain usable.
- [ ] Verify 125%–200% native browser zoom (the available browser exposes no page-zoom control; effective-width checks passed but are not a substitute).
- [x] Review the production bundle, dependencies, and existing low-connectivity/fallback behavior; avoid adding runtime weight or repeated requests.

### Phase 6 — Final testing + deployment + submission

- [ ] Run complete happy-path and recovery-path testing.
- [ ] Complete mobile and accessibility checks.
- [ ] Deploy, prepare demo materials, and submit.
