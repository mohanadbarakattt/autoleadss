import { Helmet } from 'react-helmet-async'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ActionDock from '../components/ActionDock'
import CookieConsent from '../components/CookieConsent'
import PriceCard from '../components/PriceCard'
import JsonLd from '../components/JsonLd'
import { useLocale, useT } from '../i18n/LocaleProvider'
import { SITE } from '../site'
import { innerPageGraph } from '../seo/jsonld'

const GET_ICONS = [
  '/offer/icon-website.png',
  '/offer/icon-booking.png',
  '/offer/icon-forms.png',
  '/offer/icon-chat.png',
  '/offer/icon-domain.png',
] as const

export default function PricingPage() {
  const { locale, isRTL } = useLocale()
  const t = useT()
  const title = t.seo.pricingTitle
  const description = t.seo.description
  const path = locale === 'ar' ? '/se3r' : '/pricing'
  const canonical = `${SITE.origin}/${locale}${path}`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false} prioritizeSeoTags>
        <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE.origin}/en/pricing`} />
        <link rel="alternate" hrefLang="ar" href={`${SITE.origin}/ar/se3r`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE.origin}/en/pricing`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <JsonLd data={innerPageGraph(locale, path, title, description)} />
      <Navigation />
      <main className="section-padding pt-40">
        <div className="content-width grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="eyebrow text-accent">{t.offer.eyebrow}</p>
            <h1
              className="mt-3 font-display font-bold"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              {t.offer.title}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-fg">{t.offer.sub}</p>
            <ol className="mt-10 divide-y divide-border border-y border-border">
              {t.offer.gets.map((item, i) => (
                <li key={item.title} className="flex items-start gap-4 py-5">
                  <img
                    src={GET_ICONS[i]}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-border bg-white object-cover"
                  />
                  <div className="min-w-0 pt-0.5">
                    <p className="font-display text-lg font-bold leading-tight">
                      <span className="me-2 font-mono text-[11px] uppercase tracking-wider text-accent">0{i + 1}</span>
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-fg">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 font-display text-xl font-bold">{t.pricing.title}</p>
            <p className="mt-2 text-sm text-muted-fg">{t.pricing.split}</p>
          </div>
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <PriceCard />
          </aside>
        </div>
      </main>
      <Footer />
      <ActionDock />
      <CookieConsent />
    </div>
  )
}
