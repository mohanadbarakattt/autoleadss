# AutoLeadss V2 — Premium Growth Suite — Build Plan

**Goal:** a premium growth suite for the Gulf + worldwide — real tools a business picks from, anchored by a luxury storefront that takes real payments, with business-type onboarding. Built on the existing engine. Not a restart.

**Spec:** `specs/2026-07-24-autoleadss-suite-v2-design.md` · **Inventory (ground truth):** `2026-07-24-phase0-inventory.md` · **Prototypes:** `.superpowers/{al-hub, al-storefront, al-onboarding}.html`

**Stack:** Vite 5 + React 18 + TS + Tailwind + Framer Motion. SaaS under `src/saas/`. Backend = Vercel functions under `api/` (funnels, leads, published, whatsapp, ai-generate, ad-suite, usage) + Clerk auth + Neon, all env-gated.

**Rules that don't bend:**
- Functional or it doesn't ship. No placeholder pretending to be a feature — "Soon" is honest, fake UI is not.
- Money paths fail-closed + idempotent webhooks. Never mark paid before the dependent write.
- No fabricated data — copy, metrics, reviews, client names. Unknowns go to the owner.
- Demo mode stays keyless and never breaks; it's the fallback, never the pitch.
- EN/AR with real RTL. Arabic is native register, never transliterated.
- Local commits only. No push, no deploy, without the owner.

**Gotchas:** never nest `AnimatePresence mode="wait"` (hangs) · PATH fix: `export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"` · Node's built-in `localStorage` shadows jsdom (polyfilled in `src/test/setup.ts`).

---

## ✅ Phase 0 — Guardrails (done 2026-07-24)

Baseline green, C10 verified N/A (store uses numeric timestamps, no defensive-copy reads), full inventory written. Found 9 placeholder surfaces and 3 wrong assumptions in the original plan — folded in below.

## ✅ Phase 1 — Design system + Hub (done 2026-07-25)

Dark-luxe tokens (`suite.*`) + storefront tokens (`store.*`), namespaced so the marketing site is untouched · `src/saas/suite/theme.css` scoped to `.theme-suite`/`.theme-store` · Cormorant/Inter/Amiri · `SuiteShell` (dark bar, Gulf·Global region pill → new `Workspace.marketRegion`) · `Hub.tsx` at `/app` per the prototype, honest statuses (Live = Ads, WhatsApp, Landing pages only) · Dashboard moved to `/app/pages`, all funnels-list links repointed · `hub.*` in en/ar/fr-eg · 32/32 tests.

Existing pages keep AppShell + the light theme until their own phase migrates them.

---

## Phase 2 — Business-type onboarding

The front door: pick your business type → the suite assembles your toolkit.

- [ ] Onboarding flow per `al-onboarding.html`, in the suite register, at `/app/start`. New users land here; existing users can re-run it.
- [ ] Business types (real list, not invented verticals — reuse/extend `src/saas/industries.ts`) → each maps to a toolkit: which tools, which template, default payment gateways, region + currency.
- [ ] Persist the toolkit on the workspace; the Hub renders the user's chosen set (chosen tools first, the rest available to add). "Add or remove anytime."
- [ ] Optional first step: paste a URL or describe the business → prefill brand (name, colours, what they sell) via `api/ai-generate`. Skippable, never blocking, never fabricates facts it can't source.
- [ ] Tests: type → expected toolkit mapping, persistence across reload, skip path.

## Phase 3 — Payments (the biggest build; nothing exists today)

Ground truth: `billingEnabled = false` is hardcoded in `src/saas/billing/checkout.ts`, `api/` has no checkout or webhook route, and there is zero gateway code. `create-checkout`/`stripe-webhook` died with the Supabase project. This is from scratch — reuse the *discipline*, not code.

- [ ] `api/payments/` — one gateway-agnostic interface (create intent, capture, refund, webhook verify) with per-gateway adapters behind it.
- [ ] Gulf: Tap · PayTabs · Telr · Checkout.com · Tabby · Tamara. Global: Stripe · PayPal · Apple Pay. Each behind its own flag; a gateway ships only when its integration is verified live.
- [ ] Merchant connects their *own* account (credentials/OAuth stored per workspace, encrypted). Clear "not connected yet" state. KYC is merchant-side.
- [ ] Checkout routes to the connected gateway by region/currency (AED default for Gulf).
- [ ] Money discipline: fail-closed activation, idempotent webhooks keyed per gateway event id, never mark paid before the dependent write. Poison-test each: replayed webhook, double-charge, missed-grant, out-of-order delivery.
- [ ] Tests are the deliverable here as much as the code.

## Phase 4 — Sites (Sell + Capture)

"Merge Storefront + Landing" is really: keep the Capture engine, build Sell beside it. No cart, product, or inventory model exists anywhere today.

- [ ] **Capture** (exists): lead/booking pages, forms, thank-you, follow-up. Leads real + fail-closed. Polish to the new register.
- [ ] **Sell** (new): product model, catalogue, cart, checkout via Phase 3, orders, inventory. Published store must hit `al-storefront.html`'s bar — that's the flagship, it carries the product.
- [ ] One editor, two modes. Editor polish: inline edit, AI-assist, bigger live preview.
- [ ] Publishing: subdomains work today via `publish/host.ts`; **custom-domain host lookup is unimplemented server-side** (`api/published/index.ts`) — build it here. SEO per page.
- [ ] Flip the Hub's Storefront tile Live only when Sell genuinely works end to end (the honest-status test in `Hub.test.tsx` must be updated deliberately).

## Phase 5 — Make the rest functional

Kill the placeholder surfaces from the inventory. Each tool either gets a real backend or stays honestly "Soon".

- [ ] **Ads** — real, polish + wire to the suite.
- [ ] **WhatsApp** — bot + broadcasts + shared inbox on the existing Cloud API work.
- [ ] **Leads & CRM** — its own surface (today it's fragments): every lead, statuses, inbox.
- [ ] **Social** — content + scheduling, or stays "Soon". No fake composer.
- [ ] **Insights** — real analytics across tools (today it's embedded in `Editor.tsx`). Real numbers only; empty states start at zero, never seeded.
- [ ] Show the funnel as a connected system: ad → page → capture → WhatsApp/email.
- [ ] **Reviews / Bookings** — scaffold only, stay "Soon".

## Phase 6 — Agency / white-label

`Agency.tsx` looks complete but persists to localStorage only — the tables were deferred in migration `0001`. Build the backend.

- [ ] Schema + `api/` routes for sub-accounts, per-client branding, agency settings.
- [ ] Build-for-clients flow, branding propagation to published sites, per-client isolation.
- [ ] Make it first-class in the suite — this is the wedge vs ibni, not a buried tab.

## Phase 7 — Globalize + launch prep

- [ ] Region/currency properly: migrate `Region = 'egypt' | 'gulf'` to the real market model, AED default, drop Egypt-only defaults. (Phase 1's `marketRegion` is the UI half; this is the money half.)
- [ ] Migrate the remaining AppShell pages onto the suite register so the product is one thing.
- [ ] Owner-side blockers tracked, not assumed: gateway merchant accounts + KYC (the long pole — start early), WhatsApp WABA, Clerk/Neon/Anthropic keys, DNS `autoleadss.site` + wildcard, rotate the old Supabase anon key in git history.
- [ ] Full verify: onboard by business type → tailored toolkit → luxury storefront takes a **real test payment** through a Gulf gateway → tools work → agency runs it white-labeled. Preview deploy first, real test payment there, poison-test the webhook. Do not deploy without the owner.

---

## How we build

One phase at a time. Each lands as working, tested software with local commits before the next starts. Spec-check the risky ones (payments, anything money- or data-touching) — not the cosmetic ones. Verify in the browser, both locales, before calling a phase done.
