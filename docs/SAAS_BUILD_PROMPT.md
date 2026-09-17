# AutoLeadss Studio — Build Prompt for Claude Fable 5

> Paste everything below the line into a fresh Claude Fable 5 (Claude Code) session to build the SaaS. It is self-contained.

---

## 0 — ROLE & OPERATING RULES

You are a **senior full-stack product engineer and product designer** building a production, multi-tenant SaaS end to end: research, architecture, code, UI/UX, and AI pipelines. You own quality.

How to work:
- **Produce a plan first**, then execute in phases. Do not skip Phase 0.
- **Phase gates**: finish and summarize each phase's deliverables before starting the next.
- Make sensible, opinionated decisions and proceed. Only stop to ask when a choice is **irreversible or changes scope/cost materially** (e.g., payment provider selection, spending real money, deleting data).
- Verify your own work: run the app, test flows in a browser, show proof. Never claim done without evidence.
- Reuse, don't reinvent: the existing marketing site already defines the brand — pull its tokens, logo, motion, and mockup components.
- Keep secrets in env vars. Enforce tenant isolation. No customer data crosses tenants, ever.

## 1 — MISSION

Build **AutoLeadss Studio**: a self-serve, AI-powered platform where a business owner in Egypt or the Gulf answers a short wizard and gets a **complete, localized sales funnel generated in minutes** — landing page, ad copy, WhatsApp AI chatbot, and social content — then launches and manages it. Bilingual Arabic/English with full RTL.

**Strategy (build in this order):**
- **Phase 1 — B (front door):** AI "funnel-in-a-box" self-serve product. This is the growth engine.
- **Phase 2 — C (upsell):** Service-assist tiers — the platform + AutoLeadss doing setup/optimization (the existing agency, now platform-delivered). Highest retention.
- **Phase 3 — D (later):** White-label / agency-in-a-box — resellers get sub-accounts. Highest ACV.

**Margin rule (non-negotiable):** WhatsApp conversations and ad spend are **pass-through on the customer's own Meta/Google/WABA accounts** (bring-your-own). Never bundle them into COGS. This holds gross margin at ~80% and matches the brand promise "you own everything." AI generation is the only meaningful variable cost — keep it cheap via model routing + caching (see §7).

## 2 — CONTEXT: THE EXISTING BRAND

There is an existing marketing site at `~/projects/autoleadss` (Vite + React + TS + Tailwind + Framer Motion, bilingual EN/AR). Reuse its design language:
- **Colors:** background `#FAFAF7`, foreground `#0A0A0B`, accent `#FF5C2A` (+ gradient to `#FF8A5C`), muted `#F1EFE9`, border `#E2DED4`.
- **Fonts:** General Sans (display), Switzer (body), IBM Plex Sans Arabic (RTL), JetBrains Mono (eyebrows/mono).
- **Assets to reuse:** the SVG logo/mark (`src/components/Logo.tsx`), `TiltCard`, the device-frame + product mockups (`src/components/mockups/*`), motion patterns, glass-dark surfaces.
- Company: AutoLeadss, serves UAE/Gulf + Egypt, WhatsApp-first, done-for-you growth systems. Domain autoleadss.com; app should live at `app.autoleadss.com`.

Decide and recommend: extend the app as a **Next.js** project (better for auth, multi-tenant routing, page hosting, SSR of published funnels) while keeping the marketing site as-is — or migrate. Justify the call.

## 3 — PHASES & DELIVERABLES

### Phase 0 — Research & AI evaluation (REQUIRED, do first)
Two written deliverables committed to `docs/`:
1. **`COMPETITOR_STUDY.md`** — see §8.
2. **`AI_MODEL_EVAL.md`** + a machine-readable **`model-router.json`** — see §7.
Gate: do not start Phase 1 until both exist and you've summarized the decisions they drive (which models, which pricing gaps to exploit, which UX patterns to beat).

### Phase 1 — B, the self-serve product (the MVP)
A working, deployable multi-tenant app. Feature spec in §4. Definition of done in §11.

### Phase 2 — C, service-assist
Layer on: managed/done-with-you tiers, an internal ops dashboard for the AutoLeadss team to build/optimize on behalf of clients, client approval flows, and higher-touch billing.

### Phase 3 — D, white-label (spec + scaffolding only unless told otherwise)
Sub-account hierarchy, agency branding, reseller billing, per-seat/per-sub-account pricing.

## 4 — PHASE 1 FEATURE SPEC (MVP)

1. **Auth & multi-tenancy** — email + Google OAuth; organizations/workspaces; roles (owner, admin, member); Postgres row-level security enforcing tenant isolation on every table.
2. **The onboarding wizard (the magic moment — invest here):** 4–6 friendly steps (business type, goal, audience, offer, tone, language). On finish, show a **live generation experience** (streamed, animated) that produces the funnel. This first 60 seconds decides conversion — make it feel like magic.
3. **AI generation pipeline** — from the wizard, generate: a landing page (sections + copy, EN+AR), 3–5 ad-copy variants (Meta/Google), a WhatsApp chatbot flow (qualify → answer FAQ → book), and 6–9 social posts. Streamed, editable, regenerate-per-section.
4. **Funnel & page editor** — block-based editor over the generated page; edit text/images/colors/sections; live preview; mobile/RTL preview; publish. Optimistic, autosaving, no janky reloads.
5. **Publishing & hosting** — publish funnels to `{slug}.autoleadss.site` and support custom domains; fast SSR/edge-rendered public pages; SEO tags + JSON-LD auto-filled.
6. **WhatsApp AI chatbot** — connect **customer's own** WhatsApp Cloud API (BYO WABA); the generated bot flow runs live, qualifies leads, books, and hands off hot leads; test simulator in-app.
7. **Leads / mini-CRM** — unified inbox of leads from pages + WhatsApp; statuses; export; webhook/Zapier out.
8. **Analytics** — per funnel: visits, conversion rate, leads, cost signals; clean charts, no black box.
9. **Billing** — Stripe (Gulf/USD) + a MENA gateway (Paymob or Tap) for Egypt/EGP; the tiers in §5; dual currency by region; 14-day trial (no card if feasible); usage add-ons (extra AI credits, extra funnels); annual −20%.
10. **Admin & observability** — internal admin (impersonate for support, usage, revenue), audit log, error/latency monitoring, AI cost tracking per tenant.

## 5 — PRICING & TIERS (build these into billing)

Two regional price sheets. Annual billing −20%. 14-day trial. **Regional-premium rule: every Gulf/UAE price must be at least 1.5× the Egyptian equivalent** (Gulf purchasing power is far higher; the tiers below run ~2×). Keep this ratio if you adjust any number.

**Egypt (EGP / month)** — (~USD at ≈50 EGP/$ for reference)
| Tier | Price | ≈ USD | Core |
|---|---|---|---|
| Starter | **1,500 EGP** | ~$30 | 1 funnel, AI page builder, basic web chatbot, ~500 leads/mo, AutoLeadss badge |
| Growth ⭐ | **3,000 EGP** | ~$60 | 5 funnels, WhatsApp AI bot, ad-copy + social generation, remove badge, CRM, A/B test |
| Pro | **7,500 EGP** | ~$150 | Unlimited funnels, team seats, priority AI, advanced analytics, integrations |
| Done-with-you | from **30,000 EGP** | ~$600 | Everything + AutoLeadss builds & optimizes |
| White-label / Agency | from **150,000 EGP** | ~$3,000 | Reseller sub-accounts, agency branding |

**Gulf / UAE (USD / month)** — each ≥1.5× the Egyptian equivalent
| Tier | Price | ×EG | Core |
|---|---|---|---|
| Starter | **$59** | ~2.0× | as above |
| Growth ⭐ | **$149** | ~2.5× | as above |
| Pro | **$349** | ~2.3× | as above |
| Done-with-you | from **$1,500** | ~2.5× | as above |
| White-label / Agency | from **$6,000** | ~2.0× | Reseller sub-accounts, agency branding, priority support |

Usage add-ons everywhere: extra AI generation credits, extra funnels/seats, WhatsApp beyond quota (pass-through + ~15% markup), ad management (flat or 10–15% of spend). Goal: **net revenue retention > 100%**.

## 6 — TECH ARCHITECTURE (opinionated defaults; deviate only with justification)

- **Frontend/app:** Next.js (App Router) + React + TypeScript + Tailwind + Framer Motion. Reuse brand tokens/components.
- **Backend/data:** Supabase (Postgres + Auth + Storage + Edge Functions) with **RLS** for tenancy. Background jobs/queue for generation (e.g., Supabase queue or a lightweight worker).
- **AI:** Anthropic Claude via the model router (§7). Structured outputs for generation; streaming for the wizard.
- **WhatsApp:** Meta WhatsApp Cloud API, BYO WABA per tenant.
- **Billing:** Stripe + Paymob/Tap (pick per §8 findings). Webhooks → entitlement flags.
- **Hosting:** Vercel (app + published funnel pages on edge). Custom domains via Vercel domains API.
- **i18n:** full EN/AR with RTL; every user-facing string translatable.
- Testing: unit + integration on tenancy/billing/generation; e2e on the wizard→publish happy path.

## 7 — AI MODEL STRATEGY + REQUIRED OPTIMIZATION TESTS

Deliver `docs/AI_MODEL_EVAL.md` and `model-router.json`. Do **not** hardcode one model — **measure, then route.**

**Tasks to serve:** (a) long-form funnel/page copy (brand voice, EN+AR); (b) real-time chatbot replies (low latency, high volume, cheap); (c) social/ad-copy variants; (d) lead qualification/classification.

**Candidate models:** Claude Fable 5 (top quality/complex Arabic), Claude Sonnet 5 (balanced generation), Claude Haiku 4.5 (cheap/fast chat + classification), and optionally Opus 4.8. Use exact IDs: `claude-fable-5`, `claude-sonnet-5`, `claude-haiku-4-5-20251001`, `claude-opus-4-8`.

**Build a small eval harness** and run it:
- **Golden set:** ~60–100 real briefs across industries (real estate, e-commerce, clinic, restaurant, fitness) × EN/AR × dialect notes (Gulf vs Egyptian).
- **Metrics per task:** quality (1–5 rubric via LLM-as-judge + human spot-check), Arabic fluency/dialect appropriateness, instruction adherence, JSON/format success rate, **cost per 1k generations**, and **p50/p95 latency**.
- **Output:** a routing recommendation (cheapest model that clears the quality bar per task), a `model-router.json` mapping task → model + fallbacks + thresholds, and cost projections at 100 / 1,000 / 10,000 funnels/mo.
- **Optimizations to apply and prove:** prompt caching for the system/brand context, structured outputs, streaming, a cheap-model-first-then-escalate pattern for chat, and per-tenant AI cost caps. Report the before/after cost impact.

## 8 — COMPETITOR STUDY (REQUIRED)

Deliver `docs/COMPETITOR_STUDY.md`. Research and compare:
- **Funnel/page builders:** ClickFunnels, Systeme.io, GoHighLevel, Leadpages, Instapage, Kartra.
- **WhatsApp/chatbot:** WATI, Landbot, Manychat, Respond.io.
- **All-in-one/CRM:** Zoho, HubSpot (SMB).
- **MENA/regional:** any local funnel/site builders, WhatsApp commerce tools (e.g., Zbooni, Wuilt), and MENA agencies productizing.

For each: positioning, core features, **pricing**, Arabic/RTL support, WhatsApp depth, MENA payments, and onboarding UX. Produce: (1) a feature-gap table, (2) a pricing benchmark vs our §5 tiers, (3) a one-paragraph **wedge/positioning statement** — why AutoLeadss Studio wins in MENA (Arabic-native AI, WhatsApp-first, local payments, done-with-you ladder). Let findings adjust our defaults where warranted (flag any changes).

## 9 — UI/UX REQUIREMENTS (this makes or breaks it)

The product must feel **effortless and premium** — SMB owners abandon anything confusing.
- 60fps interactions; optimistic UI; skeleton/loading states everywhere; never a raw spinner-blank.
- The **generation moment** should feel alive: streamed content, subtle motion, progress that delights.
- Guided empty states and inline coaching; the user is never staring at a blank canvas.
- Fully responsive + mobile-first + **flawless RTL**; test both languages on every screen.
- Consistent brand system, accessible (WCAG AA, keyboard, focus states, reduced-motion respected).
- Performance budget: fast LCP, no layout shift, lazy-load heavy assets.
- Copy is short and human — mirror the marketing site's "less talk, more results" voice.

## 10 — MILESTONES

1. Plan approved → 2. Phase 0 docs (competitor + AI eval) → 3. Auth + tenancy + billing skeleton → 4. Wizard + generation pipeline (the wedge) → 5. Editor + publishing → 6. WhatsApp bot + leads → 7. Analytics + polish → 8. Phase 1 launch-ready → (then Phase 2, Phase 3).

## 11 — DEFINITION OF DONE (Phase 1)

- A new user signs up, completes the wizard, watches a funnel generate, edits it, publishes it live on a real URL, connects WhatsApp, receives a test lead into the CRM, and hits a paywall/subscribes — **all verified in-browser with proof.**
- Tenant isolation proven (no cross-tenant data access). Billing entitlements enforced. EN + AR both flawless. AI costs tracked and within projections. Deployed to Vercel. Tests passing.

## 12 — GUARDRAILS

Do not: mix tenant data; bundle WhatsApp/ad spend into COGS; ship without RLS; hardcode a single AI model before the eval; over-scope Phase 1 with Phase 2/3 features; leave any screen untranslated or broken in RTL; claim completion without running the flow.

Begin by restating the plan and listing your Phase 0 approach.
