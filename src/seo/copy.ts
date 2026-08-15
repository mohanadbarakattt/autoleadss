/**
 * The site's <title> and meta description — ONE definition per locale.
 *
 * WHY THIS FILE EXISTS: these strings were hand-maintained in three places at
 * once — index.html (static, for crawlers that don't run JS),
 * src/components/DefaultSeo.tsx (the app-wide Helmet default) and src/App.tsx
 * (the per-locale override that actually wins on the homepage). Updating the
 * offer on 2026-08-15 changed two of the three; App.tsx kept re-asserting the
 * retired "complete sales systems" copy over the top, so the homepage would
 * have shipped the old description while every other surface showed the new
 * one — and nothing would have failed.
 *
 * index.html still carries its own copy because static HTML cannot import from
 * TypeScript. That one duplication is deliberate and is pinned by
 * src/agency/offer.structured-data.test.ts, which fails if the <head> and the
 * code ever disagree.
 *
 * If you change the offer, change it here.
 */

export const SITE_TITLE = {
  en: 'AutoLeadss — Website, Ads & Social Media Management in UAE & Egypt',
  ar: 'أوتوليدز — تصميم المواقع وإدارة الإعلانات والسوشيال ميديا في الإمارات ومصر',
} as const

export const SITE_DESCRIPTION = {
  en: 'One package, $1,500/month: website build or redesign, AI chatbot, weekly ad management with $500 ad spend included, and 3 social posts a week. Free 30-minute call.',
  ar: 'باقة واحدة بـ ١٥٠٠ دولار شهريّاً: بناء أو إعادة تصميم موقعك، ومساعد ذكي، وإدارة إعلانات أسبوعيّة تشمل ٥٠٠ دولار ميزانيّة إعلانات، وثلاثة منشورات أسبوعيّاً. مكالمة مجانيّة ٣٠ دقيقة.',
} as const
