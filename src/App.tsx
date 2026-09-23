import { Helmet } from 'react-helmet-async'
import Navigation from './components/Navigation'
import Hero from './components/sections/Hero'
import Offer from './components/sections/Offer'
import Examples from './components/sections/Examples'
import Work from './components/sections/Work'
import Faq from './components/sections/Faq'
import Process from './components/sections/Process'
import Contact from './components/sections/Contact'
import Footer from './components/Footer'
import ActionDock from './components/ActionDock'
import ScrollProgress from './components/ScrollProgress'
import CookieConsent from './components/CookieConsent'
import Analytics from './components/Analytics'
import QuoteBuilder from './components/sections/QuoteBuilder'
import JsonLd from './components/JsonLd'
import SeoIcons from './components/SeoIcons'
import { useLocale, useT } from './i18n/LocaleProvider'
import { SITE } from './site'
import { homeGraph } from './seo/jsonld'

const HTML_LANG = { en: 'en', ar: 'ar' } as const

export default function App() {
  const { locale } = useLocale()
  const t = useT()
  const isAr = locale === 'ar'
  const title = t.seo.title
  const description = t.seo.description
  const canonical = `${SITE.origin}/${locale}`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false} prioritizeSeoTags>
        <html lang={HTML_LANG[locale]} dir={isAr ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={t.seo.keywords} />
        <meta name="geo.region" content="EG-C" />
        <meta name="geo.placename" content="Cairo" />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href={`${SITE.origin}/en`} />
        <link rel="alternate" hrefLang="ar" href={`${SITE.origin}/ar`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE.origin}/en`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={isAr ? 'ar_EG' : 'en_US'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <SeoIcons />
      <JsonLd data={homeGraph(locale, title, description)} />
      <ScrollProgress />
      <Analytics />
      <Navigation />
      <main>
        <Hero />
        <Offer />
        <Examples />
        <Work />
        <QuoteBuilder />
        <Faq />
        <Process />
        <Contact />
      </main>
      <Footer />
      <ActionDock />
      <CookieConsent />
    </div>
  )
}
