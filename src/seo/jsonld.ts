import { SITE } from '../site'
import type { Locale } from '../i18n/translations'
import { PAGE_FAQ } from './pageFaq'
import type { DemoId } from '../demos/data'
import { DEMO_SEO } from '../demos/seo'

const AREA_SERVED = [
  { '@type': 'Country', name: 'Egypt' },
  { '@type': 'City', name: 'Cairo' },
  { '@type': 'City', name: 'Giza' },
  { '@type': 'City', name: 'Alexandria' },
  { '@type': 'Country', name: 'United Arab Emirates' },
  { '@type': 'City', name: 'Dubai' },
]

const OFFER_EGP = {
  '@type': 'Offer',
  price: '10000',
  priceCurrency: 'EGP',
  availability: 'https://schema.org/InStock',
  url: `${SITE.origin}/en`,
  description:
    'Website, appointment booking on the page, forms that arrive, local FAQ chatbot on the page, connect a domain you already own. Egypt. Half before we start. Half before handoff.',
  areaServed: 'EG',
}

const OFFER_USD = {
  '@type': 'Offer',
  price: '200',
  priceCurrency: 'USD',
  availability: 'https://schema.org/InStock',
  url: `${SITE.origin}/en`,
  description:
    'Website, appointment booking on the page, forms that arrive, local FAQ chatbot on the page, connect a domain you already own. Outside Egypt. Half before we start. Half before handoff.',
}

function faqEntities(locale: Locale) {
  return PAGE_FAQ[locale].map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  }))
}

function professionalService(locale: Locale, pageUrl: string) {
  const isAr = locale === 'ar'
  return {
    '@type': 'ProfessionalService',
    '@id': `${SITE.origin}/#business`,
    name: SITE.name,
    alternateName: isAr ? 'أوتوليدز' : undefined,
    url: SITE.origin,
    email: SITE.email,
    telephone: '+201100054278',
    image: `${SITE.origin}/og-image.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
    areaServed: AREA_SERVED,
    serviceType: isAr
      ? ['تصميم مواقع', 'صفحات هبوط', 'حجز مواعيد على الصفحة', 'شات بوت أسئلة على الصفحة']
      : ['Website design', 'Landing page design', 'Appointment booking on the page', 'On-page FAQ chatbot'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: SITE.email,
      telephone: '+201100054278',
      availableLanguage: ['en', 'ar'],
      areaServed: ['EG', 'AE'],
    },
    makesOffer: [
      { ...OFFER_EGP, url: pageUrl },
      { ...OFFER_USD, url: pageUrl },
    ],
  }
}

export function homeGraph(locale: Locale, title: string, description: string) {
  const pageUrl = `${SITE.origin}/${locale}`
  const isAr = locale === 'ar'
  return {
    '@context': 'https://schema.org',
    '@graph': [
      professionalService(locale, pageUrl),
      {
        '@type': 'WebSite',
        '@id': `${SITE.origin}/#website`,
        url: SITE.origin,
        name: SITE.name,
        inLanguage: ['en', 'ar'],
        publisher: { '@id': `${SITE.origin}/#business` },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: isAr ? 'ar' : 'en',
        isPartOf: { '@id': `${SITE.origin}/#website` },
        about: { '@id': `${SITE.origin}/#business` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        url: `${pageUrl}#faq`,
        inLanguage: isAr ? 'ar' : 'en',
        isPartOf: { '@id': `${pageUrl}#webpage` },
        mainEntity: faqEntities(locale),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE.name,
            item: pageUrl,
          },
        ],
      },
    ],
  }
}

export function demoGraph(locale: Locale, id: DemoId) {
  const seo = DEMO_SEO[id][locale]
  const pageUrl = `${SITE.origin}/${locale}/demo/${id}`
  const homeUrl = `${SITE.origin}/${locale}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: seo.title,
        description: seo.description,
        inLanguage: locale === 'ar' ? 'ar' : 'en',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE.origin}/#website`,
          name: SITE.name,
          url: SITE.origin,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: homeUrl },
          { '@type': 'ListItem', position: 2, name: seo.title, item: pageUrl },
        ],
      },
    ],
  }
}

export function innerPageGraph(locale: Locale, path: string, title: string, description: string) {
  const pageUrl = `${SITE.origin}/${locale}${path}`
  const homeUrl = `${SITE.origin}/${locale}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale === 'ar' ? 'ar' : 'en',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE.origin}/#website`,
          name: SITE.name,
          url: SITE.origin,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: homeUrl },
          { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
        ],
      },
    ],
  }
}

