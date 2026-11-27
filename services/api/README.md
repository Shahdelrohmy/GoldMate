# GoldMate API

Node.js + Express + TypeScript. Contract: `../../contracts/openapi.yaml`. Rules: `../../AGENTS.md`.

```bash
cp .env.example .env     # fill SUPABASE_URL and SUPABASE_SECRET_KEY (ask the Team Lead, never commit .env)
npm install
npm run dev              # http://localhost:3000/health
npm test                 # vitest
npm run typecheck        # tsc --noEmit
npm run seed             # fake demo users, prices and 10 gold records (DEV project only, see below)
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

## Seed (demo data)

`npm run seed` fills a **development** Supabase project with fake data: 2 users (`demo.user@goldmate.test`,
`demo.admin@goldmate.test`, same password from `SEED_DEMO_PASSWORD`), 30 days of fake prices, 10 gold records for the
demo user, and a DEMO default Spread. Running it again is safe (records are replaced, prices are added only if the table
is empty, an Admin-set Spread is kept). Never run it against a real project. Data builder: `scripts/seed-data.ts`.
