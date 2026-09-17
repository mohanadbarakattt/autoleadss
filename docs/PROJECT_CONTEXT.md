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
- Contact → WhatsApp marketplace connector (`src/components/sections/WhatsAppMarketplace.tsx`), no backend — every listing deep-links straight to wa.me.
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
- ✅ Self-serve SaaS merged in and live — **demo mode by default**: localStorage
  persistence, client-side template generation, funnels publish to `/p/:slug`
  (same-browser in demo).
- ✅ Shared Neon backend wired for funnels/leads/publish (`api/`, schema `autoleadss`
  in the shared MBAI Neon project — see `docs/SETUP.md` "Phase 2 — Shared Neon
  backend"): activates once Clerk + `DATABASE_URL` + `CLERK_SECRET_KEY` are
  configured, fixing cross-device publishing; falls back to demo-mode localStorage
  otherwise. This **replaced** an earlier Supabase-backed remote-persistence layer
  (removed entirely — see `docs/SETUP.md`). Custom domains, WhatsApp remote
  persistence, agency/workspace sync, real AI generation, and billing checkout were
  also Supabase-backed and were **not** carried over to Neon — see `docs/SETUP.md`
  "Out of scope" for the full list and follow-up plan.
- ✅ Bilingual EN/AR verified; all routes 200 live.
- ✅ Standalone "Virlo" experiment **reversed** (repo + Vercel deleted; local backup at
  `~/projects/virlo-fable-5`) and rebranded/merged into AutoLeadss.

## Gotchas

- **framer-motion v12**: nested `AnimatePresence mode="wait"` **hangs** the exit and freezes
  transitions — use plain keyed `motion.div`s (this bit the wizard once; already fixed, and
  the pattern used everywhere in `src/saas/`).
- Real AI generation and billing checkout are NOT wired yet — demo mode by design. Funnel/lead
  persistence now *can* be real (see above) but stays demo-mode until Neon + Clerk are configured.

## Production roadmap (SaaS → real product)

Dependency-ordered. Phases 1–2 are shipped; the rest turn the demo into a real, billable SaaS.

| Phase | Name | What it delivers |
|---|---|---|
| **1** | Self-serve MVP (demo) | ✅ SHIPPED — wizard, editor, publishing, demo mode |
| **2** | Persistence & real auth | ✅ SHIPPED — shared Neon Postgres (schema `autoleadss`) + Clerk; funnels/leads server-side via `api/`, graceful localStorage fallback |
| **3** | Real AI generation | Wire `src/saas/ai/generateLive.ts` to the shared MBAI Model Gateway (`MBAI_GATEWAY_URL`/`MBAI_GATEWAY_KEY`); streaming |
| **4** | Billing & plan gating | Stripe (Gulf) + Paymob/Tap (Egypt) via a Vercel function under `api/`; entitlements per tier |
| **5** | WhatsApp Cloud API | BYO WABA per tenant; live bot + shared inbox; new `autoleadss.whatsapp_*` tables |
| **6** | Real custom domains | Host-based rendering for subdomains/custom domains; new `autoleadss.domains` table |
| **7** | White-label / agency mode | Sync sub-accounts, agency branding, workspace plan/region to Neon (currently local-only) |
| **8** | Analytics, admin, hardening | Dashboards, impersonation, observability, security/perf |

> Numbering follows the original phase plan for continuity; Phase 2's scope changed from
> "Supabase multi-tenant + RLS" to "shared Neon backend" when the ecosystem-wide contract
> (one shared Neon project, no parallel data stores — see
> `~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md`) superseded the original Supabase plan.
> Phase 7 (white-label sync) depends on Phases 4–6 landing their own Neon tables first.
