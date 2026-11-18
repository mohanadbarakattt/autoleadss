import type { Locale } from '../i18n/translations'

/**
 * AutoLeadss On Call prices and copy.
 *
 * FX used on 18 Nov 2026 (Cairo) to convert the given USD prices.
 * EGP amounts are the approved list prices, not a conversion.
 *
 *   GBP  1 USD = 0.7591  eurochange interbank, updated Wed 18 Nov 2026 08:05
 *   AED  1 USD = 3.6725  UAE official peg (Dubai Haber, 18 Nov 2026)
 *   SAR  1 USD = 3.75    Saudi official peg (Dubai Haber implied 3.7501)
 *
 * Exact conversions, then rounded to clean points ending in 0 or 9:
 *   Care    $450  -> GBP 341.595 -> £349;   AED 1,652.625 -> 1,649;  SAR 1,687.5 -> 1,689
 *   Growth  $990  -> GBP 751.509 -> £749;   AED 3,635.775 -> 3,649;  SAR 3,712.5 -> 3,709
 *   Team    $1,850 -> GBP 1,404.335 -> £1,399; AED 6,794.125 -> 6,790; SAR 6,937.5 -> 6,939
 */
export type OnCallCurrency = 'USD' | 'GBP' | 'AED' | 'SAR' | 'EGP'
export type OnCallTierId = 'care' | 'growth' | 'team'

export const ON_CALL_PATH = '/on-call'
export const ON_CALL_CURRENCIES: OnCallCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP']

export const ON_CALL_FX = {
  asOf: '2026-11-18',
  usdTo: { GBP: 0.7591, AED: 3.6725, SAR: 3.75 },
} as const

export const ON_CALL_PRICES: Record<OnCallTierId, Record<OnCallCurrency, number>> = {
  care: { USD: 450, GBP: 349, AED: 1649, SAR: 1689, EGP: 7500 },
  growth: { USD: 990, GBP: 749, AED: 3649, SAR: 3709, EGP: 16000 },
  team: { USD: 1850, GBP: 1399, AED: 6790, SAR: 6939, EGP: 30000 },
}

export const ON_CALL_HOURS: Record<OnCallTierId, number> = { care: 6, growth: 15, team: 30 }

export const WA_DISPLAY_ISOLATED = '\u2066+20 110 005 4278\u2069'

export function formatOnCallAmount(amount: number, ar: boolean) {
  return new Intl.NumberFormat(ar ? 'ar-EG' : 'en-US', { maximumFractionDigits: 0 }).format(amount)
}

export function formatOnCallPrice(currency: OnCallCurrency, amount: number, ar: boolean) {
  const n = formatOnCallAmount(amount, ar)
  switch (currency) {
    case 'USD':
      return { amount: `$${n}`, unit: ar ? 'دولار' : 'USD', unitAfter: false }
    case 'GBP':
      return { amount: `\u00A3${n}`, unit: ar ? '\u062C\u0646\u064A\u0647 \u0625\u0633\u062A\u0631\u0644\u064A\u0646\u064A' : 'GBP', unitAfter: false }
    case 'AED':
      return { amount: n, unit: ar ? '\u062F\u0631\u0647\u0645' : 'AED', unitAfter: ar }
    case 'SAR':
      return { amount: n, unit: ar ? '\u0631\u064A\u0627\u0644' : 'SAR', unitAfter: ar }
    case 'EGP':
      return { amount: n, unit: ar ? '\u062C\u0646\u064A\u0647' : 'EGP', unitAfter: ar }
  }
}

export type OnCallFaqItem = { q: string; a: string }

export type OnCallCopy = {
  seo: { title: string; description: string; keywords: string }
  navLabel: string
  footerLabel: string
  waText: string
  hero: {
    eyebrow: string
    title: string
    titleEm: string
    body: string
    cta: string
    secondary: string
    chips: string[]
  }
  who: {
    eyebrow: string
    title: string
    body: string
    marketsTitle: string
    markets: string[]
    fitTitle: string
    fit: string[]
    platforms: string
  }
  included: {
    eyebrow: string
    title: string
    body: string
    items: { title: string; body: string }[]
    notTitle: string
    notItems: string[]
    addon: string
  }
  how: {
    eyebrow: string
    title: string
    body: string
    steps: { n: string; title: string; body: string }[]
  }
  plans: {
    eyebrow: string
    title: string
    body: string
    currencyLabel: string
    perMonth: string
    hours: string
    recommended: string
    terms: string
    cta: string
  }
  proof: {
    eyebrow: string
    title: string
    label: string
    name: string
    body: string
    live: string
    builtTitle: string
    built: string[]
    leads: string
    leadsLabel: string
    openStore: string
  }
  faq: { eyebrow: string; title: string; items: OnCallFaqItem[] }
  cta: { eyebrow: string; title: string; body: string; button: string; orMessage: string }
  lashLink: string
}

export const ON_CALL_COPY: Record<Locale, OnCallCopy> = {
  en: {
    seo: {
      title: 'Monthly store support for online retailers | AutoLeadss On Call',
      description:
        'AutoLeadss On Call is a monthly retainer for small online retailers in the UAE, Saudi Arabia, Egypt, the wider Gulf, the US and the UK. Store edits, product uploads, lead lists, AI product images and designs, from $450 or EGP 7,500 a month.',
      keywords:
        'shopify maintenance packages, shopify maintenance plan, website maintenance packages, salla store management, zid store management, AI product photography for ecommerce, lead list services, unlimited design subscription, إدارة متجر سلة, إدارة متجر زد, باقات تسويق الكتروني في السعودية',
    },
    navLabel: 'On Call',
    footerLabel: 'On Call',
    waText:
      'Hi AutoLeadss, I want to talk about AutoLeadss On Call for my store.\nStore URL and platform (Shopify, Salla, Zid, WooCommerce or other):\nCity and country:\nWhat I need help with this month:',
    hero: {
      eyebrow: 'AutoLeadss On Call · MENA, US and UK',
      title: 'Your on-call digital team,',
      titleEm: 'every month.',
      body: 'A monthly plan for small online retailers. We handle website changes and fixes, product uploads, lead lists, AI product images, ad and social designs, landing pages and small automations. For stores on Shopify, Salla, Zid, WooCommerce or similar, with 1 to 10 staff and no in-house developer or designer.',
      cta: 'Start on WhatsApp',
      secondary: 'See the plans',
      chips: ['Month to month', 'Requests on WhatsApp', 'Preview before anything goes live'],
    },
    who: {
      eyebrow: 'Who it is for',
      title: 'Any small online retailer that needs a team on call.',
      body: 'If you sell online, have a steady list of store and marketing tasks, and do not have a developer or designer on staff, this is built for you. Beauty is one example, not the only one. Fashion, skincare, home, food and specialty stores are all in scope.',
      marketsTitle: 'Where we work first',
      markets: [
        'UAE, Saudi Arabia, Egypt and the wider Gulf',
        'The United States',
        'The United Kingdom',
      ],
      fitTitle: 'A good fit if',
      fit: [
        'You have a live store and are selling or running ads now',
        'You have 1 to 10 staff and no in-house developer or designer',
        'You have regular requests: edits, new products, creatives or lists',
        'The owner or marketing lead is in the conversation',
      ],
      platforms: 'Shopify, Salla, Zid, WooCommerce, or a similar store platform.',
    },
    included: {
      eyebrow: 'What is included',
      title: 'The work a small store actually needs each month.',
      body: 'You send what is on your list. We pick it up in the hours of your plan. The WhatsApp AI agent is available as an add-on, not part of the base plan.',
      items: [
        { title: 'Store and site changes', body: 'Edits, new pages and sections, fixes, speed work and basic SEO.' },
        { title: 'Product uploads', body: 'New products and updates, added cleanly to your catalogue.' },
        { title: 'Lead lists', body: 'Researched, verified lists of target businesses or buyers, delivered to you. We do not send bulk or spam messages.' },
        { title: 'AI product images', body: 'Channel-ready product shots. The product itself stays true to the real item.' },
        { title: 'Ad and social designs', body: 'Creatives for ads and social posts, sized for the channels you use.' },
        { title: 'Landing pages and automations', body: 'A new page or section, plus small automations such as forms, email flows and order notifications, on the higher plans.' },
      ],
      notTitle: 'Not included',
      notItems: [
        'Full store builds, redesigns or migrations. Those are quoted as projects.',
        'Ad spend and running paid campaigns, unless added.',
        'Video shoots, 3D and print.',
        'Third-party app, data and tool fees, including Shopify apps, extra lead data and Meta fees.',
        'Emergency 24/7 support.',
      ],
      addon: 'The AutoLeadss WhatsApp AI agent can be added on top of any plan, at the existing Growth package price.',
    },
    how: {
      eyebrow: 'How it works',
      title: 'WhatsApp in. A task board. A preview before it goes live.',
      body: 'You should always see the work before your customers do.',
      steps: [
        { n: '01', title: 'Send the request on WhatsApp', body: 'A short message, a voice note or a screenshot is enough. Tell us what you need and when you need it.' },
        { n: '02', title: 'It goes on a task board', body: 'Each request becomes a card with a goal, a deadline and estimated hours. You confirm the priority order.' },
        { n: '03', title: 'We do the work', body: 'We use your store access, brand assets and the tools already in place. You do not hand over owner passwords.' },
        { n: '04', title: 'You check a preview first', body: 'Every change is reviewed on a preview, on mobile and desktop, before it goes live.' },
        { n: '05', title: 'You get the update', body: 'A short WhatsApp message with the links and the hours used. Growth includes a monthly report. Team adds a monthly call.' },
      ],
    },
    plans: {
      eyebrow: 'Monthly plans',
      title: 'Three plans. Pick the hours you will actually use.',
      body: 'Hours are capped, so you always know the cost. Growth is the plan most stores should start with.',
      currencyLabel: 'Currency',
      perMonth: '/ month',
      hours: 'hours / month',
      recommended: 'Recommended',
      terms: 'Month to month, paid upfront. Unused hours do not roll over. You can pause once per quarter. Extra hours are quoted at the hourly rate for that plan before the work starts. A 3-month commitment is optional, at 10% off.',
      cta: 'Ask about this plan',
    },
    proof: {
      eyebrow: 'Proof',
      title: 'A live store, and lead work across MENA.',
      label: 'Client project · Australia',
      name: 'Lash Cartel Cosmetics',
      body: 'The full online store for an Australian beauty brand that designs and ships its lashes from Australia. Live at lashcartelcosmetics.com. This is one example of the ecommerce work AutoLeadss On Call is built around, not the only kind of store we help.',
      live: 'Live store',
      builtTitle: 'What we built',
      built: [
        'Shop and Stripe checkout',
        'Five-question lash match quiz',
        'FAQ chatbot',
        'Stockist and vending machine enquiry forms',
        'Automated order, abandoned cart and back-in-stock emails',
        'Stock and dispatch admin dashboard',
      ],
      leads: '200+',
      leadsLabel: 'leads generated across 3 MENA markets',
      openStore: 'Open lashcartelcosmetics.com',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Straight answers before you start.',
      items: [
        {
          q: 'What is AutoLeadss On Call?',
          a: 'AutoLeadss On Call is a monthly retainer from AutoLeadss, a Cairo-based studio. It gives a small online retailer an on-call digital team for website and store changes, product uploads, lead lists, AI product images, ad and social designs, landing pages and small automations. Clients send requests on WhatsApp. Each request goes onto a task board, and every change is checked on a preview before it goes live.',
        },
        {
          q: 'Who is AutoLeadss On Call for?',
          a: 'It is for any online retailer or ecommerce store with 1 to 10 staff and no in-house developer or designer, on Shopify, Salla, Zid, WooCommerce or a similar platform. The first markets are the UAE, Saudi Arabia, Egypt, the wider Gulf, the United States and the United Kingdom. Beauty, including the Lash Cartel store, is one example. Fashion, skincare, home, food and other specialty stores are also a fit.',
        },
        {
          q: 'How much does AutoLeadss On Call cost?',
          a: 'Care, 6 hours a month, is $450, £349, AED 1,649, SAR 1,689 or EGP 7,500. Growth, 15 hours and the recommended plan, is $990, £749, AED 3,649, SAR 3,709 or EGP 16,000. Team, 30 hours, is $1,850, £1,399, AED 6,790, SAR 6,939 or EGP 30,000. Plans are month to month and paid upfront.',
        },
        {
          q: 'What is included in each plan?',
          a: 'Care includes store and site edits, fixes, up to 15 product uploads, basic SEO (meta, alt text and redirects) and an uptime check, with 1 active request at a time and small tasks in 2 business days. Growth adds up to 20 AI product images, 8 ad or social designs, 1 lead list of up to 300 verified contacts, 1 landing page or section and a monthly report, with 2 active requests and small tasks in 1 business day. Team adds up to 40 AI images, 16 designs, lead lists of up to 1,000 contacts, 1 small automation a month and a monthly call, with 3 active requests and same-business-day urgent fixes.',
        },
        {
          q: 'How do requests work?',
          a: 'You send requests to AutoLeadss on WhatsApp. A voice note or screenshot is fine. Each request is added to a task board with a goal, a deadline and estimated hours. You confirm the priority. When the work is ready, you review a preview on mobile and desktop before anything is published, then you get a short WhatsApp update with the links and the hours used.',
        },
        {
          q: 'Do unused hours roll over?',
          a: 'No. Unused hours in an AutoLeadss On Call plan do not roll over to the next month. Extra hours can be added, and they are quoted at the hourly rate for that plan before the work starts.',
        },
        {
          q: 'What is not included?',
          a: 'AutoLeadss On Call does not include full store builds, redesigns or migrations (those are quoted as projects), ad spend or running paid campaigns unless added, video shoots, 3D and print, third-party app, data and tool fees, or emergency 24/7 support. Lead lists are delivered to you. We do not send bulk or spam messages.',
        },
        {
          q: 'Can I pause or cancel?',
          a: 'Yes. AutoLeadss On Call is month to month. You can pause once per quarter. A 3-month commitment is optional and is priced at 10% off.',
        },
        {
          q: 'Which store platforms do you support?',
          a: 'AutoLeadss On Call supports Shopify, Salla, Zid, WooCommerce and similar ecommerce platforms used by small online retailers in the UAE, Saudi Arabia, Egypt, the wider Gulf, the US and the UK.',
        },
        {
          q: 'Is the WhatsApp agent included?',
          a: 'No. The AutoLeadss AI WhatsApp agent is an add-on, not part of the base On Call plans. It can be added at the existing Growth package price, which is a one-time EGP 32,000 in Egypt or $1,500 in the Gulf.',
        },
        {
          q: 'Is Lash Cartel a real client?',
          a: 'Yes. Lash Cartel Cosmetics is a real AutoLeadss client project. It is an Australian beauty brand that designs and ships its lashes from Australia. The live store is https://lashcartelcosmetics.com. AutoLeadss has also generated 200+ leads across 3 MENA markets.',
        },
      ],
    },
    cta: {
      eyebrow: 'A short WhatsApp message is enough',
      title: 'Tell us what is on your store list this month.',
      body: 'Send the store link, the platform and the first few tasks. We will tell you which plan fits before any work starts.',
      button: 'Message AutoLeadss on WhatsApp',
      orMessage: 'Or message',
    },
    lashLink: 'This kind of monthly store work is what AutoLeadss On Call is for',
  },
  ar: {
    seo: {
      title: 'باقات إدارة المتجر الشهرية للمتاجر الإلكترونية | أوتوليدز أون كول',
      description:
        'أوتوليدز أون كول خطة شهرية للمتاجر الإلكترونية الصغيرة في الإمارات والسعودية ومصر والخليج وأمريكا وبريطانيا. تعديلات المتجر، رفع المنتجات، قوائم العملاء، صور منتجات بالذكاء الاصطناعي وتصميمات، من ٤٥٠ دولار أو ٧٬٥٠٠ جنيه شهرياً.',
      keywords:
        'إدارة متجر سلة, إدارة متجر زد, باقات تسويق الكتروني في السعودية, صيانة متجر شوبيفاي, تصميم سوشيال ميديا, تصوير منتجات بالذكاء الاصطناعي, shopify maintenance packages, salla store management',
    },
    navLabel: 'أون كول',
    footerLabel: 'أون كول',
    waText:
      'أهلاً أوتوليدز، عايز أسأل عن أوتوليدز أون كول لمتجري.\nرابط المتجر والمنصة (Shopify أو سلة أو زد أو WooCommerce أو غيرها):\nالمدينة والدولة:\nالمساعدة اللي محتاجها الشهر ده:',
    hero: {
      eyebrow: 'أوتوليدز أون كول · الشرق الأوسط وشمال أفريقيا وأمريكا وبريطانيا',
      title: 'فريقك الرقمي تحت الطلب،',
      titleEm: 'كل شهر.',
      body: 'خطة شهرية للمتاجر الإلكترونية الصغيرة. بنعمل تعديلات وإصلاحات الموقع والمتجر، رفع المنتجات، قوائم العملاء، صور منتجات بالذكاء الاصطناعي، تصميمات الإعلانات والسوشيال، صفحات هبوط، وأتمتة بسيطة. للمتاجر على Shopify أو سلة أو زد أو WooCommerce أو منصات مشابهة، من ١ إلى ١٠ أفراد ومن غير مطور أو مصمم داخلي.',
      cta: 'ابدأ على واتساب',
      secondary: 'شوف الباقات',
      chips: ['من شهر لشهر', 'الطلبات على واتساب', 'معاينة قبل ما أي تغيير ينشر'],
    },
    who: {
      eyebrow: 'لِمين',
      title: 'لأي متجر إلكتروني صغير محتاج فريق تحت الطلب.',
      body: 'لو بتبيع أونلاين، وعندك شغل مستمر على المتجر والتسويق، ومن غير مطور أو مصمم في الفريق، الخطة دي متعملة ليك. التجميل مثال واحد، مش المجال الوحيد. الأزياء والعناية بالبشرة والمنزل والأكل والمتاجر المتخصصة كلها تدخل.',
      marketsTitle: 'نبدأ بأين',
      markets: [
        'الإمارات والسعودية ومصر والخليج',
        'الولايات المتحدة',
        'المملكة المتحدة',
      ],
      fitTitle: 'مناسبة لو',
      fit: [
        'عندك متجر شغال وبتبيع أو بتعمل إعلانات دلوقتي',
        'الفريق من ١ إلى ١٠ أفراد، ومن غير مطور أو مصمم داخلي',
        'عندك طلبات منتظمة: تعديلات، منتجات جديدة، تصميمات أو قوائم',
        'صاحب المتجر أو مسؤول التسويق موجود في الكلام',
      ],
      platforms: 'Shopify أو سلة أو زد أو WooCommerce أو منصة متاجر مشابهة.',
    },
    included: {
      eyebrow: 'إيه الموجود',
      title: 'الشغل اللي المتجر الصغير محتاجه كل شهر.',
      body: 'تبعت اللي في قائمتك. وإحنا ننفذه في ساعات باقتك. وكيل واتساب بالذكاء الاصطناعي إضافة، مش جزء من الباقة الأساسية.',
      items: [
        { title: 'تعديلات المتجر والموقع', body: 'تعديلات، صفحات وأقسام جديدة، إصلاحات، سرعة، وSEO أساسي.' },
        { title: 'رفع المنتجات', body: 'منتجات جديدة وتحديثات، تتنضاف للكتالوج بشكل مرتب.' },
        { title: 'قوائم العملاء', body: 'قوائم بحث وتحقق لشركات أو مشترين مستهدفين، بتتنسلم ليك. مش بنبعت رسائل جماعية أو سبام.' },
        { title: 'صور منتجات بالذكاء الاصطناعي', body: 'صور جاهزة للقنوات. المنتج نفسه يفضل مطابق للقطعة الحقيقية.' },
        { title: 'تصميمات الإعلانات والسوشيال', body: 'تصميمات للإعلانات ومنشورات السوشيال، بمقاسات القنوات اللي بتستخدمها.' },
        { title: 'صفحات هبوط وأتمتة', body: 'صفحة أو قسم جديد، وأتمتة بسيطة زي الفورمات وسير الإيميل وإشعارات الطلب، في الباقات الأعلى.' },
      ],
      notTitle: 'مش موجود في الباقة',
      notItems: [
        'بناء متجر كامل أو إعادة تصميم أو نقل المنصة. دي بتتنحسب كمشروع منفصل.',
        'ميزانية الإعلانات وإدارة الحملات المدفوعة، إلا لو اتضافت.',
        'تصوير فيديو وثلاثي الأبعاد ومطبوعات.',
        'رسوم التطبيقات والبيانات والأدوات الخارجية، بما فيها تطبيقات Shopify وبيانات القوائم الإضافية ورسوم Meta.',
        'دعم طوارئ على مدار الساعة.',
      ],
      addon: 'وكيل واتساب بالذكاء الاصطناعي من أوتوليدز ممكن يتضاف على أي باقة، بسعر باقة Growth الحالي.',
    },
    how: {
      eyebrow: 'إزاي بتشتغل',
      title: 'الطلب على واتساب. لوحة مهام. ومعاينة قبل النشر.',
      body: 'المفروض تشوف الشغل قبل ما عملاءك يشوفوه.',
      steps: [
        { n: '٠١', title: 'تبعت الطلب على واتساب', body: 'رسالة قصيرة أو فويس نوت أو سكرين شوت تكفي. قول لنا محتاج إيه ومحتاجه إمتى.' },
        { n: '٠٢', title: 'بيتحط على لوحة مهام', body: 'كل طلب يبقى كارت فيه الهدف والميعاد والساعات المتوقعة. وإنت بتأكد ترتيب الأولوية.' },
        { n: '٠٣', title: 'بننفذ الشغل', body: 'بنستخدم صلاحيات المتجر وملفات البراند والأدوات الموجودة. من غير ما تبعت كلمة سر المالك.' },
        { n: '٠٤', title: 'بتراجع نسخة معاينة أولاً', body: 'كل تغيير بيتراجع على نسخة معاينة، على الموبايل والكمبيوتر، قبل ما ينشر.' },
        { n: '٠٥', title: 'بيوصلك التحديث', body: 'رسالة واتساب قصيرة بالروابط والساعات المستخدمة. باقة Growth فيها تقرير شهري. باقة Team فيها مكالمة شهرية كمان.' },
      ],
    },
    plans: {
      eyebrow: 'الباقات الشهرية',
      title: 'ثلاث باقات. اختار الساعات اللي هتستخدمها فعلاً.',
      body: 'الساعات محسوبة، فالتكلفة واضحة. باقة Growth هي الأنسب لمعظم المتاجر في البداية.',
      currencyLabel: 'العملة',
      perMonth: '/ شهرياً',
      hours: 'ساعات / شهرياً',
      recommended: 'الأنسب',
      terms: 'من شهر لشهر، والدفع مقدماً. الساعات غير المستخدمة لا تنتقل للشهر اللي بعده. ممكن توقف الباقة مرة كل ربع سنة. الساعات الزائدة بتتقيم بسعر الساعة للباقة قبل ما الشغل يبدأ. الالتزام لـ ٣ أشهر اختياري وبخصم ١٠٪.',
      cta: 'اسأل عن الباقة دي',
    },
    proof: {
      eyebrow: 'إثبات',
      title: 'متجر شغال، وشغل عملاء في الشرق الأوسط وشمال أفريقيا.',
      label: 'مشروع عميل · أستراليا',
      name: 'Lash Cartel Cosmetics',
      body: 'المتجر الإلكتروني الكامل لبراند رموش أسترالي بيصمم ويشحن من أستراليا. الموقع شغال على lashcartelcosmetics.com. ده مثال واحد على شغل المتاجر اللي أوتوليدز أون كول متعملة حوله، مش النوع الوحيد من المتاجر اللي بنساعدها.',
      live: 'المتجر الحالي',
      builtTitle: 'اللي بنيناه',
      built: [
        'متجر ودفع أونلاين عن طريق Stripe',
        'اختبار من ٥ أسئلة يرشح الرموش المناسبة',
        'شات بوت للأسئلة الشائعة',
        'فورم طلبات للموزعين وماكينات البيع',
        'إيميلات تلقائية للطلب والسلة المتروكة ورجوع المنتج',
        'لوحة إدارة للمخزون والشحن',
      ],
      leads: '+٢٠٠',
      leadsLabel: 'عميل محتمل اتولّد عبر ٣ أسواق في الشرق الأوسط وشمال أفريقيا',
      openStore: 'افتح lashcartelcosmetics.com',
    },
    faq: {
      eyebrow: 'أسئلة',
      title: 'إجابات واضحة قبل ما تبدأ.',
      items: [
        {
          q: 'إيه هو أوتوليدز أون كول؟',
          a: 'أوتوليدز أون كول خطة شهرية من أوتوليدز، استوديو في القاهرة. بتدي للمتجر الإلكتروني الصغير فريق رقمي تحت الطلب لتعديلات الموقع والمتجر، رفع المنتجات، قوائم العملاء، صور منتجات بالذكاء الاصطناعي، تصميمات الإعلانات والسوشيال، صفحات هبوط، وأتمتة بسيطة. العميل يبعت الطلبات على واتساب، وكل طلب بيتحط على لوحة مهام، وكل تغيير بيتراجع على نسخة معاينة قبل ما ينشر.',
        },
        {
          q: 'أوتوليدز أون كول لمين؟',
          a: 'لأي متجر إلكتروني من ١ إلى ١٠ أفراد ومن غير مطور أو مصمم داخلي، على Shopify أو سلة أو زد أو WooCommerce أو منصة مشابهة. الأسواق الأولى هي الإمارات والسعودية ومصر والخليج والولايات المتحدة والمملكة المتحدة. التجميل، ومنه متجر Lash Cartel، مثال واحد. الأزياء والعناية بالبشرة والمنزل والأكل والمتاجر المتخصصة كمان مناسبة.',
        },
        {
          q: 'أوتوليدز أون كول بكام؟',
          a: 'باقة Care، ٦ ساعات في الشهر، بـ ٤٥٠ دولار أو ٣٤٩ جنيه إسترليني أو ١٬٦٤٩ درهم أو ١٬٦٨٩ ريال أو ٧٬٥٠٠ جنيه. باقة Growth، ١٥ ساعة وهي الباقة الأنسب، بـ ٩٩٠ دولار أو ٧٤٩ جنيه إسترليني أو ٣٬٦٤٩ درهم أو ٣٬٧٠٩ ريال أو ١٦٬٠٠٠ جنيه. باقة Team، ٣٠ ساعة، بـ ١٬٨٥٠ دولار أو ١٬٣٩٩ جنيه إسترليني أو ٦٬٧٩٠ درهم أو ٦٬٩٣٩ ريال أو ٣٠٬٠٠٠ جنيه. الباقات من شهر لشهر والدفع مقدماً.',
        },
        {
          q: 'إيه الموجود في كل باقة؟',
          a: 'باقة Care فيها تعديلات وإصلاحات المتجر والموقع، حتى ١٥ منتج، SEO أساسي (العناوين والنصوص البديلة والتحويلات) ومتابعة إن الموقع شغال، وطلب واحد في نفس الوقت، والمهام الصغيرة في يومي عمل. باقة Growth بتضيف حتى ٢٠ صورة منتج بالذكاء الاصطناعي، و٨ تصميمات إعلان أو سوشيال، وقائمة عملاء حتى ٣٠٠ جهة اتصال متحققة، وصفحة هبوط أو قسم، وتقرير شهري، وطلبين في نفس الوقت، والمهام الصغيرة في يوم عمل واحد. باقة Team بتضيف حتى ٤٠ صورة و١٦ تصميم، وقوائم حتى ١٬٠٠٠ جهة اتصال، وأتمتة صغيرة شهرياً، ومكالمة شهرية، و٣ طلبات في نفس الوقت، وإصلاحات مستعجلة في نفس يوم العمل.',
        },
        {
          q: 'الطلبات بتتم إزاي؟',
          a: 'بتبعت الطلبات لأوتوليدز على واتساب. فويس نوت أو سكرين شوت يكفي. كل طلب بيتنضاف للوحة مهام فيه الهدف والميعاد والساعات المتوقعة. وإنت بتأكد الأولوية. لما الشغل يجهز، بتراجع نسخة معاينة على الموبايل والكمبيوتر قبل أي نشر، وبعدها توصلك رسالة واتساب قصيرة بالروابط والساعات المستخدمة.',
        },
        {
          q: 'الساعات غير المستخدمة بتنتقل للشهر اللي بعده؟',
          a: 'لا. الساعات غير المستخدمة في باقة أوتوليدز أون كول لا تنتقل للشهر التالي. ممكن تضاف ساعات زيادة، وبتتقيم بسعر الساعة للباقة دي قبل ما الشغل يبدأ.',
        },
        {
          q: 'إيه اللي مش موجود في الباقة؟',
          a: 'أوتوليدز أون كول لا يشمل بناء متجر كامل أو إعادة تصميم أو نقل المنصة (دي بتتنحسب كمشروع)، ولا ميزانية الإعلانات أو إدارة الحملات إلا لو اتضافت، ولا تصوير فيديو أو ثلاثي أبعاد أو مطبوعات، ولا رسوم التطبيقات والبيانات والأدوات الخارجية، ولا دعم طوارئ على مدار الساعة. قوائم العملاء بتتنسلم ليك. مش بنبعت رسائل جماعية أو سبام.',
        },
        {
          q: 'ممكن أوقف الباقة أو ألغيها؟',
          a: 'أيوه. أوتوليدز أون كول من شهر لشهر. ممكن توقفها مرة كل ربع سنة. الالتزام لـ ٣ أشهر اختياري وبخصم ١٠٪.',
        },
        {
          q: 'بتشتغلوا على أنهي منصات؟',
          a: 'أوتوليدز أون كول بيشتغل على Shopify وسلة وزد وWooCommerce والمنصات المشابهة اللي بتستخدمها المتاجر الإلكترونية الصغيرة في الإمارات والسعودية ومصر والخليج وأمريكا وبريطانيا.',
        },
        {
          q: 'وكيل واتساب موجود في الباقة؟',
          a: 'لا. وكيل واتساب بالذكاء الاصطناعي من أوتوليدز إضافة، مش جزء من باقات أون كول الأساسية. ممكن يتضاف بسعر باقة Growth الحالي، وهو سعر مرة واحدة ٣٢٬٠٠٠ جنيه في مصر أو ١٬٥٠٠ دولار في الخليج.',
        },
        {
          q: 'هل Lash Cartel عميل حقيقي؟',
          a: 'أيوه. Lash Cartel Cosmetics مشروع عميل حقيقي لأوتوليدز. براند تجميل أسترالي بيصمم ويشحن الرموش من أستراليا. المتجر الشغال على https://lashcartelcosmetics.com. وأوتوليدز كمان ولّدت أكثر من ٢٠٠ عميل محتمل عبر ٣ أسواق في الشرق الأوسط وشمال أفريقيا.',
        },
      ],
    },
    cta: {
      eyebrow: 'رسالة واتساب قصيرة تكفي',
      title: 'قول لنا إيه اللي في قائمة متجرك الشهر ده.',
      body: 'ابعت رابط المتجر والمنصة وأول كام مهمة. ونقولك أنهي باقة تناسبك قبل ما أي شغل يبدأ.',
      button: 'ابعت لأوتوليدز على واتساب',
      orMessage: 'أو ابعت على:',
    },
    lashLink: 'الشغل الشهري اللي زي ده هو اللي أوتوليدز أون كول متعملة ليه',
  },
}

export const ON_CALL_TIERS: Record<
  Locale,
  { id: OnCallTierId; name: string; hours: number; title: string; intro: string; items: string[]; featured?: boolean }[]
> = {
  en: [
    {
      id: 'care',
      name: 'Care',
      hours: 6,
      title: 'Edits, fixes, uploads and basic SEO',
      intro: '1 active request at a time. Small tasks in 2 business days.',
      items: [
        'Store and site edits and fixes',
        'Up to 15 product uploads',
        'Basic SEO: meta, alt text and redirects',
        'Uptime check',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      hours: 15,
      title: 'Images, designs, a lead list and a landing page',
      intro: 'Everything in Care, with 2 active requests and small tasks in 1 business day.',
      featured: true,
      items: [
        'Everything in Care',
        'Up to 20 AI product images',
        '8 ad or social designs',
        '1 lead list of up to 300 verified contacts',
        '1 landing page or section',
        'Monthly report',
      ],
    },
    {
      id: 'team',
      name: 'Team',
      hours: 30,
      title: 'More volume, an automation and a monthly call',
      intro: 'Everything in Growth, with 3 active requests and same-business-day urgent fixes.',
      items: [
        'Everything in Growth',
        'Up to 40 AI product images',
        '16 ad or social designs',
        'Lead lists of up to 1,000 contacts',
        '1 small automation per month',
        'Monthly strategy call',
      ],
    },
  ],
  ar: [
    {
      id: 'care',
      name: 'Care',
      hours: 6,
      title: 'تعديلات وإصلاحات ورفع منتجات وSEO أساسي',
      intro: 'طلب واحد في نفس الوقت. المهام الصغيرة في يومي عمل.',
      items: [
        'تعديلات وإصلاحات المتجر والموقع',
        'حتى ١٥ منتج',
        'SEO أساسي: العناوين والنصوص البديلة والتحويلات',
        'متابعة إن الموقع شغال',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      hours: 15,
      title: 'صور وتصميمات وقائمة عملاء وصفحة هبوط',
      intro: 'كل اللي في Care، مع طلبين في نفس الوقت والمهام الصغيرة في يوم عمل واحد.',
      featured: true,
      items: [
        'كل اللي في Care',
        'حتى ٢٠ صورة منتج بالذكاء الاصطناعي',
        '٨ تصميمات إعلان أو سوشيال',
        'قائمة عملاء حتى ٣٠٠ جهة اتصال متحققة',
        'صفحة هبوط أو قسم واحد',
        'تقرير شهري',
      ],
    },
    {
      id: 'team',
      name: 'Team',
      hours: 30,
      title: 'حجم أكبر، وأتمتة، ومكالمة شهرية',
      intro: 'كل اللي في Growth، مع ٣ طلبات في نفس الوقت وإصلاحات مستعجلة في نفس يوم العمل.',
      items: [
        'كل اللي في Growth',
        'حتى ٤٠ صورة منتج بالذكاء الاصطناعي',
        '١٦ تصميم إعلان أو سوشيال',
        'قوائم عملاء حتى ١٬٠٠٠ جهة اتصال',
        'أتمتة صغيرة واحدة شهرياً',
        'مكالمة استراتيجية شهرية',
      ],
    },
  ],
}
