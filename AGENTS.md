# AGENTS.md: rules for every AI coding tool working on GoldMate

Read this file and `docs/GoldMate_Project_Brief.md` before changing anything. If the task is unclear or conflicts with these rules, **ask the person before coding**. Do not guess.

## 1. What this project is

GoldMate is a bilingual (Arabic RTL + English LTR) SaaS app for managing investment gold in Egypt. Users have a Gold Vault; licensed shops publish prices and sell online (pickup only, sandbox payments). The team is 4 students (2 backend, 2 mobile), beginner to intermediate. **Keep code simple, readable, and easy to explain.** Prefer boring, well-known solutions over clever ones.

Feature IDs (F-01 to F-26, AI-01 to AI-06) come from the Brief. Mention the ID in branch names, commit messages and PR titles.

## 2. Repo layout (do not invent new top-level folders)

```
goldmate/
  apps/
    mobile/          Expo (React Native) + TypeScript + Expo Router
    admin/           React + Vite + TypeScript (web Admin Panel)
  services/
    api/             Node.js + Express + TypeScript (main backend)
    ai/              Python + FastAPI (OCR, LLM calls, sentiment, Monte Carlo)
  contracts/
    openapi.yaml     API contract: the single source of truth for requests/responses
  supabase/
    migrations/      SQL migrations (never edit the database by hand)
  docs/              Brief, plan, decisions, design notes
  AGENTS.md
```

Each app/service has its own `package.json` or `requirements.txt`. No shared code between `mobile`, `admin` and `api` except the contract. Generate types from `contracts/openapi.yaml` instead of copying them.

## 3. Golden rules (from the Brief, never break)

1. **AI never calculates money or gold values.** Backend code in `services/api/src/domain/` does all calculations. AI only extracts, classifies and explains.
2. **Human in the loop:** anything AI extracts is shown to the user for review before it is saved.
3. **No hallucinated data:** if a value is not in the input, return `null` and a low confidence, never invent it.
4. Every AI output carries a **confidence** value.
5. **No buy/sell recommendations and no price predictions.** Wording for news: "coincided with", never "caused".
6. Do not send personal data to external AI/LLM services. Use synthetic data for development.
7. Every price shown is labeled **estimate / indicative**.

## 4. Code rules that keep changes safe

### Calculations
- Gold, zakat, making-charge, Price Lock and rating formulas live **only** in `services/api/src/domain/` as pure functions (no database, no HTTP inside).
- Every function there has unit tests (Vitest or Jest). Change a formula only together with its tests.
- Use integers for money (piasters) or a decimal library. Never floating-point math for stored money. Weights in grams with 3 decimals.

### Configuration, never hard-coded
Spread, zakat threshold and rate, review weights, reward settings, making-charge ranges, price-lock duration and daily notification caps are stored in the `app_settings` / range tables and edited by the Admin. Never write these numbers inside the code.

### API contract first
1. Change `contracts/openapi.yaml` first (request, response, errors).
2. Then implement the API, then the client.
3. Never change an existing response shape in a way that breaks the mobile or admin app. Add fields, do not rename or remove them. If you must break it, tell the team and version the endpoint (`/v2/...`).

### Database
- All schema changes are SQL files in `supabase/migrations/`, named with a timestamp. Never edit an old migration after it is merged.
- Every table has row-level security (RLS) enabled. Shop data is isolated by `tenant_id`.

### Languages (i18n)
- **No hard-coded user-facing text.** Use translation keys. Files: `apps/mobile/src/i18n/ar.json` and `en.json` (and the same for `apps/admin`). Add both languages for every new key.
- Layout must work in RTL and LTR. Use logical styles (`start`/`end`, not `left`/`right`).
- AI outputs are written in the user's UI language. User-written content (reviews, shop names) is shown as typed.

### Design tokens
- Colors, spacing, font sizes live in `apps/mobile/src/theme.ts` (and `apps/admin/src/theme.css`). Do not write raw hex colors inside screens.
- Reusable UI pieces go in `apps/mobile/src/components/`. Reuse them before creating new ones.

### Mobile (Expo)
- TypeScript strict mode. One screen per file under `app/` (Expo Router). Keep screens thin: UI only; data calls in `src/api/`, logic in `src/features/<feature>/`.
- When given web/React code from a design tool, **do not paste it**. Rewrite it with React Native components (`View`, `Text`, `Pressable`, `StyleSheet`), the theme file and existing components. Web-only tags (`div`, `span`, CSS classes) must not appear in the mobile app.

### Backend (Node)
- Structure: `routes/` (HTTP only) calls `services/` (business logic) which calls `domain/` (formulas) and `db/` (queries). Validate every request body with a schema (zod).
- Verify the Supabase JWT on every protected route and check the user's role (`individual`, `shop`, `admin`).
- Return errors as `{ "error": { "code": "...", "message": "..." } }`. No stack traces to clients.

### AI service (Python)
- Python 3.11+, type hints everywhere, request/response models with Pydantic, tests with pytest.
- LLM calls always request structured JSON that is validated against a schema. If validation fails, return a clear error, not partial guesses.
- Keep prompts in `services/ai/prompts/` as files, not inside code.

### Security
- Never commit secrets. Use `.env` files (ignored by git) and keep `.env.example` updated with names only.
- Never log tokens, invoice images or personal data.

## 5. Git workflow

- `main` is always working and is protected. **Nobody pushes to `main`.**
- Branch names: `feat/F-13-vault-calculations`, `fix/F-07-price-cache`, `chore/ci-setup`, `docs/plan-update`.
- Small PRs (about 300 changed lines or less, one purpose). Title: `F-13: add 8 vault calculations`.
- A PR needs: CI green, one approving review (TL or the module owner), and its checklist done.
- Commit messages: `type(scope): short description`, e.g. `feat(vault): add average cost per gram`.
- Pull `main` into your branch at least once a day to avoid big conflicts.

### PR checklist
- [ ] Linked feature ID in the title
- [ ] Contract updated if the API changed
- [ ] Tests added or updated (required for anything in `domain/`)
- [ ] Both Arabic and English strings added
- [ ] No secrets, no hard-coded settings
- [ ] I can explain every line of this change without the AI

## 6. Definition of done for a feature

It works on a phone in both Arabic and English; its tests pass; the API contract matches; the person who owns it can explain it; the README or `docs/` note is updated.

## 7. How to work with the person

- Work on one task at a time. Make the smallest change that solves it.
- Before a big change, show a short plan and wait for approval.
- Say which files you will touch. Do not edit unrelated files or reformat whole files.
- If you are unsure about a legal, religious (zakat) or financial rule, say so and ask. Do not present zakat output as a fatwa.
- Run the tests and the type check before saying you are done, and report the results honestly.
