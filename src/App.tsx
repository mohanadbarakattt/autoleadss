import { Helmet } from 'react-helmet-async'
import Navigation from './components/Navigation'
import Hero from './components/sections/Hero'
import Features from './components/sections/Features'
import Testimonials from './components/sections/Testimonials'
import WhyUs from './components/sections/WhyUs'
import Comparison from './components/sections/Comparison'
import Services from './components/sections/Services'
import Process from './components/sections/Process'
import Regions from './components/sections/Regions'
import Work from './components/sections/Work'
import Showcase from './components/sections/Showcase'
import Results from './components/sections/Results'
import PricingTeaser from './components/sections/PricingTeaser'
import FAQ from './components/sections/FAQ'
import CTABanner from './components/sections/CTABanner'
import WhatsAppMarketplace from './components/sections/WhatsAppMarketplace'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollProgress from './components/ScrollProgress'
import CookieConsent from './components/CookieConsent'
import { useLocale, useT } from './i18n/LocaleProvider'
import { SITE_TITLE, SITE_DESCRIPTION } from './seo/copy'

export default function App() {
  const { locale } = useLocale()
  const t = useT()
  const isAr = locale === 'ar'
  // Read from src/seo/copy.ts — these used to be inline literals here AND in
  // DefaultSeo.tsx AND in index.html, and this copy silently won on the
  // homepage. See that file for the full story.
  const title = isAr ? SITE_TITLE.ar : SITE_TITLE.en
  const description = isAr ? SITE_DESCRIPTION.ar : SITE_DESCRIPTION.en
  const canonical = `https://autoleadss.com/${locale}`
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: t.faq.items.map(it => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet defer={false}>
        <html lang={locale} dir={isAr ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en" href="https://autoleadss.com/en" />
        <link rel="alternate" hrefLang="ar" href="https://autoleadss.com/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://autoleadss.com/en" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={isAr ? 'ar_AE' : 'en_US'} />
        <meta property="og:image" content="https://autoleadss.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://autoleadss.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <WhyUs />
        <Comparison />
        <Services />
        <Process />
        <Regions />
        <Work />
        {/* Showcase sits after Work: Work is the named case study with a real
            quote, Showcase is the volume of output behind it. */}
        <Showcase />
        <Results />
        <PricingTeaser />
        <FAQ />
        <CTABanner />
        <WhatsAppMarketplace />
      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
      <CookieConsent />
    </div>
  )
}
