# AutoLeadss — Grok Master Context

**Purpose:** Give another AI the full, current context required to represent AutoLeadss accurately, continue the website, prepare sales material, and run owner-led outreach without inventing facts.

**Context date:** 2 October 2026, Africa/Cairo.

## 1. Current truth and release status

- Local repository: `C:\Users\user\autoleadss`
- Repository: `https://github.com/mohanadbarakattt/autoleadss`
- Production domain: `https://autoleadss.com`
- Vercel project: `autoleadss`, team `mohanadbarakattts-projects`
- Production deploys from GitHub branch `main`.
- Current local release commit: `af704b3` — `Launch AutoLeadss membership systems`.
- The commit exists locally on branch `master` and has **not yet been pushed to `origin/main`**.
- Therefore, never claim that the membership-system rebuild is live until that push succeeds and Vercel reports `READY`.
- Last verified local production build: successful (`npm run build`).
- Verified local routes returned HTTP 200 in English and Arabic.

This file supersedes the older `docs/PROJECT_CONTEXT.md`, which describes a previous agency/SaaS direction and is not authoritative for the present business.

## 2. What AutoLeadss is now

AutoLeadss is a productised service for local businesses with repeat purchases. It turns an existing repeat service or product into a branded membership system the merchant owns.

The first target market is Madinaty and nearby Cairo businesses. Initial niches:

- barbers and salons;
- car washes;
- laundries;
- pet-food and pet-care shops;
- cafés;
- later: gyms, clinics, beauty studios and other repeat-service businesses.

AutoLeadss is **not** trying to be a large multi-tenant SaaS or ERP. The model is deliberately simple:

1. identify a repeat purchase with viable margins;
2. design the packages and operating rules;
3. build a premium bilingual storefront;
4. connect payment through the merchant's approved account;
5. provide a customer QR pass and staff redemption flow;
6. provide a focused owner dashboard;
7. train the team and hand over the system and code.

Each merchant receives a separately branded implementation. AutoLeadss reuses a proven product foundation, not a generic-looking public template.

## 3. The commercial offer

### Founding offer — first five clients

- Total: **20,000 EGP**.
- Payment: **10,000 EGP to start + 10,000 EGP at accepted handoff**.
- Target delivery: **two weeks** after deposit, approved content, package rules and required account access are received.
- The merchant owns the delivered build.
- The merchant agrees that AutoLeadss may document the finished project as a case study/testimonial.

### Standard offer — after the first five

- Starts at **35,000 EGP**, subject to confirmed scope.
- Typical payment: 50% to start and 50% at accepted handoff.

### Custom work

Quoted for multiple branches, staff authentication/permissions, complex delivery rules, integrations, migration, or advanced reporting.

### Core deliverables

- custom Arabic and English sales storefront;
- up to three launch plans;
- 1, 3, 6 and 12-month terms;
- merchant-payment connection;
- customer QR membership pass;
- staff scan/redemption flow;
- focused owner dashboard;
- installable PWA;
- domain connection, training, deployment and code handoff;
- 30-day bug warranty is the intended delivery boundary in `MEMBERSHIP_PRODUCT_FOUNDATION.md`.

### External costs and boundaries

Domain, hosting, email/SMS usage, payment-provider transaction fees and third-party subscriptions are paid to their providers. Merchant approval by Paymob, valU, Forsa, Halan or any other provider is controlled by that provider. Photography, logo redesign, paid advertising, booking, inventory, accounting, native applications and post-warranty support are not silently included; scope them explicitly.

Never lead a sales conversation with exclusions. Lead with repeat revenue, prepayment, customer retention and ownership. Clarify boundaries after interest exists.

## 4. Customer value proposition

Primary outcome: **sell the month upfront**.

Merchant benefits:

- receives larger payments upfront;
- secures customers for several months;
- creates a repeat habit instead of waiting for the next visit;
- makes customer return easier with a QR pass;
- gives staff a simple redemption action;
- sees prepaid revenue, active members, usage and renewals;
- owns the delivered system and pays AutoLeadss once for the implementation;
- gets a system styled around the business rather than generic software.

Do not promise that subscriptions automatically create demand. The merchant still needs a repeat purchase customers already value and a package with viable unit economics.

## 5. Product journey

The canonical demo scenario is fictional and brand-neutral:

- Business: `Service Business`
- Plan: `Regular plan`
- Allowance: 4 uses monthly
- Term: 3 months
- Simulated total: 2,400 EGP

Seven-step flow:

1. customer chooses the plan;
2. customer checks out;
3. payment is received;
4. customer receives a QR pass;
5. staff scans the QR;
6. balance changes from 4 to 3;
7. dashboard updates: members 84→85, prepaid revenue 71.4K→73.8K EGP, daily uses 18→19.

The homepage contains a compact autoplay version. `/en/demo/membership-flow` and `/ar/demo/membership-flow` contain the full interactive version with play, pause, replay and niche switching.

## 6. Public website information architecture

### Public, customer-facing routes

| Route | Purpose |
|---|---|
| `/en`, `/ar` | Main sales page: hero, product flow, package lab, selected work, offer, process, FAQ, contact. |
| `/en/work`, `/ar/work` | Honest portfolio plus fictional membership templates. |
| `/en/packages`, `/ar/packages` | Five niche package blueprints and the package-design method. |
| `/en/pricing`, `/ar/se3r` | Founding, Standard and Custom service levels. |
| `/en/demo/membership-flow`, `/ar/demo/membership-flow` | Full interactive end-to-end demo. |
| `/en/demo/lashes`, `/ar/demo/lashes` | Lash Cartel client/concept demonstration. |
| `/en/privacy`, `/ar/privacy` | Privacy. |
| `/en/terms`, `/ar/terms` | Terms. |

### Private pitch routes

These are private sales concepts and use `noindex`. They are not official websites and must not be presented as commissioned work:

- `/en/pilots`, `/ar/pilots`
- `/en/pilot/jo-x`
- `/en/pilot/212-car-wash`
- `/en/pilot/wash-and-wash`
- `/en/pilot/petsika`
- `/en/pilot/741-cafe`
- append `/admin` to each pilot route for its owner-dashboard concept.

### Public proof policy

Named public work:

- TUT — live product — `https://tutapp.co`
- Lash Cartel — client/concept demo — `/en/demo/lashes`
- MBAI Group — group website — `https://mbai-group.com`

Public fictional template brands:

- Line & Lather — barber;
- Clean Mile — car wash;
- Fold House — laundry;
- Good Dog Club — pet care;
- Daily Cup — café.

Never show the Madinaty shop-specific pitch concepts as commissioned public portfolio work. Never say those businesses are clients unless a signed engagement exists.

## 7. Package blueprint library

These are illustrative starting points, not final offers or promises.

| Niche | Example plan | Allowance | Important rule |
|---|---|---|---|
| Barber | Sharp Monthly | 2 cuts + 2 beard services | maximum one visit weekly |
| Car wash | Always Clean | 4 off-peak washes | one registered vehicle |
| Laundry | Home 20 | 20 kg + 2 pickups | allowance expires monthly |
| Pet care | Complete Care | dry + fresh food + grooming | delivery and grooming scheduled |
| Café | Daily 20 | 20 drinks monthly | maximum one drink daily |

Terms shown to prospects: 1, 3, 6 and 12 months. Before proposing a final price, determine direct cost, normal purchase frequency, gross margin, capacity constraints, breakage/unused allowance assumptions and abuse controls.

## 8. Design system

The intended aesthetic is editorial, premium and product-led—not a generic SaaS template and not “AI slop.”

### Brand tokens

- near-black: `#0A0A0B`
- warm white: `#FAFAF7`
- orange accent: `#FF5C2A` / softer `#FE8C58`
- green operational accent: `#1E7E48`
- warm section background: `#EFECE4` / `#EAE6DB`
- border: `#E2DED4`
- muted text: `#57544E`

### Typography

- display: General Sans;
- body: Switzer;
- editorial italic: Newsreader;
- labels/data: JetBrains Mono;
- Arabic/RTL: IBM Plex Sans Arabic.

### Design rules

- concise hero copy with a relevant product visual;
- strong spacing, large editorial headings and controlled use of rounded surfaces;
- avoid badge walls, generic gradient blobs and excessive marketing copy;
- screenshots use exact aspect ratios or `object-contain`; never crop important UI;
- templates share information architecture but not surface styling;
- language toggle is always visible in the navigation;
- mobile and RTL are first-class;
- motion respects `prefers-reduced-motion`;
- use real approved content and images for client builds;
- interactive details should support understanding, not distract.

## 9. Technical stack and architecture

- Vite 5
- React 18
- TypeScript
- Tailwind CSS 3
- React Router 7
- Framer Motion 12
- React Helmet Async
- Lucide icons
- static SPA deployed on Vercel
- service worker + web manifest for PWA installation

The marketing/demo repository is not the final transactional backend. A real merchant build should use a separate transactional application with server-side payment webhooks, secure authentication, persistent data and atomic redemption. The current recommendation is documented in `docs/MEMBERSHIP_PRODUCT_FOUNDATION.md`.

Security requirements for real builds:

- QR holds an opaque token, never a phone number or sequential database ID;
- redemption is atomic and idempotent;
- payment webhooks are verified and replay-safe;
- expired, paused and empty memberships cannot be redeemed;
- staff permissions and audit trails are enforced server-side;
- provider secrets never enter browser code.

## 10. Important file map

### Repository and deployment

- `package.json` — dependencies and build scripts.
- `vite.config.ts` — Vite configuration.
- `tailwind.config.js` — design tokens and Tailwind theme.
- `vercel.json` — Vite build/output and SPA rewrites; explicitly preserves static PWA and asset paths.
- `index.html` — base metadata, icons, Google Ads tag and application mount point.
- `README.md` — current membership-system overview.

### Application entry and global behavior

- `src/main.tsx` — route table, lazy-loaded pages, locale providers and service-worker registration.
- `src/App.tsx` — main homepage shell, SEO, navigation, analytics, content and footer.
- `src/index.css` — global tokens, typography, RTL behavior, layout utilities and animation primitives.
- `src/site.ts` — canonical domain, email, WhatsApp, MBAI link and selected public work constants.
- `src/analytics.ts` — conversion event helpers.

### Main public experience

- `src/components/sections/HomePageSystem.tsx` — authoritative homepage content and layout: hero, product flow, interactive niche packages, selected work, founding offer, process, FAQ and contact CTA.
- `src/components/MembershipFlowDemo.tsx` — shared compact/full seven-step animated demo engine.
- `src/pages/MembershipFlowDemoPage.tsx` — full bilingual demo page.
- `src/pages/PackagesPage.tsx` — five generalized niche package blueprints and payment-provider compatibility.
- `src/pages/WorkIndex.tsx` — selected real work plus fictional niche templates.
- `src/pages/PricingPage.tsx` — focused pricing entry page.
- `src/components/ServiceTiers.tsx` — Founding, Standard and Custom commercial tiers.
- `src/components/Navigation.tsx` — responsive navigation and always-visible EN/AR switch.
- `src/components/Footer.tsx` — contact, MBAI relationship and legal links.
- `src/components/ActionDock.tsx` — mobile conversion CTA.
- `src/components/CookieConsent.tsx` — consent UI.
- `src/components/Analytics.tsx` — analytics lifecycle.
- `src/components/ScrollProgress.tsx` — page progress indicator.

### Localization and SEO

- `src/i18n/LocaleProvider.tsx` — route-aware locale state and path switching.
- `src/i18n/translations.ts` — shared English/Arabic copy retained by legacy and current components.
- `src/seo/jsonld.ts` — authoritative runtime JSON-LD including the 20,000 EGP founding and 35,000 EGP standard offer.
- `src/seo/pageFaq.ts` — bilingual FAQ source.
- `src/components/JsonLd.tsx` — JSON-LD renderer.
- `src/components/SeoIcons.tsx` — SEO/social icon metadata.
- `public/sitemap.xml` — public route inventory.
- `public/robots.txt` — crawler policy and sitemap link.
- `public/llms.txt` — machine-readable business/offer summary; this is intentionally aligned with this master context.

### Generic demos and selected work

- `src/pages/DemoPage.tsx` — routes the generic industry demos.
- `src/pages/demos/*` — café, dentist, gym, agency and Lash Cartel presentation components.
- `src/demos/data.ts` — generic demo content.
- `src/demos/seo.ts` — demo SEO metadata.
- `public/demos/*` — demo screenshots and imagery.
- `public/work/tut.png` — TUT screenshot.
- `public/work/mbai.png` — MBAI Group screenshot.

### Private Madinaty pitch kit

- `src/pilots/data.ts` — all five pilot businesses, routes, sample plans, public phones and source links.
- `src/pages/PilotStorefront.tsx` — branded storefront concept renderer.
- `src/pages/PilotAdmin.tsx` — dashboard/scanner concept renderer.
- `src/pages/PilotsIndex.tsx` — private pitch index; noindex.
- `public/pilots/*` — locally stored pilot hero imagery.
- `public/work/concepts/*` — concept screenshots.
- `public/manifests/*` — installable PWA manifests per pilot.
- `docs/PILOT_VISIT_KIT.md` — in-person pitch notes, questions and concept packages.

### PWA

- `public/manifest.webmanifest` — main install metadata.
- `public/pwa-icon.svg`, `public/pwa-192.png`, `public/pwa-512.png` — PWA icons.
- `public/sw.js` — network-first navigation with `/en` offline fallback and cache version `autoleadss-memberships-v2`.

### Business and product documentation

- `docs/MEMBERSHIP_PRODUCT_FOUNDATION.md` — real product boundary, recommended architecture, data model, security and acceptance tests.
- `docs/PILOT_VISIT_KIT.md` — private in-person Madinaty visit kit.
- `docs/GROK_MASTER_CONTEXT.md` — this authoritative handoff.
- `docs/OUTREACH_OPERATING_PLAYBOOK.md` — immediate owner outreach system and scripts.
- `docs/PROJECT_CONTEXT.md` — historical context only; stale for current positioning.

### Legacy/unused components

Several older section components remain in `src/components/sections/` because the history has not yet been aggressively deleted. `HomePageSystem.tsx` is the actual homepage. Do not edit older `Hero.tsx`, `Offer.tsx`, `Process.tsx`, `Work.tsx`, `Contact.tsx`, `MembershipFlow.tsx` or `SubscriptionFlow.tsx` unless first confirming they are imported. Search imports before changing or removing them.

## 11. Five Madinaty pilot prospects

All are in/around Craft Zone. Public directory information can change; call first and verify. No owner names or emails have been publicly verified. Do not invent them.

| Priority | Business | Niche | Public phone | WhatsApp status | Core pitch |
|---|---|---|---|---|---|
| 1 | Jo X Salon | barber | 011 13788547 | mobile number; verify WhatsApp before claiming | 2 cuts or cut-and-beard credits paid upfront |
| 2 | 212 Car Wash | car wash | not found | unavailable; visit or Instagram first | 2/4 washes, especially off-peak |
| 3 | Wash & Wash | laundry | 010 44856555 | mobile number; verify WhatsApp before claiming | 10/20/30 kg with pickup allowances |
| 4 | Petsika | pet care | 011 00619110 | mobile number; verify WhatsApp before claiming | scheduled food/fresh-food/grooming packages |
| 5 | 741 Café | café | 012 22335384 | mobile number; verify WhatsApp before claiming | 10/20 drinks, maximum one daily |

Public source pages:

- Jo X: `https://madinatyadvisor.com/listing/jo-x-salon/`
- 212: `https://madinatyadvisor.com/listing/212-car-wash/`
- Wash & Wash: `https://madinatyadvisor.com/listing/wash-wash/`
- Petsika: `https://madinatyadvisor.com/listing/petsika/`, `https://petsika.com/`
- 741: `https://madinatyadvisor.com/listing/741-seven-forty-one-cafe-lounge/`

## 12. Outreach rules for Grok

### Goals

- book a 15–20 minute owner/manager demo;
- learn actual repeat-purchase economics;
- secure one of the first five founding clients;
- never pressure staff who cannot decide;
- record consent before using a project as a testimonial/case study.

### Required tone

- Egyptian Arabic, short and human;
- specific to the business and the repeat purchase;
- confident but not inflated;
- show the private concept early;
- do not call it “AI”; do not lead with “software” or “website.”

### Never claim

- that a pitch prospect is already a client;
- that the private concept is official or commissioned;
- guaranteed revenue, retention or ROI;
- confirmed Paymob/valU/Forsa/Halan approval;
- unlimited redemption unless the economics explicitly support it;
- that the local release is live before production deployment is `READY`.

### Data to collect on every qualified conversation

1. decision-maker name and role;
2. preferred contact channel;
3. normal price and direct cost of the repeat purchase;
4. normal customer frequency;
5. quiet/busy capacity windows;
6. proposed allowance, expiry, rollover and abuse controls;
7. payment provider and approval status;
8. required languages;
9. approved logo, images, service/menu and prices;
10. next step and exact follow-up date.

## 13. Canonical Egyptian-Arabic opening

> أهلاً، أنا مهند من AutoLeadss. عملت تصور خاص لـ[اسم النشاط] لأن عندكم خدمة/منتج العميل بيرجع له كل شهر. الفكرة إن العميل يختار باقة ويدفع المدة مقدماً، يستلم QR للعضوية، وفريقكم يخصم الاستخدام في ثواني، وإنت تشوف الإيراد والأعضاء من لوحة بسيطة. ده تصور خاص مش موقع رسمي. ينفع أوريه للمالك أو المدير في 10 دقايق؟

Short WhatsApp version:

> أهلاً، أنا مهند من AutoLeadss. عملت تصور خاص لـ[اسم النشاط] يحوّل [الخدمة المتكررة] لباقات شهرية مدفوعة مقدماً، مع QR للعميل ولوحة متابعة للمالك. عندي ديمو جاهز باسم النشاط، ومحتاج 10 دقايق أعرضه على المالك/المدير. أول 5 عملاء عندنا بسعر تأسيسي 20 ألف جنيه: 10 آلاف للبدء و10 آلاف عند التسليم خلال أسبوعين. مناسب أبعت الديمو هنا؟

Do not send the price in the very first message if the contact is cold and likely to ignore a long pitch. Use the shorter curiosity-led version first, then disclose the complete price before scheduling a formal workshop.

## 14. Immediate next actions

1. Obtain explicit approval to push commit `af704b3` to `origin/main`.
2. Wait for Vercel production status `READY`.
3. Verify `https://autoleadss.com/en`, `/ar`, `/en/work`, `/en/packages`, `/en/pricing` and `/en/demo/membership-flow` on production.
4. Call Jo X, Wash & Wash, Petsika and 741 to confirm the owner/manager and whether the published mobile number accepts WhatsApp.
5. Approach 212 via in-person visit or verified Instagram because no public phone is currently recorded.
6. Send the tailored message only after confirming the correct channel.
7. Track every response in one sheet: business, contact, channel, first touch, status, decision-maker, next action, follow-up date and notes.
8. Use private pilot pages during sales; use public generalized pages for broad outbound.

## 15. Instruction to any successor AI

Treat this document and the current code as authoritative. When facts conflict, prefer verified current repository state and live production checks. Preserve the split between public generalized templates and private shop-specific pitches. Never fabricate contacts, testimonials, ownership, payment-provider approval or deployment status. Keep copy concise and Egyptian-market aware. The goal is to sell a clear, owned membership system—not to grow AutoLeadss into a large generic SaaS.
