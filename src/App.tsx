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

export default function App() {
  const { locale } = useLocale()
  const t = useT()
  const isAr = locale === 'ar'
  const title = isAr
    ? 'أوتوليدز — أنظمة نمو ومبيعات للإمارات ومصر'
    : 'AutoLeadss — Growth & Sales Systems for UAE & Egypt'
  const description = isAr
    ? 'نبني وندير أنظمة مبيعات كاملة للإمارات ومصر: قمع مبيعات، صفحات هبوط، إعلانات جوجل، سوشيال ميديا، شات بوت ذكي، وSEO/GEO.'
    : 'We build and run complete sales systems for UAE & Egypt: sales funnels, landing pages, Google Ads, social media, AI chatbots, and SEO/GEO.'
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
