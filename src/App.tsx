import { Helmet } from 'react-helmet-async'
import Navigation from './components/Navigation'
import Hero from './components/sections/Hero'
import Services from './components/sections/Services'
import Regions from './components/sections/Regions'
import Process from './components/sections/Process'
import Work from './components/sections/Work'
import Results from './components/sections/Results'
import WhyUs from './components/sections/WhyUs'
import FAQ from './components/sections/FAQ'
import CTABanner from './components/sections/CTABanner'
import Contact from './components/sections/Contact'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollProgress from './components/ScrollProgress'
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
    inLanguage: isAr ? 'ar' : 'en',
    mainEntity: t.faq.items.map(it => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang={locale} dir={isAr ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={isAr ? 'ar_AE' : 'en_US'} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Services />
        <Regions />
        <Work />
        <Results />
        <Process />
        <WhyUs />
        <FAQ />
        <CTABanner />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  )
}
