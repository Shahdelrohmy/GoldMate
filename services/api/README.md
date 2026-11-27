# GoldMate API

Node.js + Express + TypeScript. Contract: `../../contracts/openapi.yaml`. Rules: `../../AGENTS.md`.

```bash
cp .env.example .env     # fill SUPABASE_URL and SUPABASE_SECRET_KEY (ask the Team Lead, never commit .env)
npm install
npm run dev              # http://localhost:3000/health
npm test                 # vitest
npm run typecheck        # tsc --noEmit
```

## Layout

```
src/app.ts          builds the Express app (no listen, easy to test)
src/server.ts       reads env, connects Supabase, listens
src/config/         env validation (zod)
src/middleware/     requireAuth (Supabase token), requireRole, error handler
src/routes/         HTTP only: parse, call a service, send JSON
src/services/       business logic (auth verifier today; prices, vault, zakat next)
src/domain/         PURE formulas with tests: gold.ts, vault.ts (the 8 numbers)
src/db/             Supabase client
tests/              vitest + supertest
```

Add a feature in this order: contract -> domain (with tests) -> service -> route.

Try auth: sign in from the app (or Supabase dashboard), then
`curl -H "Authorization: Bearer <access_token>" http://localhost:3000/me`
