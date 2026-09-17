import { Helmet } from 'react-helmet-async'
import Navigation from './components/Navigation'
import Hero from './components/sections/Hero'
import Offer from './components/sections/Offer'
import Examples from './components/sections/Examples'
import Work from './components/sections/Work'
import Extras from './components/sections/Extras'
import Pricing from './components/sections/Pricing'
import Process from './components/sections/Process'
import Contact from './components/sections/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ChatWidget from './components/ChatWidget'
import ScrollProgress from './components/ScrollProgress'
import CookieConsent from './components/CookieConsent'
import { useLocale, useT } from './i18n/LocaleProvider'
import { SITE } from './site'

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
      <Helmet defer={false}>
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
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'AutoLeadss',
            url: canonical,
            description,
            areaServed: [
              { '@type': 'Country', name: 'Egypt' },
              { '@type': 'City', name: 'Cairo' },
              { '@type': 'City', name: 'Giza' },
              { '@type': 'City', name: 'Alexandria' },
              { '@type': 'Country', name: 'United Arab Emirates' },
              { '@type': 'City', name: 'Dubai' },
              { '@type': 'Country', name: 'Saudi Arabia' },
            ],
            serviceType: [
              'Website design',
              'Landing page design',
              'Appointment booking website',
              'Website chatbot',
              'تصميم مواقع',
              'تصميم صفحات هبوط',
            ],
            telephone: '+201100054278',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Cairo',
              addressCountry: 'EG',
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EGP',
              lowPrice: '10000',
              highPrice: '10000',
              offerCount: '2',
              offers: [
                {
                  '@type': 'Offer',
                  price: '10000',
                  priceCurrency: 'EGP',
                  description: 'Basic package in Egypt — landing page, FAQ chatbot, connect your domain. 50% upfront, 50% before handoff',
                  areaServed: 'EG',
                },
                {
                  '@type': 'Offer',
                  price: '200',
                  priceCurrency: 'USD',
                  description: 'Basic package outside Egypt — landing page, FAQ chatbot, connect your domain. 50% upfront, 50% before handoff',
                },
              ],
            },
          })}
        </script>
      </Helmet>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Offer />
        <Examples />
        <Work />
        <Extras />
        <Pricing />
        <Process />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      <CookieConsent />
    </div>
  )
}
