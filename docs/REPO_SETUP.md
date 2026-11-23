# تجهيز الـ Repo من الأول (Week 1)

اللي بيعمل الخطوات دي هو الـ Team Lead (حوالي 2 إلى 3 ساعات)، وبعدها الباقي يسحب الـ Repo. كل أمر ممكن تطلب من أي AI tool ينفذه معاك.

> افتراض: اتفقنا نستخدم **Supabase** (قاعدة PostgreSQL + Auth + Storage). لو الفريق رفض، الباقي زي ما هو والتغيير بس في الـ `supabase/`.

## 1) إنشاء الـ Repo

1. على GitHub اعمل Repo اسمه `goldmate` (Private)، وضيف التلاتة كـ Collaborators.
2. على جهازك:

```bash
git clone <repo-url> goldmate
cd goldmate
mkdir -p apps services contracts supabase/migrations docs
```

3. حط في المجلد: `AGENTS.md` في الجذر، وملفات الـ Brief والـ Plan في `docs/` (الـ Brief باسم `GoldMate_Project_Brief.md`).

## 2) إنشاء المشاريع (كل واحد في مجلده)

```bash
# موبايل
npx create-expo-app@latest apps/mobile --template default
# Admin ويب
npm create vite@latest apps/admin -- --template react-ts
# API
mkdir -p services/api && cd services/api && npm init -y && npm i express zod && npm i -D typescript tsx vitest @types/express @types/node && npx tsc --init && cd ../..
# AI service
mkdir -p services/ai && cd services/ai && python -m venv .venv && echo "fastapi\nuvicorn\npydantic\npytest" > requirements.txt && cd ../..
```

بعدها اطلب من الـ AI: "حوّل `apps/mobile` لـ TypeScript strict، وظبط Expo Router وملفات i18n (ar/en) وملف `theme.ts` حسب `AGENTS.md`".

## 3) ملفات لازم تتعمل في الجذر

`.gitignore` (لازم يشمل): `node_modules`, `.env`, `.env.*`, `.venv`, `__pycache__`, `.expo`, `dist`, `build`.

`.env.example` في كل مشروع بأسماء المتغيرات بس، مثلاً للـ API:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GOLD_PRICE_API_URL=
```
القيم الحقيقية تتبعت بينكم بطريقة آمنة (مش على جروب واتساب عام) وماتترفعش على GitHub.

## 4) Supabase

1. اعمل Project في Supabase، واحفظ الـ URL والمفاتيح في `.env` محلياً.
2. ثبّت الـ Supabase CLI، وشغّل `supabase init` في الجذر، وبعدها `supabase migration new init_schema`.
3. اطلب من الـ AI يكتب الـ schema v1 (users/roles, gold_records, prices, app_settings) كـ SQL جوه `supabase/migrations/`، مع تفعيل RLS على كل جدول.
4. كل تغيير في قاعدة البيانات بعد كده = migration جديد. **ماحدش يعدل الجداول من لوحة Supabase بإيده.**

## 5) حماية الفرع الرئيسي (Branch Protection)

على GitHub: Settings ثم Branches ثم Add rule على `main`:
- Require a pull request before merging (وواحد approve على الأقل)
- Require status checks to pass (بعد ما نضيف الـ CI تحت)
- Do not allow bypassing

## 6) CODEOWNERS (مين يراجع إيه)

الملف `.github/CODEOWNERS` (غيّروا الأسماء بأسماء حساباتكم على GitHub):

```
/services/api/        @TL @B2
/services/ai/         @TL @B2
/apps/mobile/         @M1 @M2
/apps/admin/          @M1
/contracts/           @TL
/supabase/            @TL
/AGENTS.md            @TL
```

## 7) CI بسيط (GitHub Actions)

الملف `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  api:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: services/api } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx vitest run
  mobile:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: apps/mobile } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit
  ai:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: services/ai } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt
      - run: pytest
```

(في الأسبوع الأول `pytest` و`vitest` ممكن يفشلوا لو مفيش Tests لسه، فاكتبوا Test واحد بسيط في كل مكان عشان الـ CI يبقى أخضر.)

## 8) إدارة الشغل على GitHub

- اعمل **GitHub Project (Board)** بأعمدة: Backlog / This week / In progress / In review / Done.
- اعمل Issue لكل feature ID من الخطة (F-01 إلى F-26 وAI-01 إلى AI-06)، وحط في عنوانه الـ ID والـ owner والأسبوع.
- Labels مقترحة: `mobile`, `api`, `ai`, `admin`, `bug`, `blocked`.
- ملف `.github/pull_request_template.md` فيه الـ PR checklist من `AGENTS.md` (القسم 5).

## 9) طريقة الشغل بالبرانشز يومياً

```bash
git switch main && git pull
git switch -c feat/F-13-vault-calculations
# ... اشتغل مع الـ AI ...
git add -A && git commit -m "feat(vault): add 8 calculations"
git push -u origin feat/F-13-vault-calculations
# افتح Pull Request على GitHub
```

قواعد سريعة:
- **برانش واحد لكل feature صغير**، وعمره مايزيدش عن 2 إلى 3 أيام.
- كل يوم قبل ما تبدأ: `git switch main && git pull` ثم `git switch <branch> && git merge main`.
- لو حصل Conflict: ماتحذفش الكود كله. اطلب من الـ AI يشرحلك الـ Conflict ويحله، وبعدها شغّل الـ Tests.
- لو بتشغّل أكتر من AI agent في نفس الوقت، كل واحد في برانش مختلف، ويفضل `git worktree add ../goldmate-F13 feat/F-13-...` عشان ماحدش يدوس على شغل التاني.
- بعد ما الـ PR يتدمج: `git branch -d <branch>`.

## 10) أول يوم: Checklist

- [ ] Repo + 4 collaborators + `main` protected
- [ ] `AGENTS.md` و`docs/` موجودين
- [ ] 4 مشاريع بتشتغل (mobile بيفتح على Expo Go، admin بيفتح، api بيرد على `/health`، ai بيرد على `/health`)
- [ ] CI أخضر
- [ ] Supabase Project جاهز و`migrations/init_schema`
- [ ] Board + Issues للأسبوع 1 و2
- [ ] كل واحد عمل Clone وشغّل المشروع على جهازه
