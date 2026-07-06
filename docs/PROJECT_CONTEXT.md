# AutoLeadss — Project Context

_Last updated: 2026-07-06_

## What this is

**AutoLeadss** (autoleadss.com) is a growth/marketing agency **and** a self-serve AI
funnel-builder SaaS for the **UAE, Gulf, and Egypt** markets — bilingual (English +
Arabic, full RTL), WhatsApp-first. One codebase, two products:

1. **Agency marketing site** — the done-for-you service (sales funnels, landing pages,
   Google/paid ads, social, AI chatbots, SEO/GEO). Routes: `/`, `/en`, `/ar`.
2. **Self-serve platform** — users generate their own full funnel (landing page + ads +
   WhatsApp bot + social) with AI in minutes. Routes: `/app`, `/app/new`, `/app/funnel/:id`,
   `/login`, `/signup`, `/pricing`, `/p/:slug`.

Strategy (from `docs/SAAS_BUILD_PROMPT.md`): **B** self-serve builder = front door →
**C** done-with-you = upsell → **D** white-label = later.

## Stack & structure

- **Vite 5 + React 18 + TypeScript + Tailwind + Framer Motion**, react-router v7, react-helmet-async.
- Marketing site: `src/` (sections in `src/components/sections/`), route-based locale in `src/i18n/`.
- SaaS: **`src/saas/`** — self-contained. Its own locale context (`src/saas/i18n.tsx`) and
  store (`src/saas/store.ts`, `useSyncExternalStore` + localStorage). Generation is client-side
  from a bilingual template library (`src/saas/content/templates.ts`, 5 industries × EN/AR).
  Core data type is `FunnelSpec` (`src/saas/types.ts`): landing page + ads + chatbot + social.
- Contact form → Supabase edge function `send-contact-email`.
- Business docs: `docs/SAAS_BUILD_PROMPT.md`, `docs/COMPETITOR_STUDY.md`, `docs/AI_MODEL_EVAL.md`,
  `lib/ai/model-router.json` (funnel copy → claude-fable-5, chat/qualify → haiku, ad/social → sonnet).

## Deploy

- GitHub `mohanadbarakattt/autoleadss` (public) → **push `main` auto-deploys to autoleadss.com**.
- Vercel project `autoleadss` under the **mohanadbarakattt** CLI account (use `npx vercel`;
  the claude.ai Vercel connector is a different account and can't see it).
- Framework forced to Vite in `vercel.json`; SPA rewrite serves all routes.
- Domain: apex `autoleadss.com` **308-redirects to `www`** — both must resolve (a missing `www`
  CNAME once caused a site-wide 404).

## Current state (what's shipped)

- ✅ Marketing site rebuilt (3D hero, mockups, region map, case studies, no pricing).
- ✅ Self-serve SaaS merged in and live — **demo mode**: localStorage persistence, client-side
  template generation, funnels publish to `/p/:slug` (same-browser in demo).
- ✅ Bilingual EN/AR verified; all routes 200 live.
- ✅ Standalone "Virlo" experiment **reversed** (repo + Vercel deleted; local backup at
  `~/projects/virlo-fable-5`) and rebranded/merged into AutoLeadss.

## Gotchas

- **framer-motion v12**: nested `AnimatePresence mode="wait"` **hangs** the exit and freezes
  transitions — use plain keyed `motion.div`s (this bit the wizard).
- Real AI, real persistence, and billing are NOT wired yet — demo mode by design.

## Production roadmap (SaaS → real product)

Dependency-ordered. Phase 1 is shipped; the rest turn the demo into a real, billable SaaS.

| Phase | Name | What it delivers |
|---|---|---|
| **1** | Self-serve MVP (demo) | ✅ SHIPPED — wizard, editor, publishing, demo mode |
| **2** | Real AI generation | Anthropic serverless endpoint + streaming; router by task |
| **3** | Persistence & real auth | Supabase multi-tenant + RLS; funnels/leads server-side |
| **4** | Billing & plan gating | Stripe (Gulf) + Paymob/Tap (Egypt); entitlements per tier |
| **5** | WhatsApp Cloud API | BYO WABA per tenant; live bot + shared inbox |
| **6** | Real publishing | Custom domains/subdomains, cross-device shareable pages, SEO |
| **7** | White-label / agency mode | Sub-accounts, agency branding, reseller billing (tier D) |
| **8** | Analytics, admin, hardening | Dashboards, impersonation, observability, security/perf |

> Note: Phase 7 (white-label) normally depends on Phases 2–6 (persistence, billing, tenancy).
> Confirm sequencing before jumping ahead.
