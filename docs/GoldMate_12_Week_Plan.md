# GoldMate: 12-Week Plan (4 people)

Based on `GoldMate_Project_Brief.md` v3. No feature is cut. Every F-xx and AI-xx appears in the coverage table (section 5).

## 1. Assumptions (confirm or correct)

- Weeks run **Saturday to Friday**. Week 1 is already running (the plan was written on 22 to 23 Nov 2026), so Week 1 is a short week.
- Hours per person per week: **Month 1 = 60h total, shaped front-heavy (W1 17h, W2 20h, W3 13h, W4 10h)**, **Month 2 = 30h per week (vacation)**, **Month 3 = 20h per week**. That is about 240 + 480 + 320 = **1,040 person-hours** in total. Month 1 keeps the same total as before; the work is just moved earlier so that W3 and W4 stay light for integration, bug fixing and the demo.
- Everyone knows Python basics and NumPy basics. Everyone uses AI tools to write code.
- Weeks 1-4 and 9-12 are study time. If exams fall inside Weeks 9-12, tell me and I will rebalance, because Month 3 is where exams will hurt most.
- AI is not trained. Synthetic data is used for development and prompt testing only; real data is used for evaluation (section 7).

| Week | Dates | Month | Hours/person |
|---|---|---|---|
| W1 | Sat 21 Nov to Fri 27 Nov (short) | 1 | 17 |
| W2 | 28 Nov to 4 Dec | 1 | 20 |
| W3 | 5 Dec to 11 Dec | 1 | 13 |
| W4 | 12 Dec to 18 Dec | 1 | 10 |
| W5 | 19 Dec to 25 Dec | 2 | 30 |
| W6 | 26 Dec to 1 Jan | 2 | 30 |
| W7 | 2 Jan to 8 Jan | 2 | 30 |
| W8 | 9 Jan to 15 Jan | 2 | 30 |
| W9 | 16 Jan to 22 Jan | 3 | 20 |
| W10 | 23 Jan to 29 Jan | 3 | 20 |
| W11 | 30 Jan to 5 Feb | 3 | 20 |
| W12 | 6 Feb to 12 Feb | 3 | 20 |

## 2. Roles

| Label | Person | Main ownership |
|---|---|---|
| **TL** | Backend 1, Team Lead (more experienced) | Architecture, code review, AI-01 Document Reader, orders and payment, AI-05, security |
| **B2** | Backend 2 (new to Node) | Prices and zakat services, AI-04 Goal Agent (Monte Carlo fits NumPy), shop backend, Directory, Activity Score |
| **M1** | Mobile 1 (has built a project before) | Prices/Vault/Zakat screens, AI-03 + AI-06, Goals screen, catalog, checkout, Admin web pages |
| **M2** | Mobile 2 (newest) | Auth/onboarding/calculator screens, AI-02 Notifications, AI-01 screens, QR, Directory, Activity screens |

Pairing rule: M2 and B2 are the two learners. In Weeks 1 to 4 each one gets small, well-scoped tasks and a review from TL or M1 within 24 hours.

## 3. Milestones

| End of | Date | Milestone ("done when") |
|---|---|---|
| W4 | Fri 18 Dec | **MVP demo, no AI:** register/login, live prices (AR/EN), manual Vault, 8 calculations, zakat, calculators, rule-based price check. Re-plan meeting |
| W6 | Fri 1 Jan | AI-01 extracts invoice fields end to end on synthetic data; AI-04 answers a goal with tool calls; shops can register and be approved |
| W8 | Fri 15 Jan | v1 of AI-01, 02, 03, 04, 06; Shop Price Board, QR invoice, Catalog, base Reviews. Re-plan meeting |
| W10 | Fri 29 Jan | **Feature-complete:** orders + sandbox payment, Directory, Activity Score, plans, AI-05 |
| W11 | Fri 5 Feb | Code freeze, evaluation numbers, user tests done, report draft |
| W12 | Fri 12 Feb | Delivery: final report, demo, slides, build |

## 4. Weekly plan

### Month 1: MVP, no AI (front-heavy: W1 17h, W2 20h, W3 13h, W4 10h)

Weekly rhythm for Month 1 (see section 8): **Saturday** the pair agrees the API shapes in `contracts/openapi.yaml` (30 min); mobile builds on mock JSON (`EXPO_PUBLIC_USE_MOCK=true`) while backend builds the real endpoints; **Wednesday** backend merges the week's endpoints; **Thursday** mobile switches mock off and connects; **Friday** 30-minute demo.

Auth uses **Supabase Auth directly from the app** (sign up, log in, reset password). The Node API only checks the Supabase token and the user's role.

| Week | TL | B2 | M1 | M2 | Done when |
|---|---|---|---|---|---|
| **W1** (17h) | Repo, branching, PR rules, CI (`REPO_SETUP.md`); Supabase project + `init_schema` migration (users, roles, gold_records, prices, app_settings) with RLS on; API skeleton + `/health`; **`openapi.yaml` v1 for all W2 endpoints**; seed script | Node/Express + Postgres basics; price-fetch for gold + USD/EGP (spike on the chosen free APIs, check limits); first draft of the price formula with unit tests; start data collection | Expo app, navigation, `theme.ts`, base components (Button, Card, Input, Screen), i18n AR/EN + RTL switch (F-04); mock API layer; Figma Make: 6 to 8 key screens (Arabic first) | Expo setup; login/register + onboarding UI (F-01, F-02) with Supabase Auth client; Figma Make: help with the same screens | App runs on phones in both languages; DB, API and CI are green; W2 contract agreed. **Everyone starts data collection (section 7)** |
| **W2** (20h, heaviest) | Role claim + RLS policies (F-01); **Vault**: Gold Record model + CRUD API (F-08); **the 8 calculations** with tests (F-13); review PRs within 24h | **Price service**: Spread, cache, history, hourly job, manual override (F-07); **Zakat core**: Hijri dates, threshold, reset logic (F-14 backend); **Calculators as pure functions with tests**: Buy/Sell, Break-even, Making Charges (F-15) | Prices screens: live, karat, history chart (F-07); Settings (F-03); **Vault list/detail/manual add + source badges** (F-08, F-09, F-12) on mock first | Auth screens connected, onboarding, profile (F-01, F-02); **Calculators screens** (F-15); starts Vault summary shell | Register, log in, see live prices in AR and EN, add pieces manually, see the 8 numbers (on mock or real) |
| **W3** (13h) | Price Reasonableness Check API + ranges table with first real data (F-16); Admin web v0: login + spread/zakat/ranges settings (F-26); connect Vault + calculators endpoints with the apps | Calculators API endpoints (F-15 HTTP); **Consent, delete account, export data** endpoints (F-05); zakat reminder scheduling | Zakat screen + "I paid" button (F-14); Price Check screen (F-16); connect Prices/Vault to real API | Vault summary screen with the 8 numbers (F-13); Consent, delete, export screens (F-05); connect Auth and Calculators to real API | MVP features all connected to the real backend |
| **W4** (10h, light) | Integration fixes, review backlog; **pre-work for Month 2:** FastAPI skeleton for the AI service, LLM provider decision, OCR test installs | Unit-test gaps (zakat Hijri edge cases, calculators); seed demo data; **pre-work:** Paymob test account | Bug fixing, AR/EN and RTL pass on every screen, UX polish | Bug fixing, test on 2 phones, collect and organize the real invoice photos | **MVP demo + retro + re-plan (2h)** |

### Month 2: vacation, maximum output (30h each)

| Week | TL | B2 | M1 | M2 | Done when |
|---|---|---|---|---|---|
| **W5** | AI-01: FastAPI service, OpenCV preprocessing, OCR spike (EasyOCR vs PaddleOCR), synthetic invoice generator | AI-04: Monte Carlo (NumPy) + tool endpoints (Premium/Spread, Zakat, What-if); pick LLM provider | AI-03 part 1: Vault value-change breakdown (ounce / dollar / Spread) + chart | AI-02 part 1: Expo push registration, notification inbox, portfolio snapshot job; zakat reminders delivered | OCR choice made; Monte Carlo works; breakdown screen; push arrives on a phone |
| **W6** | AI-01: LLM extraction to JSON schema, cross-check with OCR, rule validation | AI-04: agent loop (goal parsing, tool calling, explanation, "I can't calculate that"); Shop backend: registration + license upload + Admin review API (F-18); Premium model + Price Board calc (F-19) | Goals screen (F-17) on AI-04; Admin web: shop review page (F-26); shop-mode app shell | AI-02 part 2: anomaly detection (Z-score) + Importance Score | Invoice to JSON works; goal answered end to end; shop can register and be approved |
| **W7** | AI-01: confidence score, hallucination check, perceptual-hash duplicates; Digital Invoice QR token API (F-20) + Add by QR (F-10) | AI-04: what-if scenarios, guardrails, test on 20 sample goals; Shop Catalog API (F-21) | AI-06 explainer (Price Check in simple words); AI-03 part 2: news collect/classify/link ("coincided", never "caused"); Price Board screen (F-19) | AI-02 part 3: decision engine (instant/digest/ignore, daily cap), AI-written messages, alert types; AI-01 screens: upload + crop + review form (F-11) | Duplicates caught; QR enters Vault as Shop-Verified; alerts decided |
| **W8** | AI-01: evaluation on test set, error analysis, optional System B (VLM) time-boxed spike; base Reviews backend: verified purchase via invoice, Bayesian weighted rating, reply/edit (F-23) | Catalog finish + Admin settings for review weights and rewards (F-26); integration tests across AI endpoints | Catalog screens (browse + shop manage) (F-21); Review screens (write/reply/edit) (F-23) | QR show/scan screens (F-20, F-10); AI-02 polish and all 8 alert types; AI-01 screens polish | **v1 of all AI except AI-05; shops, QR, catalog, base reviews. Re-plan (2h)** |

### Month 3: complete and deliver (20h each)

| Week | TL | B2 | M1 | M2 | Done when |
|---|---|---|---|---|---|
| **W9** | Online orders: state machine, Price Lock, **Paymob test mode**, auto-add to Vault, Digital Invoice from order (F-22) | Directory backend: distance, median Premium comparison, below/at/above labels, Best Deals (F-24) | Checkout flow + order list + shop order management (F-22) | Directory screens: list, filters, badges, "Strong Deals" section (F-24) | Buy a coin with test card (pickup), see it in Vault; Directory works |
| **W10** | AI-05 Review Intelligence: sentiment model, complaint classes, 2-line summary, suspicious-review flags (F-23) | Activity Score engine: rules, caps, consent, monthly job, rewards on/off (F-25); simulated plans Free/Pro/Shop (F-06) | Review Intelligence UI (shop dashboard) + Admin suspicious queue + Top Rated badges | Activity Score and rewards screens (F-25); plans screens (F-06) | **Feature-complete** |
| **W11** | Evaluation numbers (invoices, sentiment); security pass (RLS, tokens, secrets); report technical chapters | Integration tests; seed demo data; deploy backend | Full AR/EN + RTL QA, UX polish, bug bash | User tests with 5 to 8 people + fixes; demo accounts and screenshots | **Code freeze Friday.** Only bug fixes after this |
| **W12** | Final report (technical) | Deployment check, README, API docs | Demo script, slides, backup demo video | Rehearse demo twice, Q&A prep | Delivery. No new features |

## 5. Coverage (nothing dropped)

| ID | Feature | Built in | Main owner |
|---|---|---|---|
| F-01 | Auth | W2 | TL + M2 |
| F-02 | Onboarding | W1-W2 | M2 |
| F-03 | Profile and Settings | W2 | M1 |
| F-04 | Bilingual UI | W1 (setup), every week after | M1 |
| F-05 | Consent, delete, export | W3 | B2 + M2 |
| F-06 | Simulated plans | W10 | B2 + M2 |
| F-07 | Live prices | W2 | B2 + M1 |
| F-08 | Gold Vault | W2 | TL + M1 |
| F-09 | Add manually | W2 | M1 |
| F-10 | Add by Shop QR | W7-W8 | TL + M2 |
| F-11 | Add by AI Invoice Reader | W6-W8 | TL + M2 |
| F-12 | Source badges | W2 | M1 |
| F-13 | The 8 calculations | W2 (screen W3) | TL + M2 |
| F-14 | Zakat | W2-W5 | B2 + M1 + M2 |
| F-15 | Calculators | W2-W3 | B2 + M2 |
| F-16 | Price Reasonableness Check | W3 | TL + M1 |
| F-17 | Goals screen | W6 | M1 |
| F-18 | Shop registration + license review | W6 | B2 + M1 |
| F-19 | Shop profile + Price Board | W6-W7 | B2 + M1 |
| F-20 | Digital Invoice QR | W7-W8 | TL + M2 |
| F-21 | Shop Catalog | W7-W8 | B2 + M1 |
| F-22 | Online orders + sandbox payment | W9 | TL + M1 |
| F-23 | Reviews (base W8, AI layer W10) | W8, W10 | TL + M1 |
| F-24 | Directory, Top Rated, Best Deals | W9-W10 | B2 + M2 + M1 |
| F-25 | Activity Score and rewards | W10 | B2 + M2 |
| F-26 | Admin panel | W3, W6, W8, W10 | TL, M1, B2 |
| AI-01 | Gold Document Reader | W5-W8 | TL (+ M2 screens) |
| AI-02 | Smart Notifications | W5-W8 | M2 |
| AI-03 | Market Movement Explainer | W5-W7 | M1 |
| AI-04 | Goal Planning Agent | W5-W8 | B2 |
| AI-05 | Review Intelligence | W10 | TL (+ M1 UI) |
| AI-06 | Price Reasonableness Explainer | W7 | M1 |

## 6. Risks and "if we fall behind"

Per the brief, nothing is removed without the team's approval. These are the **nearest simplifications to propose first**, in the order I would try them. They keep the feature in the product at a smaller size.

| Risk | When | First simplification (needs team approval) |
|---|---|---|
| W2 is too heavy for the two beginners (it carries the most work) | W2 | Use W3 as the spill-over week: move the calculators screens (F-15 UI) and Vault summary shell to W3. W3 and W4 were kept light on purpose, so there is room |
| Month 1 slower than planned (beginners + study load) | W2-W4 | Move F-05 delete/export and Admin web v0 to W5. Keep prices, Vault, zakat as the MVP core |
| AI-01 accuracy is poor on real invoices | W6-W8 | Ship with mandatory user review and low-confidence warnings; leave System B (VLM) as documented future work |
| TL overloaded (reviews + AI-01 + orders + AI-05) | all | Move AI-05 UI or Admin web pages to M1; move some reviews to M1 |
| AI-03 news linking breaks source terms or is flaky | W7 | Launch with the no-news breakdown only (already built W5); news link added when a source is confirmed |
| AI-02 too heavy for M2 | W6-W8 | B2 helps with the Python job logic after AI-04 core is stable |
| Best Deals needs enough shops to compare | W9-W10 | Seed demo shops; show "based on N shops" label honestly |
| Exams overlap W9-W12 | W9-W12 | Pull F-22 and Directory earlier into spare W8 hours; keep W12 delivery-only |
| Payment test mode friction | W9 | Start the Paymob test-account setup in W5, not W9 |

## 7. Data tasks (start in Week 1)

- **Real invoices:** each person collects 10 or more real invoice or receipt photos from family and nearby shops. Hide personal details. Target is 30 to 50 total by W6. Keep them as a **test set that is never used for tuning**.
- **Making-charge ranges:** visit 2 to 3 shops (or call them) and note making charges for coins and bars by weight. This cannot be faked. Target: first ranges by W3 for the Month 1 Price Check.
- **Synthetic invoices (AI-generated):** use only for development and prompt testing in W5-W6. Do not report accuracy from synthetic data alone. The brief says no model training, so use pre-trained models plus prompts.
- **Review text for sentiment:** collect or write 50 realistic Egyptian-Arabic shop reviews (mix of positive, negative, neutral) for W10 benchmarking.

## 8. Working agreements (because AI writes most of the code)

1. Every change goes through a pull request. TL or M1 reviews within 24 hours.
2. Money and gold formulas (F-13, F-16, F-22, F-23 rating) need unit tests before merge.
3. Everyone must be able to explain every module they own without the AI.
4. No API keys or secrets in the repo. Use environment files.
5. Free LLM tiers may use inputs, so use synthetic data only until real data handling is decided.
6. Friday 30-minute sync each week: what shipped, what is blocked, next week's tasks.
6b. **Backend/mobile rhythm:** Saturday agree the API shapes in `contracts/openapi.yaml` (30 min per pair); mobile builds on mock JSON while backend builds the real endpoints; backend merges by Wednesday; mobile connects on Thursday; Friday demo. Pairs: B2 + M1 (prices, zakat), TL + M1 (Vault), B2 + M2 (calculators, consent), TL + M2 (auth, summary).
7. Re-plan sessions at the end of W4 and W8 (and any time a week misses its "done when").

## 9. Technical choices to confirm in the first spikes

- **Gold price:** primary is a free no-key spot source (gold-api.com) with MetalCharts as backup (free tier about 1,000 requests per month, so poll hourly at most and cache). Verify limits in W1. Manual Admin entry stays as fallback.
- **USD/EGP:** free open exchange-rate data. It is indicative mid-market, not a bank rate, so the Admin Spread and the "estimate" label cover the gap.
- **Payment sandbox:** Paymob (it has a Test mode in its dashboard). Create the test account early.
- **Sentiment (Egyptian Arabic):** candidate `Mostafa911/egyptian-arabic-sentiment-marbertv2` (reported macro F1 about 0.74 on tweets, weaker on sarcasm). Check its license before use, and benchmark on our own 50 reviews. Avoid models licensed non-commercial if you plan to launch later.
- **OCR and LLM:** decide in the W5 spike based on results on invoices, not on reputation.
- **Brief corrections:** F-06 should point to section 8 (not 9); F-17 lives in section 6.2 (not 6.1).

## 10. Questions still open

1. Exact exam dates and graduation delivery dates (demo, defense).
2. Do any shops already agree to help with invoices, price ranges and testing?
3. Which zakat reference: Dar al-Ifta (confirmed in chat); jewelry option stays in Settings.
