import type { Locale } from '../i18n/translations'

export type PageFaqItem = {
  q: string
  a: string
  keys: string[]
}

export const PAGE_FAQ: Record<Locale, PageFaqItem[]> = {
  en: [
    {
      q: 'What do I get?',
      keys: ['get', 'build', 'include', 'package', 'website', 'site', 'what do'],
      a: 'The website, appointment booking on the page, forms that arrive, and a local FAQ chatbot on the page. English, Arabic, or both. We connect a domain you already own.',
    },
    {
      q: 'How much is it?',
      keys: ['how much', 'price', 'cost', 'pricing', 'egp', 'usd', '200', '10000', 'pay', 'how do i pay'],
      a: 'Egypt 10,000 EGP. Elsewhere $200. Half before we start. Half before handoff. Bigger sites are quoted after we see the brief.',
    },
    {
      q: 'Is this a WhatsApp website or a WhatsApp bot product?',
      keys: ['whatsapp website', 'whatsapp bot', 'saas', 'product', 'whatsapp-first'],
      a: 'No. We build a website. The chatbot runs on the page. WhatsApp is how you send a brief, and how contact forms can arrive.',
    },
    {
      q: 'Is SEO included?',
      keys: ['seo', 'geo', 'ranking', 'google', 'search', 'geo pricing', 'local'],
      a: 'Yes. We build the site with SEO and local GEO in mind — titles, structure, and the places you serve. Geo pricing can be added when your offer needs different prices by country. We do not promise rankings or traffic numbers.',
    },
    {
      q: 'Do you connect my domain?',
      keys: ['domain', 'dns', 'connect', 'own'],
      a: 'Yes if you already own one. A new domain is quoted separately.',
    },
    {
      q: 'How do I start?',
      keys: ['start', 'begin', 'contact', 'email', 'whatsapp', 'quote'],
      a: 'WhatsApp 011 0005 4278 (+20 110 005 4278) or email mohanad.barakat@mbai-group.com. Half before we start. Half before handoff.',
    },
  ],
  ar: [
    {
      q: 'إيه اللي باخده؟',
      keys: ['باخد', 'بتاخد', 'تشمل', 'باكدج', 'موقع', 'إيه'],
      a: 'الموقع، حجز مواعيد على الصفحة، فورم بيوصل، وشات بوت أسئلة على الصفحة. عربي أو إنجليزي أو الاتنين. لو الدومين عندك بنوصّله.',
    },
    {
      q: 'كام السعر؟',
      keys: ['سعر', 'كام', 'تكلفة', 'دفع', 'جنيه', 'دولار', '200', '10000', 'أدفع', 'كيف أدفع'],
      a: 'مصر ١٠٬٠٠٠ جنيه. برا مصر ٢٠٠ دولار. نص المبلغ قبل ما نبدأ. النص التاني قبل التسليم. المواقع الأكبر بعد ما نشوف الموجز.',
    },
    {
      q: 'ده موقع واتساب ولا منتج شات بوت؟',
      keys: ['واتساب', 'شات بوت', 'منتج', 'سااس'],
      a: 'لأ. بنبني موقع. الشات بوت بيشتغل على الصفحة. واتساب عشان تبعت الموجز، والفورم ممكن يوصل عليه.',
    },
    {
      q: 'السيو ضمن الخطة؟',
      keys: ['سيو', 'seo', 'geo', 'جوجل', 'بحث', 'ترتيب'],
      a: 'أه. الموقع بيتبني بسيو وGEO محلي جوّه — عناوين، هيكل، والأماكن اللي بتخدمها. لو محتاج أسعار تختلف حسب البلد نقدر نضيف geo pricing. من غير وعد بترتيب أو أرقام ترافيك.',
    },
    {
      q: 'هتوصلوا الدومين؟',
      keys: ['دومين', 'توصيل', 'domain'],
      a: 'أه لو الدومين عندك. دومين جديد بيتسعر لوحده.',
    },
    {
      q: 'أبدأ إزاي؟',
      keys: ['أبدأ', 'ابدأ', 'تواصل', 'إيميل', 'واتساب', 'عرض'],
      a: 'واتساب ٠١١ ٠٠٠٥ ٤٢٧٨ (+20 110 005 4278) أو إيميل mohanad.barakat@mbai-group.com. نص قبل ما نبدأ. نص قبل التسليم.',
    },
  ],
}
