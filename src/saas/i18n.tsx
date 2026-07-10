
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Locale } from './types'

const STRINGS = {
  en: {
    nav: { product: 'Product', pricing: 'Pricing', login: 'Log in', start: 'Start free', dashboard: 'Dashboard' },
    common: {
      getStarted: 'Get started free',
      book: 'Book a demo',
      new: 'New funnel',
      generate: 'Generate my funnel',
      save: 'Save',
      publish: 'Publish',
      published: 'Published',
      draft: 'Draft',
      preview: 'Preview',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      cancel: 'Cancel',
      delete: 'Delete',
      copy: 'Copy',
      copied: 'Copied',
      open: 'Open',
      leads: 'Leads',
      visits: 'Visits',
      convRate: 'Conv. rate',
    },
    auth: {
      signupTitle: 'Create your AutoLeadss account',
      signupSub: 'Build your first AI funnel in minutes. No card required.',
      loginTitle: 'Welcome back',
      loginSub: 'Log in to your AutoLeadss workspace.',
      name: 'Full name',
      email: 'Work email',
      region: 'Where do you sell?',
      egypt: 'Egypt',
      gulf: 'Gulf / UAE',
      createAccount: 'Create account',
      login: 'Log in',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      demoNote: 'Runs in demo mode — your data stays in this browser.',
    },
    wizard: {
      title: 'Let’s build your funnel',
      step: 'Step',
      of: 'of',
      industryQ: 'What kind of business is this?',
      nameQ: 'What’s your business called?',
      namePh: 'e.g. Marina Heights Realty', // fallback only — the wizard actually shows an industry-specific placeholder (see industries.ts)
      langQ: 'Which language should the funnel be in?',
      regionQ: 'Where are your customers?',
      goalQ: 'What’s the #1 goal of this funnel?',
      toneQ: 'Pick a tone and colour',
      audiencePh: 'Who are your customers? (optional)',
      generating: 'Building your funnel…',
      generatingSub: 'Writing your page, ads, WhatsApp bot and social — in seconds.',
      ready: 'Your funnel is ready 🎉',
      readySub: 'Landing page, ad copy, WhatsApp bot and social posts — all generated.',
      openEditor: 'Open in editor',
    },
    goals: {
      leads: 'Get more leads',
      bookings: 'Get bookings / appointments',
      sales: 'Drive online sales',
      calls: 'Get WhatsApp conversations',
    },
    tones: { bold: 'Bold', friendly: 'Friendly', luxury: 'Luxury', professional: 'Professional' },
    dash: {
      title: 'Your funnels',
      empty: 'No funnels yet',
      emptySub: 'Generate your first AI sales funnel in under a minute.',
      overview: 'Overview',
      totalFunnels: 'Funnels',
      totalLeads: 'Total leads',
      totalVisits: 'Total visits',
      live: 'Live',
    },
    editor: {
      tabs: { page: 'Landing page', ads: 'Ads', chatbot: 'WhatsApp bot', social: 'Social', leads: 'Leads' },
      regenerate: 'Regenerate',
      livePreview: 'Live preview',
      publishedAt: 'Live at',
      copyLink: 'Copy link',
      simulator: 'Try the bot',
      typeMessage: 'Type a message…',
    },
    pricing: {
      title: 'Pricing that scales with you',
      sub: 'Start free. Upgrade when the leads roll in. Prices tuned for your market.',
      egypt: 'Egypt',
      gulf: 'Gulf / UAE',
      monthly: 'Monthly',
      annual: 'Annual −20%',
      mo: '/mo',
      popular: 'Most popular',
      choose: 'Choose plan',
      current: 'Current plan',
      contact: 'Talk to sales',
    },
    lang: { switch: 'العربية', label: 'EN' },
  },
  ar: {
    nav: { product: 'المنتج', pricing: 'الأسعار', login: 'تسجيل الدخول', start: 'ابدأ مجاناً', dashboard: 'لوحة التحكم' },
    common: {
      getStarted: 'ابدأ مجاناً',
      book: 'احجز عرضاً',
      new: 'قمع جديد',
      generate: 'أنشئ القمع',
      save: 'حفظ',
      publish: 'نشر',
      published: 'منشور',
      draft: 'مسودة',
      preview: 'معاينة',
      edit: 'تعديل',
      back: 'رجوع',
      next: 'التالي',
      cancel: 'إلغاء',
      delete: 'حذف',
      copy: 'نسخ',
      copied: 'تم النسخ',
      open: 'فتح',
      leads: 'عملاء',
      visits: 'زيارات',
      convRate: 'نسبة التحويل',
    },
    auth: {
      signupTitle: 'أنشئ حساب AutoLeadss',
      signupSub: 'ابنِ أول قمع بالذكاء الاصطناعي خلال دقائق. بدون بطاقة.',
      loginTitle: 'مرحباً بعودتك',
      loginSub: 'سجّل الدخول إلى مساحة عملك.',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      region: 'أين تبيع؟',
      egypt: 'مصر',
      gulf: 'الخليج / الإمارات',
      createAccount: 'إنشاء الحساب',
      login: 'تسجيل الدخول',
      haveAccount: 'لديك حساب بالفعل؟',
      noAccount: 'ليس لديك حساب؟',
      demoNote: 'يعمل في وضع العرض — بياناتك تبقى في هذا المتصفّح.',
    },
    wizard: {
      title: 'لنبنِ قمعك',
      step: 'الخطوة',
      of: 'من',
      industryQ: 'ما نوع نشاطك؟',
      nameQ: 'ما اسم نشاطك؟',
      namePh: 'مثال: مرتفعات المارينا العقارية',
      langQ: 'بأي لغة تريد القمع؟',
      regionQ: 'أين عملاؤك؟',
      goalQ: 'ما الهدف الأول من هذا القمع؟',
      toneQ: 'اختر الأسلوب واللون',
      audiencePh: 'من هم عملاؤك؟ (اختياري)',
      generating: 'نبني قمعك…',
      generatingSub: 'نكتب صفحتك وإعلاناتك وبوت واتساب والسوشيال — خلال ثوانٍ.',
      ready: 'قمعك جاهز 🎉',
      readySub: 'صفحة هبوط، نصوص إعلانات، بوت واتساب، ومنشورات — كلها جاهزة.',
      openEditor: 'افتح في المحرّر',
    },
    goals: {
      leads: 'المزيد من العملاء',
      bookings: 'حجوزات / مواعيد',
      sales: 'مبيعات أونلاين',
      calls: 'محادثات واتساب',
    },
    tones: { bold: 'جريء', friendly: 'ودّي', luxury: 'فاخر', professional: 'احترافي' },
    dash: {
      title: 'أقماعك',
      empty: 'لا توجد أقماع بعد',
      emptySub: 'أنشئ أول قمع مبيعات بالذكاء الاصطناعي في أقل من دقيقة.',
      overview: 'نظرة عامة',
      totalFunnels: 'الأقماع',
      totalLeads: 'إجمالي العملاء',
      totalVisits: 'إجمالي الزيارات',
      live: 'مباشر',
    },
    editor: {
      tabs: { page: 'صفحة الهبوط', ads: 'الإعلانات', chatbot: 'بوت واتساب', social: 'السوشيال', leads: 'العملاء' },
      regenerate: 'إعادة توليد',
      livePreview: 'معاينة حيّة',
      publishedAt: 'مباشر على',
      copyLink: 'نسخ الرابط',
      simulator: 'جرّب البوت',
      typeMessage: 'اكتب رسالة…',
    },
    pricing: {
      title: 'أسعار تنمو معك',
      sub: 'ابدأ مجاناً. رقِّ عند تدفّق العملاء. أسعار مضبوطة لسوقك.',
      egypt: 'مصر',
      gulf: 'الخليج / الإمارات',
      monthly: 'شهري',
      annual: 'سنوي −20%',
      mo: '/شهر',
      popular: 'الأكثر طلباً',
      choose: 'اختر الباقة',
      current: 'باقتك الحالية',
      contact: 'تواصل مع المبيعات',
    },
    lang: { switch: 'English', label: 'AR' },
  },
}

export type Dict = (typeof STRINGS)['en']

const Ctx = createContext<{ locale: Locale; t: Dict; setLocale: (l: Locale) => void; isRTL: boolean } | null>(null)

const LOCALE_KEY = 'autoleadss:locale'
/** Pre-rebrand key (this SaaS was ported from the "Virlo" project name). Read-only —
 * we migrate it into LOCALE_KEY on first load so returning users keep their choice. */
const LEGACY_LOCALE_KEY = 'virlo:locale'

function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(LOCALE_KEY)
  if (saved === 'ar' || saved === 'en') return saved
  const legacy = window.localStorage.getItem(LEGACY_LOCALE_KEY)
  if (legacy === 'ar' || legacy === 'en') {
    try {
      window.localStorage.setItem(LOCALE_KEY, legacy)
    } catch {}
    return legacy
  }
  return null
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = readStoredLocale()
    if (saved) setLocaleState(saved)
  }, [])

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', dir)
  }, [locale])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(LOCALE_KEY, l)
    } catch {}
  }

  return (
    <Ctx.Provider value={{ locale, t: STRINGS[locale], setLocale, isRTL: locale === 'ar' }}>{children}</Ctx.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider')
  return ctx
}
