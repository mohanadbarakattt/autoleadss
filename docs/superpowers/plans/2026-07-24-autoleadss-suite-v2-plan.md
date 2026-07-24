# AutoLeadss V2 — Premium Growth Suite — Implementation Plan

> **For agentic workers (Fable 5):** REQUIRED SUB-SKILL: subagent-driven-development or executing-plans per phase. Each phase produces working, testable software. Execute in order; TDD; commit frequently. **Keep the built engine** — do not restart. Env-gated; demo-mode stays keyless as a fallback (never the pitch).

**Goal:** Reposition AutoLeadss into a premium global growth suite — functional tools + a flagship luxury storefront + real multi-gateway payments + business-type onboarding — on the kept 8-phase engine, redesigned premium, for Gulf + worldwide.

**Spec:** `docs/superpowers/specs/2026-07-24-autoleadss-suite-v2-design.md` — read fully. Prototypes: `.superpowers/{al-hub, al-storefront, al-onboarding}.html`.

**Stack notes:** Vite 5 + React 18 + TS + Tailwind + Framer Motion; SaaS under `src/saas/` (pages: Dashboard, Wizard, Editor, Published, Agency, AdSuite, Connect, Pricing); backend = Vercel functions under `api/` (funnels, leads, published, whatsapp, ai-generate, ad-suite, usage) + Clerk auth, env-gated. **Billing/checkout and agency persistence did NOT survive the Neon migration** (Phase 0 inventory) — see the corrected Phases 3/6. **framer-motion v12 gotcha:** never nest `AnimatePresence mode="wait"` (hangs) — use keyed `motion.div`. PATH fix: `export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`.

**Non-negotiables:** functional-not-placeholder; real gateways only; no fabrication; money paths fail-closed + idempotent (C9); demo-never-breaks-live; EN/AR RTL.

---

## Phase 0 — Guardrails (½ day) — ✅ done 2026-07-24
- [x] Branch `autoleadss/suite-v2` (created). Baseline green: build ✓, 27/27 tests ✓. C10 verified **N/A** here (SaaS store keeps timestamps as `Date.now()` numbers and has no defensive-copy read paths — there is no fix to "note", don't go looking for one).
- [x] Inventory: `docs/superpowers/plans/2026-07-24-phase0-inventory.md` — **9 placeholder surfaces** (the Phase 5 backlog) + 3 corrections to this plan's assumptions, folded into Phases 3/4/6 below.

## Phase 1 — Premium redesign foundation (2–3 days)
- [ ] New design system: **dark-luxe suite** (champagne gold `#c9a86a`, Cormorant Garamond + Inter) and **light editorial-luxury storefront** register. Shared primitives; region switch (Gulf · Global); EN/AR RTL preserved. Match the prototypes. *(Phase 0: these tokens exist only in the prototype HTMLs — zero overlap with `src/`; this is a fresh design system, not a restyle of the current light/orange theme.)*
- [ ] Rebuild the **Hub** (flagship Storefront + tool grid) per `al-hub.html`. Keep the agency marketing site; refresh where it clashes.

## Phase 2 — Business-type onboarding (1–2 days)
- [ ] The onboarding flow (per `al-onboarding.html`): pick business type → recommend + assemble a toolkit (map each type → tool set + template + default payments + region/currency). Persist the workspace's toolkit; "add/remove anytime." Optional URL/describe-your-business step (improvement #1) to auto-fill brand.

## Phase 3 — Unified payments layer (3–5 days) — the biggest new build
- [ ] A **payments abstraction** over multiple gateways: **Tap · PayTabs · Telr · Checkout.com · Tabby · Tamara** (Gulf) + **Stripe · PayPal · Apple Pay** (global). Merchant **connects their own account** (store credentials/OAuth per gateway); checkout routes to the connected one; currency/region aware (AED default for Gulf).
- [ ] **Money discipline:** fail-closed activation, **idempotent webhooks** per gateway, never mark paid before the dependent write. Adversarially test each gateway's webhook (poison-test double-charge / missed-grant).
- [ ] **Corrected scope (Phase 0):** there is NO `stripe-webhook`/`create-checkout` to reuse — they died with the Supabase project (`src/saas/billing/checkout.ts` hardcodes `billingEnabled = false`; `api/` has no checkout or webhook route; zero gateway code anywhere). This is a from-scratch build under `api/` — reuse the *discipline*, not code.
- [ ] KYC/merchant-account is merchant-side — build the connect flow + a clear "not connected yet" state; ship each gateway behind a flag until its integration is verified live.

## Phase 4 — Sites (merge Storefront + Landing, make it luxury + functional) (4–5 days)
- [ ] Merge Storefront + Landing into one **Sites** tool, two modes:
  - **Sell:** premium catalogue + cart + **real-gateway checkout** (Phase 3) + orders + inventory. **Corrected scope (Phase 0): all new** — no cart/product/inventory model exists anywhere today; "merge" really means "build Sell mode beside the existing Capture engine." The published store must match `al-storefront.html`'s luxury bar.
  - **Capture:** lead/booking page + forms + thank-you + follow-up. Leads are real, fail-closed (C9).
- [ ] Premium templates; custom domain/subdomain publish (reuse `publish/host.ts` — **subdomains only**; custom-domain host lookup is unimplemented server-side, `api/published/index.ts`, and must be built here); SEO. Editor polish (inline edit, AI-assist, bigger live preview — improvement #6).
- [ ] Everything real-backed; demo fallback keyless but clearly labeled.

## Phase 5 — Make the other tools functional (3–4 days)
- [ ] **Ads**, **WhatsApp** (bot+broadcast+**shared inbox**), **Leads & CRM**, **Social**, **Insights** — activate real backends, remove placeholder surfaces; show the funnel as a **connected system** (ad → page → capture → WhatsApp/email), improvement #4. Scaffold **Reviews/Bookings** as "soon" (no fake UI).

## Phase 6 — Agency / white-label first-class (2 days)
- [ ] Make white-label a prominent, real flow: sub-accounts, per-client branding, build-for-clients, propagation. This is the wedge vs ibni — surface it, don't bury it.
- [ ] **Corrected scope (Phase 0):** only the phase-7 **UI** survives (`Agency.tsx`); persistence is localStorage-only even with Clerk configured (`src/saas/store.ts` ~207 — the agency/sub-account tables were deferred in migration `0001`). This phase includes building the schema + `api/` routes, not just surfacing the tab.

## Phase 7 — Globalize, launch prep, verify (2 days)
- [ ] Region/currency (AED etc.), Gulf-first defaults, drop Egypt-only defaults; EN/AR + region awareness.
- [ ] Close `docs/SETUP.md` go-live: gateways live (per-merchant connect + KYC owner-side), each tool's real backend on, redesign shipped, DNS `autoleadss.site` + wildcard.
- [ ] Full verify: onboard by business type → tailored toolkit → luxury storefront takes a **real test payment** through a Gulf gateway → tools work → agency runs it white-labeled. Nothing placeholder; nothing fabricated. Do NOT deploy without the owner.

---

## Execution notes for Fable 5
- Each phase is its own plan — verify against the prototypes; hold the luxury bar (a clear tier above ibni).
- **Highest-risk pieces:** the multi-gateway payments layer (Phase 3 — money discipline, per-gateway webhooks, real merchant connect) and "functional-not-placeholder" (Phase 5 — no fake features). Test both adversarially with real flows.
- Keep C9/C10 discipline, demo-never-breaks-live, EN/AR RTL, the framer-motion v12 gotcha. Commit locally; do not push/deploy without the owner; no fabricated data or fake features anywhere.
