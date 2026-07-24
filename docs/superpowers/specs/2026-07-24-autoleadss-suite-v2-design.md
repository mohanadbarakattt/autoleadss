# AutoLeadss V2 — Premium Growth Suite — Design Spec

**Date:** 2026-07-24
**Status:** Approved for implementation (to be built by Fable 5)
**Approach:** keep the built engine, **reposition + merge + make-functional + redesign premium + push to launch**. NOT a restart.

---

## 1. What AutoLeadss is now

**AutoLeadss — a premium growth suite for the Gulf and the world.** Not a funnel-builder. A **collection of genuinely functional tools** a business picks from — anchored by a **flagship luxury storefront** — plus a **business-type onboarding** that assembles the right toolkit automatically, and **real payment gateways** for the region.

**Market: Gulf + worldwide (NOT Egypt).** Deliberately **higher-class than ibni**. Ecosystem map so they don't collide: **autoleadss = premium / global**, **ibni = Egypt**, **virlo = the ads**, **nilo = the tourist product**.

The **agency marketing site** (autoleadss.com) stays — the owner likes it; it sells the suite. The old AI-funnel-builder SaaS is **repositioned**: its pieces (pages, ads, WhatsApp, leads, social, insights, white-label) survive as the **tools**, upgraded and made real.

---

## 2. Hard requirements (the owner's non-negotiables from this round)

1. **Every tool must be actually functional** — real backend, real data, real actions. **No placeholder text pretending to be a feature.** The current demo-mode (localStorage + client-side template gen) is a fallback, not the product.
2. **Real payment gateways for the market:** Gulf — **Tap · PayTabs · Telr · Checkout.com · Tabby · Tamara (BNPL)**; worldwide — **Stripe · PayPal · Apple Pay**. Each is a real integration; the merchant connects their own account (KYC is merchant/owner-side). A unified payments layer abstracts them.
3. **Merge Storefront + Landing pages** into one **"Sites"** tool with two modes: **Sell** (products + cart + checkout + payments) or **Capture** (lead / booking page). Same engine, one concept.
4. **Business-type onboarding flow** — pick your business type → the suite recommends and assembles the right toolkit + payments.
5. **Premium global redesign** (§5) — the look the prototypes established.

---

## 3. The suite (tools)

Each is a real, self-contained tool; the onboarding recommends a subset per business type.

- **Sites** (flagship; merges Storefront + Landing) — hosted pages in two modes:
  - *Sell:* premium storefront — catalogue, cart, **real-gateway checkout**, orders, inventory.
  - *Capture:* landing/booking page — lead forms, booking, thank-you, follow-up.
  - Premium templates, custom domains/subdomains (reuse `src/saas/publish/host.ts`), SEO.
- **Ads** — AI ad creation, localized (reuse `AdSuite`); can feed virlo later.
- **WhatsApp** — bot + broadcasts + shared inbox (reuse the WhatsApp Cloud API work).
- **Leads & CRM** — every lead in one place, statuses, the inbox (reuse leads/insights).
- **Social** — content + scheduling.
- **Insights** — real analytics across the tools (reuse the analytics phase).
- **Reviews** · **Bookings** — marked "soon"; scaffold, ship later.
- **Agency / white-label** — first-class (not a buried tab): sub-accounts, per-client branding, build-for-clients (reuse `Agency.tsx`, the white-label phase). This is the real wedge vs ibni.

---

## 4. Keep vs change

### KEEP (the built engine — 8 phases, env-gated, adversarially reviewed)
- Auth (Clerk + RLS), billing (entitlements + upgrade gates + `create-checkout`), the generation (edge function `generate-funnel`, streaming, model router), WhatsApp Cloud API (`whatsapp-webhook`) + Gemma bot, custom domains + host-based rendering, white-label/sub-accounts, analytics, `stripe-webhook`.
- Bilingual EN/AR (full RTL), the marketing agency site, the demo-mode fallback (so the live site never breaks).
- The C9/C10 fixes (lead-capture fail-closed, no shallow-copy leaks).

### CHANGE
- **Reposition** everything from "funnel builder" to "growth suite of tools" (Gulf/global, premium, higher-class).
- **Merge** Storefront + Landing → **Sites** (sell/capture modes).
- **Make functional:** wire the real backend for each tool so nothing is placeholder; the demo is a keyless fallback, not the shipped experience.
- **Payments:** build the **unified multi-gateway payments layer** (Tap/PayTabs/Telr/Checkout.com/Tabby/Tamara/Stripe/PayPal/Apple Pay) — merchant connects an account; checkout routes to it. This is the biggest new build.
- **Onboarding:** the business-type → toolkit flow.
- **Redesign** to the premium look (§5); apply the 6 flow improvements (below).
- **Globalize:** currency/region (AED etc.), Gulf-first defaults, drop Egypt-only defaults; keep EN/AR + add region awareness.

### The 6 flow improvements (from this round)
URL-first / describe-your-business onboarding · real proven templates (not generic) · make generation feel like magic (streamed) · show the funnel as a **connected system** (ad → page → capture → WhatsApp/email) not separate tabs · **agency/white-label first-class** · editor polish (inline edit, AI-assist, bigger live preview).

---

## 5. Visual language (premium, global)

Two coherent registers, one family:
- **The suite / admin (dark luxe):** near-black `#0c0d11` / panels `#15161c` / lines `#282a33`, text `#f4f2ec`, muted `#95938b`, **champagne gold `#c9a86a`** accent; **Cormorant Garamond** (display) + **Inter** (UI). Premium, restrained, Gulf-luxe + global.
- **The storefront output (light editorial luxury):** pearl `#faf9f5`, ink `#1a1815`, gold `#a9853f`; Cormorant + Inter; Net-a-Porter / Ounass class — big imagery, generous whitespace, AED pricing, "GCC + worldwide shipping." **A clear tier above ibni's warm-boutique.**
- Region switch (**Gulf · Global**), EN/AR RTL preserved.
- Approved prototypes: `.superpowers/{al-hub, al-storefront, al-onboarding}.html`.

---

## 6. Surfaces
1. **Onboarding** — business type → recommended toolkit + region + payments. (See `al-onboarding.html`.)
2. **Hub** — the growth suite home: flagship Storefront + tool grid, region switch. (See `al-hub.html`.)
3. **Sites** — the Sell/Capture builder + the published luxury storefront. (See `al-storefront.html`.)
4. **Each tool** — Ads · WhatsApp · Leads&CRM · Social · Insights (functional).
5. **Agency** — white-label sub-accounts, per-client branding, build-for-clients.
6. **Payments** — connect gateways, checkout.
7. **Marketing site** (kept) + **Pricing**.

---

## 7. Cross-cutting rules
- **Functional or it doesn't ship.** No fake metrics, no placeholder features. Demo-mode stays keyless as a *fallback*, clearly, never as the pitch.
- **No fabrication:** generated copy/ads grounded to the real business; captured leads/orders are real (fail-closed, C9); no invented reviews/analytics.
- **Payments:** real gateways only; merchant KYC is merchant-side; money paths fail-closed + idempotent webhooks (reuse `stripe-webhook` discipline); never mark paid before the dependent write completes.
- **Consent/compliance:** WhatsApp opt-in, GDPR/PDPL for lead data, gateway ToS.
- Keep EN/AR RTL, the C9/C10 discipline, and the demo-never-breaks-live rule.

---

## 8. Launch prep
`docs/SETUP.md` + the per-phase go-live steps mostly exist. V2 must add: the **multi-gateway payments** live (per-merchant connect + KYC), each tool's real backend active, the premium redesign shipped, region/currency, and the onboarding. **Owner/merchant-side blockers** (gateway merchant accounts + KYC, real API keys, DNS `autoleadss.site` + wildcard, deploy) are flagged, not assumed.

---

## 9. Success criteria
A Gulf (or global) business onboards by picking its type, gets a tailored toolkit, launches a **genuinely luxury** storefront that takes **real payments** through a regional gateway, runs ads/WhatsApp/leads that actually work, and an agency can run all of it white-labeled for clients — and every tool is real, not a demo. It looks a clear tier above ibni, and nothing is fabricated.

**Not in V2:** Reviews/Bookings (scaffold only); any gateway/tool whose real integration isn't complete ships behind a flag, never as fake.
