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
  { '@type': 'Country', name: 'Saudi Arabia' },
  { '@type': 'City', name: 'Riyadh' },
  { '@type': 'Place', name: 'Gulf' },
]

type Pkg = { id: string; en: string; ar: string; descEn: string; descAr: string; egp: number; usd?: number }

const PACKAGES: Pkg[] = [
  { id: 'launch', en: 'Launch: lead page for ads', ar: 'Launch: صفحة عملاء للإعلانات', egp: 18000, usd: 750,
    descEn: 'Bilingual landing page or site up to 5 pages, lead form delivered to WhatsApp and a Google Sheet, click-to-chat, Meta Pixel and Google Analytics, basic SEO. Delivered in 10 working days.',
    descAr: 'صفحة هبوط أو موقع حتى ٥ صفحات عربي وإنجليزي، فورم عملاء يوصل على واتساب وGoogle Sheet، زر واتساب، Meta Pixel وGoogle Analytics، وSEO أساسي. التسليم في ١٠ أيام عمل.' },
  { id: 'growth', en: 'Growth: AI WhatsApp agent', ar: 'Growth: وكيل واتساب بالذكاء الاصطناعي', egp: 32000, usd: 1500,
    descEn: 'AI agent on the official WhatsApp Business Platform, trained on your prices and FAQs in Arabic and English. Replies in seconds, qualifies leads, books appointments or viewings, hands off to staff, simple CRM and automatic follow-ups, 30 days of tuning. Delivered in about 3 weeks.',
    descAr: 'وكيل ذكاء اصطناعي على منصة WhatsApp Business الرسمية، متدرب على أسعارك وأسئلتك بالعربي والإنجليزي. بيرد في ثواني ويأهل العملاء ويحجز المواعيد أو المعاينات ويحول للموظف، مع CRM بسيط ومتابعات تلقائية و٣٠ يوم ضبط. التسليم في حوالي ٣ أسابيع.' },
  { id: 'scale', en: 'Scale: full lead system', ar: 'Scale: نظام العملاء الكامل', egp: 65000, usd: 3000,
    descEn: 'Launch plus Growth, up to 5 custom automations (reminders, reviews, reports), Meta ads account and campaign structure, dashboard, team training and 60 days of tuning. Delivered in 5 to 6 weeks.',
    descAr: 'Launch وGrowth مع بعض، حتى ٥ أتمتة مخصصة (تذكير وتقييمات وتقارير)، حساب إعلانات Meta وهيكل الحملات، لوحة متابعة، تدريب الفريق و٦٠ يوم ضبط. التسليم في ٥ إلى ٦ أسابيع.' },
  { id: 'membership', en: 'Membership storefront', ar: 'متجر العضويات', egp: 20000,
    descEn: 'Bilingual storefront selling up to 3 prepaid plans, payment through your merchant account, customer QR pass, staff redemption and owner dashboard. EGP 20,000 for the first five clients, then from EGP 35,000.',
    descAr: 'صفحة بيع عربي وإنجليزي لحد ٣ باقات مدفوعة مقدماً، دفع على حساب التاجر، بطاقة QR للعميل، خصم من الموظف ولوحة مالك. ٢٠٬٠٠٠ جنيه لأول خمس عملاء وبعدها من ٣٥٬٠٠٠ جنيه.' },
]

function offerCatalog(locale: Locale, pageUrl: string) {
  const isAr = locale === 'ar'
  return {
    '@type': 'OfferCatalog',
    name: isAr ? 'باقات أوتوليدز' : 'AutoLeadss packages',
    itemListElement: PACKAGES.map(p => {
      const offers: Record<string, unknown>[] = [
        { '@type': 'Offer', price: String(p.egp), priceCurrency: 'EGP', areaServed: 'EG', url: `${pageUrl}#services` },
      ]
      if (p.usd) offers.push({ '@type': 'Offer', price: String(p.usd), priceCurrency: 'USD', areaServed: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'], url: `${pageUrl}#services` })
      return {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${SITE.origin}/#service-${p.id}`,
          name: isAr ? p.ar : p.en,
          description: isAr ? p.descAr : p.descEn,
          provider: { '@id': `${SITE.origin}/#business` },
          areaServed: AREA_SERVED,
          offers,
        },
      }
    }),
  }
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
      ? ['شات بوت واتساب بالذكاء الاصطناعي', 'وكيل مبيعات واتساب', 'صفحة هبوط لتجميع العملاء', 'حجز مواعيد العيادات على واتساب', 'تأهيل ليدز العقارات', 'متابعة تلقائية للعملاء', 'نظام عضويات واشتراكات']
      : ['AI WhatsApp agent', 'WhatsApp chatbot', 'Lead generation landing page', 'Clinic appointment booking on WhatsApp', 'Real estate lead qualification', 'Lead follow-up automation', 'Membership storefront'],
    description: isAr
      ? 'استوديو في القاهرة بيبني وكلاء واتساب بالذكاء الاصطناعي وصفحات تجميع عملاء وأتمتة متابعة للعيادات والعقارات ومراكز التجميل في مصر والخليج.'
      : 'Cairo-based studio that builds AI WhatsApp agents, lead-capture pages and follow-up automations for clinics, real estate teams and beauty businesses in Egypt and the Gulf.',
    knowsAbout: ['WhatsApp Business Platform', 'AI chat agents', 'Lead qualification', 'Dental clinic marketing', 'Real estate lead generation', 'Meta ads', 'Arabic and English websites'],
    audience: [
      { '@type': 'BusinessAudience', audienceType: isAr ? 'عيادات الأسنان والجلدية والتجميل' : 'Dental, dermatology and cosmetic clinics' },
      { '@type': 'BusinessAudience', audienceType: isAr ? 'شركات الوساطة العقارية والمطورين' : 'Real estate brokerages and developers' },
      { '@type': 'BusinessAudience', audienceType: isAr ? 'الصالونات ومراكز التجميل' : 'Salons and beauty studios' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: SITE.email,
      telephone: '+201100054278',
      availableLanguage: ['en', 'ar'],
      areaServed: ['EG', 'AE', 'SA'],
    },
    hasOfferCatalog: offerCatalog(locale, pageUrl),
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
