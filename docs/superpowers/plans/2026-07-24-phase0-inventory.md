# Phase 0 Inventory — AutoLeadss V2 (evidence-based)

Scope: Phase 0, plan bullet 2 ("Inventory: map every current `src/saas/pages/*` piece to its V2 tool; list what's real vs demo-only per tool"). Read-only. Every claim below is `file:line`; anything I couldn't verify is marked `UNVERIFIED`.

---

## 1) Surface → V2 tool map

| Surface | Becomes (V2 tool, spec §3) | Disposition | Evidence |
|---|---|---|---|
| `src/saas/pages/Dashboard.tsx` | **Hub** | REBUILD — today it's a funnel list + agency upsell card, not a tool-grid home. No tool-grid, no region switch. | `src/saas/pages/Dashboard.tsx:7,13,27` (imports `useFunnels`/`useAgency`; renders funnel list only) |
| `src/saas/pages/Wizard.tsx` | **Sites** (creation flow) + seeds **Onboarding** | MERGE/RENAME into Sites' creation flow. Its 6-item industry picker is the closest existing analog to "business type," but it only selects a content template — no toolkit/payments/region assembly. | `src/saas/pages/Wizard.tsx:14,55,231,369`; `src/saas/industries.ts:12-17` (6 industries: real-estate, ecommerce, clinic, restaurant, fitness, services) |
| `src/saas/pages/Editor.tsx` | **Sites** (Capture mode editor today; Sell mode doesn't exist) | REBUILD — no product/cart/inventory concept anywhere (grep negative, see §2). Keep the funnel-spec editing + `FunnelAnalytics` embed as the Capture-mode base. | `src/saas/pages/Editor.tsx:9,138,260` |
| `src/saas/pages/Published.tsx` | **Sites** published output | KEEP the engine (host-based render, lead capture, cookie-consent-gated analytics), REDESIGN to the light editorial-luxury register. | `src/saas/pages/Published.tsx:5,34,36`; `src/saas/publish/host.ts:1-32` |
| `src/saas/pages/Agency.tsx` | **Agency / white-label** | KEEP UI concept, REBUILD backend — currently 100% localStorage, no Neon table exists even with Clerk configured. Placeholder surface (see §2). | `src/saas/pages/Agency.tsx:25` (`useAgency`, `createSubAccount`, etc. from store); `src/saas/store.ts:209` ("They persist to the per-user-namespaced localStorage blob only.") |
| `src/saas/pages/AdSuite.tsx` | **Ads** | KEEP — mostly real (live AI generation with graceful demo fallback). | `src/saas/pages/AdSuite.tsx:135,489` (`isDemoContent` badge) |
| `src/saas/pages/Connect.tsx` | **WhatsApp** | KEEP — real, Neon-backed connection + shared inbox. | `src/saas/pages/Connect.tsx:37-41,142-145,152` |
| `src/saas/pages/Pricing.tsx` | Feeds **Onboarding** (plan recommendation) + **Payments** display | KEEP pricing display, REBUILD region/currency model (Egypt/Gulf binary today, no actual checkout wired to any of it). | `src/saas/pages/Pricing.tsx:61,182` |
| `src/saas/ads/` (`generate.ts`, `generateLive.ts`, `specs.ts`, `types.ts`) | **Ads** engine | KEEP | `src/saas/ads/generateLive.ts:1-40` |
| `src/saas/ai/` (`generate.ts`, `generateLive.ts`, `followUp.ts`) | **Sites** generation engine + **Leads & CRM** follow-up drafting | KEEP | `src/saas/ai/generateLive.ts:1-40`; `src/saas/ai/followUp.ts:21` |
| `src/saas/auth/` (Clerk) | cross-cutting, not a tool | KEEP as-is | `src/saas/config.ts:11-14` |
| `src/saas/billing/` (`checkout.ts`, `costs.ts`, `usage.ts`) | **Payments** foundation | REBUILD — `checkout.ts` is a stub that always returns `null`; no gateway code exists. `costs.ts`/`usage.ts` are margin/cap math only, EGP-denominated. | `src/saas/billing/checkout.ts:14,19-22` |
| `src/saas/components/AppShell.tsx` | **Hub** shell (nav chrome) | KEEP, restyle to dark-luxe | UNVERIFIED — not read line-by-line this pass |
| `src/saas/components/FunnelAnalytics.tsx` | **Insights** | REBUILD as standalone tool — today it's only embedded per-funnel inside Editor, no cross-funnel view. | `src/saas/pages/Editor.tsx:260` |
| `src/saas/components/FunnelRenderer.tsx` | **Sites** published renderer | KEEP | `src/saas/pages/Published.tsx` imports it (UNVERIFIED exact line — file not fully read) |
| `src/saas/components/ChatSimulator.tsx` | **WhatsApp** bot preview (inside Wizard/Editor) | KEEP | grep hit only, not read in full |
| `src/saas/components/LocaleSwitcher.tsx`, `SaasFooter.tsx`, `Icon.tsx`, `BrowserFrame.tsx`, `FunnelCookieConsent.tsx` | cross-cutting | KEEP | — |
| `src/saas/content/templates.ts` | **Sites** template content (also seeds Ads/Social copy) | REWRITE — heavily Egypt/Cairo-flavored, EGP-priced, mid-market tone; needs a premium Gulf/global pass (Phase 1/4) and currency globalization (Phase 7). | see §4 |
| `src/saas/db/api.ts` | funnels/leads remote client | KEEP (real) | `src/saas/store.ts:248` (`rListFunnels`) |
| `src/saas/db/domains.ts` | **Sites** custom-domain support | STUB — not migrated to Neon; every function either returns empty or throws. | `src/saas/db/domains.ts:1-32` (`notMigrated()`) |
| `src/saas/db/usage.ts` | cross-cutting billing/entitlements | KEEP (real) | `api/usage/index.ts:1-30` |
| `src/saas/db/whatsapp.ts` | **WhatsApp** client (connection + shared inbox) | KEEP (real) | `src/saas/db/whatsapp.ts:2,94` |
| `src/saas/lib/money/*` | **Payments** fee/margin math | REBUILD — hardcoded to EGP/Paymob only; needs multi-gateway, multi-currency generalization. | see §4 |
| `src/saas/lib/tracking.ts`, `visits.ts`, `reportIncident.ts` | cross-cutting | KEEP | — |
| `src/saas/publish/host.ts` | **Sites** publish/routing | KEEP — subdomain routing (`{slug}.autoleadss.site`) is real; custom-domain host lookup is NOT implemented server-side. | `src/saas/publish/host.ts:5-32`; `api/published/index.ts:9-10` ("Host-based (custom domain) lookup isn't implemented") |

**Not present as any existing surface** (net-new for V2, no file to map): Sites *Sell* mode (cart/checkout/inventory), Social, standalone Leads & CRM view, standalone Insights view, Onboarding (business-type → toolkit), Payments gateway integrations, Reviews, Bookings.

---

## 2) Per-tool: real vs demo

### The demo/env gating pattern (how the codebase decides)

Not one static flag — three separate mechanisms:

1. **Static env flags** in `src/saas/config.ts`:
   - `clerkEnabled = !!CLERK_PUBLISHABLE_KEY` (`config.ts:14`) — gates real auth vs. demo signup.
   - `remoteEnabled = false` — **hardcoded off**, a leftover from the pre-Neon (Supabase) era; its only remaining consumer is custom domains (`config.ts:16-32`).
   - `whatsappEnabled = true` — **hardcoded on** (`config.ts:43`); WhatsApp UI is always shown, live-ness depends on the merchant actually connecting Meta credentials via Connect.tsx.
2. **Runtime backend probe + silent fallback** (the dominant pattern): `store.ts`'s `bridgeClerkSession` calls `GET /api/funnels` on sign-in; success ⇒ Neon-backed "remote" mode, any failure (network error, 501 not-configured, 401, not-yet-deployed) ⇒ stays in localStorage demo mode, logged via `console.info` not `console.error`. `src/saas/store.ts:240-274`. Every `api/*` handler independently checks `getSql()`/`getDb()` and returns `501 Neon backend not configured` when `DATABASE_URL` is absent, e.g. `api/leads/[id].ts:9-10`, `api/published/lead.ts:14`.
3. **Per-call "try live, else demo" for generation**: `ai/generateLive.ts` / `ads/generateLive.ts` return `null`/demo on no session, no token, gateway not configured (503), unparseable response, or failed validation — tagging the result `isDemoContent: true`. `src/saas/ai/generate.ts:171,284`; `src/saas/ads/generate.ts:181,321`.

### Per-tool classification

| V2 tool | Real vs demo | Evidence |
|---|---|---|
| **Sites — Sell** | **DOES NOT EXIST.** No product/cart/checkout/inventory model anywhere in `src/saas` (grep for `cart\|checkout\|inventory\|product` returns only billing/pricing/ads-budget hits, not e-commerce entities). | negative grep across `src/saas/**/*.{ts,tsx}` |
| **Sites — Capture** | **REAL**, keyless-fallback-safe. Funnel CRUD (`api/funnels/index.ts`, `api/funnels/[id].ts`), fail-closed lead capture (`api/published/lead.ts:9-28`, public, no auth, C9 pattern), visit tracking (`api/published/visit.ts`). Subdomain publish is real (`publish/host.ts`). Custom domains are a stub. | `api/published/lead.ts:9-28`; `src/saas/db/domains.ts:1-32` |
| **Ads** | **REAL with demo fallback.** `api/ad-suite.ts` proxies the MBAI Model Gateway server-side; `generateAdsForPlatform` falls back to `buildDemoAdSet` on any failure so the flow always completes. | `src/saas/ads/generateLive.ts:18-31`; `api/ad-suite.ts:1-15` |
| **WhatsApp** | **REAL.** Neon tables (`api/_lib/whatsapp-schema.sql`), connect CRUD + conversations list (`api/whatsapp/connection.ts`), webhook with HMAC verification + idempotent inserts via `provider_msg_id` unique index (`api/whatsapp/webhook.ts:1-15`, `whatsapp-schema.sql:37-39`), human-approved-by-default send (`api/whatsapp/send.ts:6-13`). | `api/_lib/whatsapp-schema.sql:6-39` |
| **Leads & CRM** | **REAL data, no standalone surface.** Capture/list/status-update are real (`api/leads/[id].ts`, `api/published/lead.ts`); AI follow-up draft is real w/ template fallback (`api/leads/follow-up.ts:15-25`, `src/saas/ai/followUp.ts:21`). But there is no cross-funnel CRM page — leads only live inside `Editor.tsx` per funnel. **Placeholder gap: no standalone Leads & CRM tool.** | `src/saas/pages/Editor.tsx` (leads shown per-funnel; no dedicated CRM route found) |
| **Social** | **PLACEHOLDER SURFACE — does not exist as a tool.** "Social" only appears as generated caption/hashtag copy bundled into the funnel spec or Ad Suite output (`src/saas/content/templates.ts`, `src/saas/ai/generate.ts`). No scheduling, no account connect, no posting anywhere. | negative grep for a Social page/route |
| **Insights** | **PLACEHOLDER GAP.** `FunnelAnalytics.tsx` renders real data (`visits`, `visits_by_day` from `api/published/visit.ts` + migration `0003`), but only embedded inside `Editor.tsx` for a single funnel — no standalone cross-tool Insights page. | `src/saas/pages/Editor.tsx:260`; `api/db/migrations/0003_visits_by_day.sql` |
| **Reviews / Bookings** | Correctly absent — spec marks these "soon, scaffold only." No fake UI found for either. Nothing to flag. | negative grep |
| **Agency / white-label** | **PLACEHOLDER SURFACE.** Full UI exists (`Agency.tsx`) and looks functional, but persists to localStorage only — confirmed by an explicit code comment, and the 0001 migration comment lists `agency_settings`/`sub_accounts`/`workspaces` as deliberately not carried over to Neon. | `src/saas/store.ts:209`; `api/db/migrations/0001_autoleadss_schema.sql` (trailing comment block) |
| **Payments** | **NOT BUILT.** `billing/checkout.ts` hardcodes `billingEnabled = false` and `startCheckout` always returns `null`. No gateway integration code found anywhere (grep for PayTabs/Telr/Checkout.com/Tabby/Tamara/PayPal/Stripe-outside-comments hits only marketing copy in `templates.ts`). **This contradicts the design spec's §4 "KEEP" list**, which states billing/`create-checkout`/`stripe-webhook` are part of the kept built engine — none of that exists in this codebase; it was a Supabase Edge Function removed during the Neon migration. | `src/saas/billing/checkout.ts:1-22` |
| **Onboarding** | **PLACEHOLDER GAP — does not exist.** Closest analog is `Wizard.tsx`'s 6-item industry picker, which seeds funnel-generation content only, not a toolkit/region/payments assembly. | `src/saas/industries.ts:12-17` |
| **Hub** | **PLACEHOLDER GAP.** `Dashboard.tsx` is a funnel list + agency upsell, not a tool-grid home per `al-hub.html`. | `src/saas/pages/Dashboard.tsx:13-27` |

**Placeholder-surface count: 9** — Sites/Sell, Social, standalone Leads & CRM, standalone Insights, Agency/white-label backend, Payments, Onboarding, Hub, custom domains (Sites sub-feature).

---

## 3) Backend inventory

No Supabase anywhere in this repo (`find . -iname supabase` → nothing). Backend is Vercel serverless functions under `api/` + a Neon Postgres `autoleadss` schema, per `src/saas/billing/checkout.ts:4-8` and `api/db/migrations/*`.

### Functions (`api/**`)

| File | Does | Serves |
|---|---|---|
| `api/funnels/index.ts` | GET list / POST create funnel (Clerk-scoped) | Sites |
| `api/funnels/[id].ts` | GET/PATCH/DELETE one funnel; PATCH sanitizes GA4/pixel IDs before persisting | Sites |
| `api/published/index.ts` | GET public lookup of a published funnel by slug (no auth) | Sites (published output) |
| `api/published/lead.ts` | POST public lead capture, resolves funnel owner server-side, fail-closed | Leads & CRM |
| `api/published/visit.ts` | POST public visit counter (running total + daily rollup) | Insights (data source) |
| `api/leads/[id].ts` | PATCH lead status (owner-scoped) | Leads & CRM |
| `api/leads/follow-up.ts` | POST AI-drafted WhatsApp follow-up via MBAI gateway, template fallback | Leads & CRM / WhatsApp |
| `api/whatsapp/connection.ts` | GET connection (secrets stripped) / GET conversations / POST create-or-update | WhatsApp |
| `api/whatsapp/send.ts` | POST outbound message, human-approved by default, service-window gated | WhatsApp |
| `api/whatsapp/webhook.ts` | GET Meta subscription handshake / POST inbound messages, HMAC-verified, idempotent | WhatsApp |
| `api/ai-generate.ts` | POST AI funnel copy generation via MBAI Model Gateway, server-side AI-cap backstop | Sites (generation) |
| `api/ad-suite.ts` | POST AI ad copy generation via MBAI Model Gateway | Ads |
| `api/usage/index.ts` | GET/POST per-user monthly usage counters (WhatsApp-AI, AI-action) | cross-cutting billing/entitlements |
| `api/incidents.ts` | POST unauthenticated proxy for browser-reported lost writes (lead drops etc.) → MBAI gateway | cross-cutting reliability, not a tool |
| `api/_lib/{auth,db,http,mapping,usage,whatsapp}.ts` | Shared helpers (Clerk verify, Neon client, response helpers, row mapping, usage increments, WhatsApp window/idempotency logic) | cross-cutting, all functions |

**Not present:** any `create-checkout`, `stripe-webhook`, or other payment-gateway function. `api/domains/*` does not exist (`src/saas/db/domains.ts` stub confirms this).

### Neon tables (schema `autoleadss`)

| Table | Migration | Serves |
|---|---|---|
| `autoleadss.funnels` (incl. `visits`, `visits_by_day` jsonb) | `0001`, `0003` | Sites, Insights |
| `autoleadss.leads` | `0001` | Leads & CRM |
| `autoleadss.usage_counters` | `0002` | cross-cutting billing/entitlements |
| `autoleadss.whatsapp_connections` | `api/_lib/whatsapp-schema.sql` | WhatsApp |
| `autoleadss.whatsapp_messages` | `api/_lib/whatsapp-schema.sql` | WhatsApp |

`public.users` is referenced (FK target) but owned by the shared MBAI gateway project, not this app — `api/db/migrations/0001_autoleadss_schema.sql:1-9`.

**Explicitly NOT migrated** (per `0001`'s own trailing comment): `workspaces`, `agency_settings`, `sub_accounts`, `domains` — these existed in the old Supabase schema and have no Neon equivalent; the app keeps that state in localStorage regardless of backend reachability. `api/db/migrations/0001_autoleadss_schema.sql` (final comment block).

---

## 4) Globalization debt (Phase 7 must fix)

- **Currency model hardcoded to EGP as the base unit.** `src/saas/lib/money/constants.ts:11-13` (`PIASTRES_PER_EGP`), `:16-24` (`DEFAULT_USD_TO_EGP = 55`), `:27-33` (Paymob flat-fee-in-EGP constant), `:40` (`EGYPT_VAT_RATE`). `src/saas/lib/money/money.ts:13,17,46,56` — `formatMoney` hardcodes an `"EGP"` suffix. `src/saas/lib/money/fees.ts:14-54` — fee model is Paymob/Fawry (Egypt-only payment rails) specific; no AED/multi-gateway concept.
- **Dual-region pricing is Egypt-vs-Gulf binary, not Gulf/Global.** `src/saas/pricing.ts:22,36,50,63,76,89,111,134-136` — every tier has a `priceEgypt` field (e.g. `'1,500 EGP'`) and a single `priceGulf` (plain `'$X'`, no AED/SAR granularity); `region === 'egypt' ? pack.priceEgypt : pack.priceGulf` ternary at `src/saas/pages/Pricing.tsx:182`.
- **Region auto-detection is Cairo-timezone-based.** `src/saas/pricing.ts:94-98` — `Intl.DateTimeFormat().resolvedOptions().timeZone === 'Africa/Cairo' ? 'egypt' : 'gulf'`. Binary only; no "Global" third region per spec §5.
- **AI system prompts hardcode Egypt+Gulf market framing.** `src/saas/ai/generate.ts:189` ("for businesses in Egypt and the Gulf... suited to the Gulf/Egyptian market"); `src/saas/ads/generate.ts:204` (same framing for ad copy); `src/saas/ai/followUp.ts:21` — explicitly instructs the model to write in "Egyptian colloquial Arabic (the 'Franco' register)" regardless of the business's actual market.
- **i18n hardcodes EGP as a unit label.** `src/saas/i18n.tsx:58,116` (`egypt: 'Egypt'` region label), `:154,432` (`perDay: 'EGP/day'` / `'EGP/yom'` — literally baked into both locale variants).
- **`src/saas/content/templates.ts` is the single largest item.** Dozens of Cairo/Dubai/Abu Dhabi/Riyadh city references and EGP prices baked into all 6 industry templates (real-estate, ecommerce, clinic, restaurant, fitness, services) × both languages. Representative: `templates.ts:509` ("Free delivery over AED 200 / EGP 1,500"), `:592` (EGP VAT-inclusive delivery threshold copy), `:997` ("Dental & Aesthetic Excellence — Dubai, Abu Dhabi & Cairo"), `:1985` ("Boutique training studio — Dubai · Abu Dhabi · Cairo"), `:605,723` ("120,000+ women across the Gulf and Egypt"). This needs a full Gulf/global rewrite (Phase 1/4 premium pass), not just a find-replace on currency.
- **Margin/cost math is EGP-denominated throughout.** `src/saas/billing/costs.ts:15,26-27` (imports Paymob fee constants for margin calc); `src/saas/lib/money/margin.ts:14-25,109,174-198` (margin floor computed in EGP, exchange-rate-sensitive).

---

## 5) Design tokens today

- **`tailwind.config.js:1-35`** — `colors`: `background #FAFAF7`, `foreground #0A0A0B`, `accent #FF5C2A` / `accent-2 #FF8A5C`, `ink`, `muted #F1EFE9`, `border #E2DED4`, `card #FFFFFF`, `muted-fg #57544E`, `text-dim #6B6660`. `fontFamily`: `sans: Switzer`, `display: "General Sans"`, `mono: JetBrains Mono`, `arabic: IBM Plex Sans Arabic`. Custom `borderRadius` scale (`sm` 6px → `2xl` 28px), `maxWidth.content: 1200px`.
- **`src/index.css:5-13`** — CSS custom properties mirror the same palette (`--background`, `--foreground`, `--accent`, `--muted`, `--border`, `--card`, `--muted-fg`, `--text-dim`). RTL override switches body/headings to `'IBM Plex Sans Arabic'` (`index.css:41-51`). Orange gradient utility `.text-gradient-accent` (`index.css:~70`, `linear-gradient(100deg, #FF5C2A 0%, #FF8A5C 55%, #FF5C2A 100%)`).
- **`index.html:57-64`** — fonts loaded via Fontshare (Switzer, General Sans) + Google Fonts (JetBrains Mono, IBM Plex Sans Arabic). Zero references to Cormorant Garamond or Inter anywhere in the codebase (grep negative).
- **One single theme serves both the marketing site and the entire SaaS app** — there is no separate "suite" register today. Every `src/saas/pages/*` page inherits this same light, orange-accent, Switzer/General-Sans system (confirmed: no second theme file, no `dark` variant class usage found).
- **The V2 dark-luxe system (`#0c0d11` / `#15161c` / `#282a33` / `#c9a86a` champagne gold / Cormorant Garamond) exists only as static markup in the three prototypes** — `.superpowers/al-hub.html`, `.superpowers/al-storefront.html`, `.superpowers/al-onboarding.html`. Grep for `c9a86a`/`0c0d11`/`Cormorant` across `src/` returns zero hits. Phase 1 is building this from scratch, not "restyling an existing token file."

---

## Summary (≤20 lines)

**9 placeholder surfaces** found: Sites/Sell mode, Social, standalone Leads & CRM view, standalone Insights view, Agency/white-label backend (UI-only, localStorage), Payments (0% built), Onboarding, Hub (tool-grid), and custom domains (Sites sub-feature, explicit stub).

**Biggest gaps vs V2:**
1. **Payments is not a "make functional" job, it's a from-scratch build.** `billing/checkout.ts` hardcodes `billingEnabled = false`; zero gateway code exists for any of Tap/PayTabs/Telr/Checkout.com/Tabby/Tamara/Stripe/PayPal/Apple Pay outside marketing copy.
2. **Sites/Sell (catalogue+cart+checkout+inventory) has no code to "merge" with Landing** — there is no e-commerce data model in this codebase at all. "Merge Storefront + Landing" assumes a Storefront that doesn't exist yet.
3. **Agency/white-label is a convincing fake** — full UI, zero persistence. Worth flagging loudly since spec calls it "the real wedge vs ibni."
4. **Social and standalone Insights/CRM tools don't exist as surfaces**, only as embedded fragments or generated-copy byproducts.
5. **The dark-luxe design system doesn't exist in code** — only in 3 static HTML prototypes. Phase 1 is net-new token/theme work, not a retint.

**Contradicts plan assumptions:**
- Design spec §4 "KEEP" claims `create-checkout` and `stripe-webhook` are part of the kept built engine — **neither exists in this repo**; it was a Supabase Edge Function removed during the Phase-2 Neon migration (`billing/checkout.ts:4-8`). Phase 3 (payments) has zero existing scaffolding to build on, contrary to "keep the built engine."
- Plan says "reuse `Agency.tsx`, the white-label phase" (Phase 6) — `Agency.tsx` UI is reusable, but the backend it needs to reuse doesn't exist; Phase 6 needs new Neon tables (`agency_settings`, `sub_accounts`, `workspaces`) that migration `0001` explicitly deferred.
- Plan says "reuse `src/saas/publish/host.ts`" for Sites domains — true for subdomains only; custom-domain lookup is unimplemented server-side, so "reuse" undersells the remaining work there.
