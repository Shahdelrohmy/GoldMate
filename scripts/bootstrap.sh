#!/usr/bin/env bash
# Generates the four projects. Run once, by the Team Lead, from anywhere:
#   ./scripts/bootstrap.sh
# Needs: Node 20+, npm, Python 3.11+. On Windows use Git Bash or WSL.
# Safe to re-run: it skips anything that already exists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== 1/4 mobile (Expo) =="
if [ ! -f apps/mobile/package.json ]; then
  mkdir -p apps
  npx create-expo-app@latest apps/mobile --template default --yes
fi
cp -n scripts/env/mobile.env.example apps/mobile/.env.example

echo "== 2/4 admin (Vite + React + TypeScript) =="
if [ ! -f apps/admin/package.json ]; then
  mkdir -p apps
  npm create vite@latest apps/admin -- --template react-ts
  (cd apps/admin && npm install)
fi
cp -n scripts/env/admin.env.example apps/admin/.env.example

echo "== 3/4 api (Node + Express + TypeScript) =="
mkdir -p services/api
(
  cd services/api
  [ -f package.json ] || npm init -y > /dev/null
  npm install express zod
  npm install -D typescript tsx vitest @types/express @types/node
  [ -f tsconfig.json ] || npx tsc --init
)

echo "== 4/4 ai (Python + FastAPI) =="
mkdir -p services/ai
(
  cd services/ai
  [ -f requirements.txt ] || printf 'fastapi\nuvicorn\npydantic\npytest\n' > requirements.txt
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
)

cat <<'MSG'

Done. Next steps:
  1. In apps/mobile: ask your AI tool to enable TypeScript strict mode, set up i18n (ar/en), and create src/theme.ts, following AGENTS.md.
  2. In services/api: add a /health route and one passing test so CI is meaningful.
  3. In services/ai: add a /health route and one pytest test.
  4. git switch -c chore/bootstrap-projects && git add -A && git commit, then open a PR.
MSG
