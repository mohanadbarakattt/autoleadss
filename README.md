# AutoLeadss — autoleadss.com

Company website for AutoLeadss: growth & sales systems for businesses in the UAE and Egypt (sales funnels, landing pages, Google Ads, social media, AI chatbots, SEO & GEO).

Bilingual (English `/en` + Arabic `/ar` with full RTL), 3D interactive hero, tilt-card sections, case studies, and a WhatsApp-first marketplace connector (no contact form/backend — every listing deep-links straight to WhatsApp).

## Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3 + Framer Motion (3D tilt, parallax, scroll reveals)
- Fonts: General Sans + Switzer (Fontshare), IBM Plex Sans Arabic, JetBrains Mono

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview
```

## Deploy (Vercel)

Framework preset: **Vite** · Build: `npm run build` · Output: `dist`.
`vercel.json` rewrites all routes to `index.html` for SPA routing (`/en`, `/ar`).

## Structure

- `src/components/sections/` — Hero, Services, Process, Work (case studies), Results, Testimonials, WhyUs, PricingTeaser, FAQ, CTABanner, WhatsAppMarketplace
- `src/components/` — Navigation, Footer, Logo (SVG mark), TiltCard (3D hover), ChatWidget, WhatsAppButton
- `src/i18n/translations.ts` — all copy in EN + AR + Franco
