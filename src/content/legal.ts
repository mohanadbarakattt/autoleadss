import type { Locale } from '../i18n/translations'
import { SITE } from '../site'

export type LegalDoc = {
  title: string
  updated: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

export const privacyContent: Record<Locale, LegalDoc> = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 15 September 2026',
    intro: `This page describes how ${SITE.name} handles information when you visit autoleadss.com.`,
    sections: [
      {
        heading: 'What this site collects',
        body: [
          'This is a static marketing page. Quotes and payment details are arranged on WhatsApp, not through a checkout on this site. If you message WhatsApp, that service processes the conversation under its own policy.',
          'We store a small local cookie-consent choice in your browser so we do not ask twice. We do not currently load third-party analytics.',
        ],
      },
      {
        heading: 'Contact',
        body: [`Questions: ${SITE.email} or WhatsApp ${SITE.whatsappDisplay}.`],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: ١٥ سبتمبر ٢٠٢٦',
    intro: `تصف هذه الصفحة كيف يتعامل ${SITE.name} مع المعلومات عند زيارة autoleadss.com.`,
    sections: [
      {
        heading: 'ما الذي يجمعه الموقع',
        body: [
          'هذه صفحة تسويقية ثابتة. عروض السعر والدفع عبر واتساب وليس عبر دفع جاهز هنا. إن راسلت واتساب فالخدمة تعالج المحادثة وفق سياستها.',
          'نخزّن اختيار موافقة ملفات التعريف في متصفحك حتى لا نسأل مرتين. لا نحمّل حالياً أدوات تحليل طرف ثالث.',
        ],
      },
      {
        heading: 'التواصل',
        body: [`للاستفسار: ${SITE.email} أو واتساب ${SITE.whatsappDisplay}.`],
      },
    ],
  },
}

export const termsContent: Record<Locale, LegalDoc> = {
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 15 September 2026',
    intro: `This site is the AutoLeadss landing page. Work is quoted on WhatsApp. In Egypt the basic package is 10,000 EGP. Elsewhere it is $200 USD. Half paid upfront and half before final handoff. The package is a landing page, a local FAQ chatbot, and connecting a domain you already own.`,
    sections: [
      {
        heading: 'The work',
        body: [
          'Landing pages, product pages, catalogs of up to four products, and full websites — plus booking, forms, and a local FAQ chatbot — are scoped in the quote.',
          'Egypt payments: InstaPay, Vodafone Cash, or bank transfer. Other countries: bank transfer.',
        ],
      },
      {
        heading: 'Advanced builds',
        body: [`Larger AI products and ventures live at ${SITE.mbai}.`],
      },
      {
        heading: 'Contact',
        body: [`${SITE.email} · ${SITE.whatsappDisplay}`],
      },
    ],
  },
  ar: {
    title: 'شروط الاستخدام',
    updated: 'آخر تحديث: ١٥ سبتمبر ٢٠٢٦',
    intro: `هذا موقع أوتوليدز. العمل يُسعَّر على واتساب. في مصر الباقة الأساسية ١٠٬٠٠٠ جنيه. برا مصر ٢٠٠ دولار. نصف مقدماً ونصف قبل التسليم. الباقة: صفحة هبوط وشات بوت للأسئلة وتوصيل الدومين لو عندك.`,
    sections: [
      {
        heading: 'العمل',
        body: [
          'صفحات هبوط وصفحات منتج وكتالوج حتى أربعة منتجات ومواقع كاملة — مع حجز ونماذج وشات بوت — تُحدد في عرض السعر.',
          'الدفع في مصر: إنستاباي أو فودافون كاش أو تحويل بنكي. دول أخرى: تحويل بنكي.',
        ],
      },
      {
        heading: 'شغل أمتن',
        body: [`المنتجات الأوسع على ${SITE.mbai}.`],
      },
      {
        heading: 'التواصل',
        body: [`${SITE.email} · ${SITE.whatsappDisplay}`],
      },
    ],
  },
}
