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
  { '@type': 'Place', name: 'Gulf' },
]

function packageOffers(pageUrl: string) {
  return [
    {
      '@type': 'Offer',
      price: '20000',
      priceCurrency: 'EGP',
      url: pageUrl,
      description:
        'Founding-client offer for the first five businesses: bilingual membership storefront, three packages, customer QR pass, staff redemption, owner dashboard, setup, training, and handoff.',
      areaServed: 'EG',
    },
    {
      '@type': 'Offer',
      price: '35000',
      priceCurrency: 'EGP',
      url: pageUrl,
      description:
        'Standard membership-system implementation starting price after the founding-client offer: branded bilingual storefront, package terms, QR, staff flow, dashboard, training, and source handoff.',
      areaServed: 'EG',
    },
  ]
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
  const node: Record<string, unknown> = {
    '@type': 'ProfessionalService',
    '@id': `${SITE.origin}/#business`,
    name: SITE.name,
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
      ? ['نظام اشتراكات شهرية', 'موقع اشتراكات', 'بطاقة عضوية QR', 'ماسح اشتراكات', 'لوحة تحكم للمشتركين']
      : ['Membership system', 'Subscription storefront', 'QR membership pass', 'Staff redemption scanner', 'Subscriber dashboard'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: SITE.email,
      telephone: '+201100054278',
      availableLanguage: ['en', 'ar'],
      areaServed: ['EG', 'AE'],
    },
    offers: packageOffers(pageUrl),
  }
  if (isAr) node.alternateName = 'أوتوليدز'
  return node
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

/** Demo pages: WebPage only — no second ProfessionalService / business entity. */
export function demoGraph(locale: Locale, id: DemoId) {
  const seo = DEMO_SEO[id][locale]
  const pageUrl = `${SITE.origin}/${locale}/demo/${id}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: seo.title,
    description: seo.description,
    inLanguage: locale === 'ar' ? 'ar' : 'en',
    isPartOf: { '@id': `${SITE.origin}/#website` },
  }
}

export function innerPageGraph(locale: Locale, path: string, title: string, description: string) {
  const pageUrl = `${SITE.origin}/${locale}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: locale === 'ar' ? 'ar' : 'en',
    isPartOf: { '@id': `${SITE.origin}/#website` },
  }
}
