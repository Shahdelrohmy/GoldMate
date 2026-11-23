# GoldMate

A bilingual (Arabic RTL + English LTR) app for managing investment gold in Egypt: Gold Vault, live prices, zakat, calculators, AI helpers, and licensed gold shops with pickup-only online orders (sandbox payments). University graduation project, team of 4.

**Read first:** [`AGENTS.md`](AGENTS.md) (rules for every contributor and every AI tool) and [`docs/GoldMate_Project_Brief.md`](docs/GoldMate_Project_Brief.md).

## Layout

```
apps/mobile/        Expo (React Native) + TypeScript + Expo Router
apps/admin/         React + Vite + TypeScript (web Admin Panel)
services/api/       Node.js + Express + TypeScript
services/ai/        Python + FastAPI (OCR, LLM calls, sentiment, Monte Carlo)
contracts/          openapi.yaml, the API contract (single source of truth)
supabase/           SQL migrations (never edit the database by hand)
docs/               Brief, 12-week plan, Month 1 tasks, repo setup guide
scripts/            bootstrap.sh and env templates
```

`apps/mobile` and `apps/admin` do not exist until the Team Lead runs the bootstrap script below.

## Day 1 (Team Lead)

1. Create a private GitHub repo and push this folder (see `docs/REPO_SETUP.md`, sections 1, 5 and 6).
2. Run `./scripts/bootstrap.sh` to generate the four projects, then commit them on a branch and open a PR.
3. In GitHub: protect `main`, replace the placeholder usernames in `.github/CODEOWNERS`, and create the Board and Issues.
4. Create the Supabase project and apply `supabase/migrations/` (the first migration is a draft to review).

## Everyone else

```bash
git clone <repo-url> goldmate
cd goldmate
git switch -c feat/F-xx-short-name     # one small branch per feature
```

Copy each `.env.example` to `.env` and fill in the values you receive privately. Never commit `.env` files.

Workflow rules (branches, PRs, reviews, tests) are in [`AGENTS.md`](AGENTS.md), sections 4 and 5.
