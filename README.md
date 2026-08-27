# Saarthi Citizen Journey

Saarthi is a hackathon prototype for a simpler **Learner's Licence → Driving Licence** journey. It is an independent, simulated experience: it does not connect to Parivahan, an RTO, payment providers, OTP/SMS services, or government licence systems.

## Run locally

1. Copy `.env.example` to `.env` and set local values as needed. Do not commit `.env`.
2. Install dependencies with `pnpm install`.
3. Run `pnpm dev`.
4. Open the Vite URL shown in the terminal. The demo OTP is `123456`.

`pnpm dev` runs Vite on port 8443 and Express on port 3001. Vite proxies `/api` requests to Express only in development.

## Production architecture

One Express service serves both the built React/Vite frontend and `/api/*` routes. SQLite is stored at `DATABASE_PATH`; use persistent storage in production because an ephemeral filesystem loses applications and sessions on restart.

Build and run:

```sh
pnpm install --frozen-lockfile
pnpm build
NODE_ENV=production PORT=3000 DATABASE_PATH=/var/data/saarthi.db SESSION_SECRET=replace-with-a-long-random-secret pnpm start
```

The deployment health endpoint is `GET /api/health`. In production, the same origin serves the frontend and API, so no CORS configuration or frontend API URL is required.

## Render recommendation

Render is suitable as a single Node web service when provisioned with a persistent disk.

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Start command: `pnpm start`
- Health-check path: `/api/health`
- Environment: `NODE_ENV=production`, `SESSION_SECRET` (a long random value), `DATABASE_PATH=/var/data/saarthi.db`, and optionally `OPENAI_API_KEY` / `OPENAI_MODEL`.
- Attach a persistent disk mounted at `/var/data`. Do not use Render's ephemeral filesystem for the SQLite database.

`OPENAI_API_KEY` is server-only. If it is absent or the provider is unavailable, the guided application continues using the built-in deterministic fallback. Never put keys in Vite environment variables or client code.

## Checks

```sh
pnpm typecheck
pnpm build
node --check server/index.js
```
