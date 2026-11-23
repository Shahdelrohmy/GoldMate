# GoldMate: Project Brief (v3, for AI planning tools)

## 0. Instructions to the AI reading this

You are helping a student team plan and build this project. Read the whole document before answering.

1. **Do not drop any feature.** Every feature below is in scope. There is no cut list. If the plan does not fit in 3 months, say which part is at risk, propose the nearest simplification or a move to Future Scope, and **ask the team before removing anything**.
2. **Do not assume anything that is not written here.** Items marked `[INFERRED]` were added by the brief writer and need the team's confirmation. If something is unclear, ask. The open questions are listed in section 14.
3. Include **the plain/ordinary features** (auth, settings, consent, admin screens) in every plan, not only the exciting AI ones.
4. Respect the golden rule: **AI understands, extracts and explains. The Backend calculates and validates. The user reviews before anything is saved.**
5. All prices and numbers in examples are illustrative. Nothing here is investment advice.

## 1. Project summary

**GoldMate** is a SaaS platform for managing investment gold in **Egypt** (gold coins "جنيهات", bars "سبائك", and jewelry "مشغولات").

- Every user has a digital **Gold Vault** containing every piece they bought. The app computes its value, profit and zakat, explains the market in simple language, and helps plan a gold-related goal.
- **Licensed gold shops** publish their prices, sell online (pickup only), and receive reviews.
- Egypt-specific terms: **المصنعية** (making charge), **النصاب** (zakat threshold), **الحول** (Hijri-year holding period), **عيار** (karat: 24/21/18).

## 2. Context and constraints

| Item | Value |
|---|---|
| Type | University graduation project; may become a real product and launch after graduation |
| Duration | 3 months |
| Team | 4 people: 2 Backend + 2 Mobile. Skill level: beginner to intermediate |
| AI coding tools | Allowed and expected for writing code |
| Languages | Arabic (RTL) and English (LTR) from day one |
| Platforms | Mobile app (React Native / Expo) + simple web Admin Panel |
| Payments | **Sandbox/test mode only.** No real money in the project |
| AI models | Free, ready-made models. No training |
| Scope policy | No feature is cut. Re-plan after Month 1 because new needs may appear |

## 3. Team and timeline model

- **Month 1: MVP essentials, no AI.** The goal is a working core: auth, i18n, prices, Vault (manual), the 8 calculations, zakat, calculators, rule-based price check. Prefer simple, solid work.
- **Month 2: team vacation, maximum capacity.** All four members work in parallel. **Every AI module has exactly one owner**, who builds it end to end (Python service + its screen). Shop-side features are built here too as far as capacity allows.
- **Month 3: remaining features, integration, evaluation, report, delivery.**
- **After Month 1, re-order the plan.** Any Month 1 feature that is simple and AI-related may be pulled into Month 1 only if it does not slow the MVP.

### Suggested AI module owners (Month 2)

| Owner | Module |
|---|---|
| Backend 1 | AI-01 Gold Document Reader (heaviest: OCR, validation, duplicate detection) |
| Backend 2 | AI-04 Goal Planning Agent (Monte Carlo, tool calling) |
| Mobile 1 | AI-03 Market Movement Explainer + AI-06 Price Reasonableness Explainer |
| Mobile 2 | AI-02 Smart Notifications |
| Whoever has capacity | AI-05 Review Intelligence (Month 3, optional layer, see F-23) |

## 4. User roles

- **Individual User:** vault, zakat, calculators, AI features, buying from shops, writing reviews.
- **Gold Shop (licensed only):** profile, Live Price Board, products for sale online, Digital Invoice with QR, receives reviews and replies to them. License is reviewed by the Admin.
- **Admin:** reviews shops; manages zakat threshold and rate, Default Spread, price sources, news sources, Making Charge Ranges, review and reward settings; monitors suspicious reviews.

## 5. Core formulas (computed by the Backend, never by AI)

- `gram_24 = (ounce_price_USD × USD_to_EGP) ÷ 31.1035`
- `gold_value = weight × (karat / 24) × gram_24`
- Zakat: threshold **85 g of 24K**, rate **2.5%**, Hijri-year holding period (resets if holdings fall below the threshold).
- Price source for the MVP: free external API for ounce price and USD/EGP, then the formula above, plus an Admin-configurable **Spread**. **Manual Admin entry is the fallback.** Prices are always labeled "indicative / estimate". No confirmed free local Egyptian source exists.

## 6. Features

Legend: `[SPEC]` = from the team's original description. `[INFERRED]` = added, confirm with team.

### 6.1 Foundation

| ID | Feature | Notes |
|---|---|---|
| F-01 | Auth: register, login, logout, password reset `[INFERRED]` | Roles: Individual, Shop, Admin |
| F-02 | Onboarding `[INFERRED]` | Choose role/mode, language, short intro |
| F-03 | Profile and Settings `[INFERRED]` | Language, zakat option for jewelry, notification preferences |
| F-04 | Bilingual UI (Arabic RTL + English LTR) | Default follows phone language; direction flips with language; all strings in translation files from the first line of code; AI outputs use the UI language; user-written content (shop names, reviews, replies) shown as written; auto-translation of it is Future Scope |
| F-05 | Consent screens, delete account, export my data `[INFERRED]` | Required for personal data (Egypt Law 151/2020) and for Activity Score tracking |
| F-06 | Simulated subscriptions (Sandbox) | See section 8 |

### 6.2 Prices and Vault

| ID | Feature | Notes |
|---|---|---|
| F-07 | Live Gold Prices | Karat 24/21/18, ounce, USD, price history, last-updated time, indicative disclaimer |
| F-08 | Gold Vault | Each piece is a **Gold Record**: type, karat, weight, price, making charge, date, shop, source, invoice image |
| F-09 | Add by Manual entry | Month 1 |
| F-10 | Add by Shop QR | Token is one-time and short-lived |
| F-11 | Add by AI Invoice Reader | See AI-01 |
| F-12 | Source badges | `Shop-Verified` / `AI-Extracted + Reviewed` / `Manual` |
| F-13 | The 8 Vault calculations | Total Gold Weight, Pure Gold Weight (24K equivalent), Total Invested Amount, Average Cost per Gram, Current Estimated Value, Estimated Selling Value (after Spread), Profit/Loss, Break-even Point |
| F-14 | Zakat Tracking | Threshold, 2.5%, Hijri holding period with reset, reminders 2 weeks and 1 day before, "I paid zakat" button, jewelry opinion setting, "this is not a fatwa" notice. Zakat reference authority (e.g. Dar al-Ifta) still to be chosen |
| F-15 | Financial Calculators | Buy/Sell, Break-even, Making Charges |
| F-16 | Price Reasonableness Check | See 6.3 |
| F-17 | Goals screen `[INFERRED]` | Where the user states a goal and sees the Goal Agent result |

### 6.3 Price Reasonableness Check (coins and bars only)

Jewelry is excluded because making charges vary by design.

Input (typed, or taken from an invoice read by AI-01): type, weight, karat, total price, stated making charge. The Backend computes:
1. Raw gold value = weight × (karat/24) × current 24K price.
2. Actual making charge = price − gold value (or the stated one).
3. Its percentage of gold value, compared with the usual range for the same type and weight.

Result: **"Reasonable" / "Higher than usual" / "Much lower than usual (double-check karat and weight)"**, with the percentage and range. This is calculation, not AI. AI-06 only explains the result in simple words. It also works as an extra check on invoices read by AI-01. Ranges must come from **real data** (shop interviews and collected invoices) and are tuned by the Admin. The result is not a judgment on the shop. Month 1 version: simple, with initial ranges.

### 6.4 Shops and commerce

| ID | Feature | Notes |
|---|---|---|
| F-18 | Shop registration and license review | Admin approves; only licensed shops go live |
| F-19 | Shop Profile and Live Price Board | Shop sets its **Premium once**: fixed per piece, fixed per gram, or percentage. Price is computed live |
| F-20 | Digital Invoice with QR | One-time, short-lived token. Enters the user's Vault as Shop-Verified. Not a tax invoice |
| F-21 | Shop Catalog | Bars, coins, jewelry. Price = live gold value + shop Premium |
| F-22 | Online Orders and Sandbox Payment | Choose, pay via sandbox gateway, **pickup from the shop only**. **Price Lock** for a short time at order. After purchase the piece goes automatically into the Vault as Shop-Verified and a Digital Invoice is created. **Delivery is out of scope** (Future Scope). No P2P trading between individuals |
| F-23 | Reviews | See 6.5 |
| F-24 | Shop Directory and Comparison | See 6.6 |
| F-25 | Activity Score and Rewards | See 6.7 |
| F-26 | Admin Panel (web) | Section 4 list of responsibilities; suspicious-review queue |

### 6.5 Reviews (F-23)

- Only customers with a **Verified Purchase** (Digital Invoice or online order) can review. Stars + comment.
- Bad reviews weigh more than good ones (example: 1 to 2 stars weigh double 4 to 5 stars). **Weights are Admin settings** and will be tested.
- Shop rating = weighted average with **Bayesian correction** so a shop with one review is not instantly 5.0 or 1.0. The final rating is a **fixed Backend formula, not AI**.
- Shops can reply; customers can edit their review.
- **Base version (no AI)** is required. **Review Intelligence (AI-05)** is an optional layer on top: sentiment (Egyptian Arabic model, license and accuracy to be checked), complaint classification (price, service, karat/weight, delay), a two-line summary for the shop, and suspicious-review detection (repeated text, burst of reviews, new accounts). Suspicious reviews are **flagged for the Admin, never auto-deleted**.

### 6.6 Directory (F-24)

- **Top Rated** badge for shops (high rating + enough reviews + no major complaints) and **Top Active** badge for customers.
- Default order by distance. Filters/sort: highest rated, lowest Premium, best deals.
- **Best Deals:** shops with clearly lower Premium or making charge than usual, or a temporary offer, shown even if far, in a "Strong Deals" section with distance. Rule: shop Premium compared with the **median** of shops of the same type.
- Each shop gets a label: below / at / above usual, with the number of shops the comparison is based on.
- **Ranking cannot be bought.** Order depends only on rating, price and proximity.

### 6.7 Activity Score (F-25)

- Score from: opening the app, adding pieces to the Vault, reviewing invoices, writing real reviews, following goals.
- Top active users each month get a reward: a free Pro month or a discount at participating shops. The Admin can enable or disable it.
- Anti-abuse: daily cap per activity, points for valuable actions (not just opening the app), suspicious reviews do not count.
- Computed by fixed rules. **AI does not decide rewards.** Requires explicit consent (behavior data).

## 7. AI modules

**Seven AI rules:** (1) AI does not calculate financial values. (2) Human-in-the-loop. (3) No hallucinated data. (4) Confidence score on outputs. (5) No buy/sell recommendations. (6) Privacy. (7) All prices are estimates. All models are free and pre-trained. Use test data only on free LLM tiers because they may use inputs.

| ID | Module | Details | Owner |
|---|---|---|---|
| AI-01 | **Gold Document Reader** | 7 steps: Upload, Image Processing (OpenCV), Data Extraction, Cross-check, Rule-based Validation, User Review, Save to Vault. System A = OCR (EasyOCR/PaddleOCR) + LLM. System B = optional VLM. Also: Duplicate Detection (perceptual hashing), Confidence Scoring, Hallucination Detection, Error Analysis. Evaluate on 30 to 50 real invoices. Accuracy on Egyptian invoices is unproven | Backend 1 |
| AI-02 | **Personalized Smart Notifications** | Portfolio Monitoring; Anomaly Detection (Z-score / change-point, **not price prediction**); Importance Score; decision: instant / digest / ignore with a daily cap; message written by AI from Backend numbers. 8 alert types, including: a strong deal from a shop you care about, a shop replied to your review | Mobile 2 |
| AI-03 | **Market Movement Explainer** | Breaks down the change in Vault value (ounce / dollar / Spread) without news. Then optionally links news (only if source terms allow): collect, classify (US Interest Rates, US Dollar, Geopolitical Tensions, Central Bank Demand, Inflation, Other), link, compute impact, explain. Wording: "news that coincided with the move", never causation | Mobile 1 |
| AI-04 | **Goal Planning Agent and Copilot** | Goal in plain language, then tool calling: Monte Carlo Simulation, Premium and Spread Calculation, Zakat Calculation, What-if Scenarios, then explanation. Questions outside the tools get "I can't calculate that" | Backend 2 |
| AI-05 | **Review Intelligence** | See 6.5. Optional layer over base Reviews | Month 3 |
| AI-06 | **Price Reasonableness Explainer** | Explains the result of 6.3 in simple words. No calculation | Mobile 1 |

Notification infrastructure (Expo Notifications + scheduled jobs) is a baseline requirement for AI-02 and for zakat reminders.

## 8. Plans (all simulated in Sandbox)

- **Free:** prices, limited Vault, calculators, Price Reasonableness Check, limited notifications, buying and reviews.
- **Pro:** unlimited Vault, more invoice reads, full Smart Notifications, Market Explainer, Goal Agent, weekly summary. Can be won free as an Activity Score reward.
- **Shop plan:** profile, Price Board, catalog, Digital Invoice, Directory listing, reviews dashboard. A small commission on online orders is a proposed revenue model.

## 9. Tech stack (proposed)

React Native (Expo) with Individual/Shop modes; Node.js + Express; PostgreSQL with `tenant_id` + Row-Level Security; Python (FastAPI) service for OCR / VLM / Sentiment; React Admin Panel; Expo Notifications; node-cron; storage (Supabase or Firebase); Sandbox payment gateway (e.g. Paymob or similar; verify a test mode exists). Because the team is beginner to intermediate, prefer the simplest option at each choice and justify it.

## 10. Roadmap (draft, to be re-ordered after Month 1)

**Month 1: MVP essentials (no AI)**
F-01 to F-05, F-07, F-08, F-09, F-12, F-13, F-14, F-15, F-17, F-16 (rule-based, initial ranges), basic Admin (prices, spread, zakat settings).

**Month 2: vacation, maximum output**
- All four work in parallel: AI-01, AI-02, AI-03 + AI-06, AI-04, each with one owner.
- Shop side as capacity allows: F-18, F-19, F-20 (QR), F-10, F-21, F-26.
- If Month 1 runs short, F-18 to F-20 may slip to the start of Month 3. They are **not removed**.

**Month 3: complete and deliver**
F-22 (orders + sandbox payment), F-23 (base Reviews, then AI-05 if time), F-24 (Directory, Top Rated, Best Deals), F-25 (Activity Score and rewards), F-06 (simulated plans), integration of all AI modules, evaluation (30 to 50 invoices; sentiment accuracy; user tests), final report, delivery.

## 11. Risks and limits (honest)

- Project size is large (online payment + catalog + reviews + Activity Score + 6 AI modules) for 4 beginner-to-intermediate students in 3 months. Plan carefully, and warn early.
- Local price source is not confirmed. OCR accuracy on Egyptian invoices is unproven. Free LLM limits and terms change.
- Egyptian-Arabic sentiment model: not yet chosen; license and accuracy to be checked on real reviews.
- Making-charge ranges must come from real data.
- Unproven: whether shops will actually pay for and sell through the platform. Needs interviews.
- **Legal review required before any real launch:** selling gold online, Law 68 of 1976, Decision 149 of 2023, Law 151 of 2020 (personal data), consumer protection, payment gateway licensing. In this project payments are Sandbox only.

## 12. Out of scope / Future Scope

- Delivery or shipping of orders (pickup only for now).
- P2P trading between individuals (permanently cancelled).
- Auto-translation of user-written content (reviews, replies, shop names).
- Real payments and real subscriptions.
- Any price prediction or buy/sell recommendation (forbidden by AI rule 5).

## 13. Decisions already made (do not re-ask)

1. Brief is in English with Arabic terms kept.
2. Team of 4 (2 Backend, 2 Mobile), graduation project, 3 months, may become a real product.
3. Baseline features (section 6.1, plus F-17 in section 6.2) are included but marked `[INFERRED]`.
4. Price source: free API + formula + Admin Spread + manual fallback.
5. Pickup only, no delivery.
6. Arabic and English from day one.
7. No feature is cut. Re-plan after Month 1.
8. Month 1 has no AI; Month 2 is parallel AI work with one owner per module.
9. Reviews base version is non-AI; Review Intelligence is an optional layer.

## 14. Open questions the AI should ask before finalizing a plan

1. Exact skills of each of the 4 members (React Native, Node, Python, SQL, ML)?
2. Which free price API and which payment sandbox will be used (and does it have a test mode)?
3. Which LLM provider and which OCR/VLM models, and what are the free-tier limits?
4. Which zakat reference authority will be used?
5. Which Egyptian-Arabic sentiment model, and is its license acceptable?
6. How will real invoice data (30 to 50) and making-charge range data be collected, and by whom?
7. Do any shops already agree to participate for testing?
8. What are the graduation deliverables and dates (demo, report, defense)?
9. Confirm every item marked `[INFERRED]`.
