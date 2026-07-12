# SEO + GEO pass — autoleadss.com

Date: 2026-07-12 · Branch: `hq/seo-geo-pass` (started from clean `main`, not pushed)

Scope: public marketing routes only — `/`, `/en`, `/ar`, `/fr-eg`, `/en|ar|fr-eg/privacy`,
`/en|ar|fr-eg/terms`, `/pricing`. Authed SaaS app (`/app*`), auth forms (`/login`, `/signup`),
and per-user published funnels (`/p/:slug`) were reviewed only for robots/indexing exposure,
not content.

## Starting state

The site already had a mature SEO/GEO baseline: per-locale hreflang + x-default, canonical
tags and OG/Twitter cards via `react-helmet-async` on every public page, a `FAQPage` JSON-LD
block driven by real FAQ copy, a `Product` JSON-LD block on `/pricing` built only from prices
already defined in `src/saas/pricing.ts` (with an explicit code comment forbidding fabricated
prices on the "contact us" tiers), an `llms.txt`, and a `sitemap.xml` covering all public
routes. No fabricated facts, ratings, or prices were found anywhere in structured data.

## Before → after checklist

| Check | Before | After |
|---|---|---|
| `robots.txt` — AI crawlers | Wildcard `Allow: /` only, no explicit AI-crawler rules | Explicit `Allow: /` rules for GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot-Extended |
| `robots.txt` — private routes | Nothing disallowed | `Disallow: /app`, `/login`, `/signup` (auth/authed app, correctly kept out of the index) |
| `robots.txt` — encoding | n/a | Kept the file plain-ASCII (avoided an em dash that mis-rendered under some text/plain serving paths) so dumb parsers don't choke |
| Site-level JSON-LD types | `ProfessionalService` only | Added a `WebSite` block alongside it (Organization-equivalent already covered by `ProfessionalService`) |
| `/pricing` JSON-LD `@type` | `Product` | `SoftwareApplication` + `applicationCategory: BusinessApplication` + `operatingSystem: Web` — correct schema for a self-serve SaaS tool, same real per-tier `Offer` prices, no new fabricated data |
| `/pricing` OG tags | Missing `og:url`, `og:type` | Added both |
| `/en|ar|fr-eg/privacy`, `/terms` OG tags | None | Added `og:title`, `og:description`, `og:url`, `og:type` |
| Internal linking — `/pricing` | Orphaned: reachable only from the authed in-app nav (`AppShell`), not linked from the public marketing site at all despite being in `sitemap.xml` at priority 0.8 | Added to the footer "Company" column in all 3 locales (en/ar/fr-eg), so it's reachable in 1 click from every marketing page |
| Titles/meta descriptions | Unique per locale/page already | No change needed |
| Heading hierarchy | One `<h1>` per public page already (Hero, LegalPage, Pricing) | No change needed |
| Image alts | Decorative images correctly use `alt=""` + `aria-hidden`; content images have descriptive alts | No change needed |
| hreflang | en/ar/ar-Latn + x-default present, self-referencing, correct on every route | No change needed |
| `llms.txt` | Accurate, references real pricing and pages | No change needed |
| `sitemap.xml` | All public routes present, `lastmod` current | No change needed |

## Files changed

- `public/robots.txt` — AI-crawler allow rules, `/app` `/login` `/signup` disallow
- `index.html` — added `WebSite` JSON-LD block
- `src/saas/pages/Pricing.tsx` — `Product` → `SoftwareApplication` JSON-LD, added `og:url`/`og:type`
- `src/pages/LegalPage.tsx` — added OG tags for Privacy/Terms
- `src/i18n/translations.ts` — added a Pricing footer link (en/ar/fr-eg)

## Build

`npm run build` → passes (`tsc && vite build`, 2378 modules, no errors). Pre-existing
`>500kB chunk` warning is unrelated to this change (single JS bundle, not code-split — not
in scope for an SEO pass).

Verified live in a dev preview: footer now links to `/pricing` on the homepage, `/pricing`
now emits `SoftwareApplication` JSON-LD with correct `og:url`, `robots.txt` serves the new
crawler/disallow rules, and both `index.html` JSON-LD blocks parse as valid JSON
(`ProfessionalService`, `WebSite`).

## Not fixed — flagged for a follow-up decision

**Static `<head>` meta in `index.html` is not deduped against per-route `Helmet` tags.**
Every public route sets its own `title`/`og:title`/`og:description`/`og:url` via
`react-helmet-async`, but `index.html` also hardcodes homepage-specific values for the same
tags. `Helmet` (with `defer={false}`) appends its tags rather than replacing the static ones,
so a crawler that does execute JS sees two `og:title`/`og:url` tags per page (confirmed via
dev preview: `/pricing` renders both the generic homepage `og:title` and its own). This is
pre-existing (predates this pass) and intentionally *not* touched here: the static tags are
the fallback content seen by crawlers that don't execute JS, and removing them risks those
crawlers seeing no metadata at all on deep routes rather than stale metadata. Fixing this
properly (e.g. reducing `index.html` to only the routing-agnostic minimum, or switching
`Helmet`'s tag-dedup behavior) is a slightly larger, judgment-call change and is called out
here rather than made silently.

## Top 3 highest-leverage fixes if you want to go further

1. Resolve the `index.html` vs. `Helmet` meta-tag duplication above — affects every route's
   OG/Twitter card correctness for crawlers that render but don't fully dedupe head tags.
2. Server-render (or prerender) the public marketing routes — this is a client-rendered SPA;
   AI crawlers that don't execute JS (many don't) only ever see the static `index.html`
   shell, so `/pricing`, `/ar`, `/fr-eg`, and the legal pages are effectively invisible to
   them today regardless of the JSON-LD/meta work above.
3. Code-split the 816 kB JS bundle — not an SEO defect directly, but it's the single biggest
   lever on Core Web Vitals (LCP/INP), which factor into ranking and into how patient a
   JS-executing crawler is before giving up on the page.
