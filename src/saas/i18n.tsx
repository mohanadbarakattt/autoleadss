
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Locale } from './types'

/**
 * The SaaS chrome's own locale — a superset of the funnel-content `Locale` (which
 * stays 'en'|'ar' since generated funnel copy isn't produced in Franco; see
 * `toContentLocale` below). Franco gets full translations for this file's UI
 * strings (nav, buttons, wizard/dashboard/editor labels); a handful of deeper,
 * formal Record<Locale,...> lookups elsewhere (plan names, industry labels, lead
 * statuses) fall back through `toContentLocale` to keep everything on-screen in
 * one script rather than mixing Latin Franco with Arabic-script fragments.
 */
export type UILocale = 'en' | 'ar' | 'fr-eg'

/** Maps the UI locale to the nearest funnel-content locale for Record<Locale,...>
 * lookups that don't have Franco copy. English (not Arabic) is the fallback for
 * Franco so the screen stays in one script — Franco readers code-switch to English
 * constantly, but a sudden Arabic-script fragment in an otherwise Latin-script UI
 * reads as a script-mixing bug, not a feature. */
export function toContentLocale(l: UILocale): Locale {
  return l === 'ar' ? 'ar' : 'en'
}

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
      nameRequired: 'Please enter your name.',
      emailRequired: 'Please enter your email.',
      emailInvalid: 'Please enter a valid email address.',
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
      nameRequired: 'من فضلك أدخل اسمك.',
      emailRequired: 'من فضلك أدخل بريدك الإلكتروني.',
      emailInvalid: 'من فضلك أدخل بريداً إلكترونياً صحيحاً.',
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
  'fr-eg': {
    nav: { product: 'El Product', pricing: 'El As3ar', login: 'Login', start: 'Ebda2 Majjany', dashboard: 'Dashboard' },
    common: {
      getStarted: 'Ebda2 majjany',
      book: 'Ehgez demo',
      new: 'Funnel gedid',
      generate: 'Wallad el funnel bta3y',
      save: 'Save',
      publish: 'Publish',
      published: 'Published',
      draft: 'Draft',
      preview: 'Preview',
      edit: 'Edit',
      back: 'Rega3',
      next: 'Next',
      cancel: 'Cancel',
      delete: 'Delete',
      copy: 'Copy',
      copied: 'Et-copy',
      open: 'Efta7',
      leads: 'Leads',
      visits: 'Zeyarat',
      convRate: 'Conv. rate',
    },
    auth: {
      signupTitle: 'Emel account 3ala AutoLeadss',
      signupSub: 'Ebni awel funnel beta3ak bel AI fi da2a2e2. Bidoon card.',
      loginTitle: 'Ahlan beek tany',
      loginSub: 'Log in le workspace beta3ak 3ala AutoLeadss.',
      name: 'El esm el kamel',
      email: 'Email el shoghl',
      region: 'Beteb3 fen?',
      egypt: 'Masr',
      gulf: 'El Khaleeg / El Emarat',
      createAccount: 'E3mel el account',
      login: 'Log in',
      haveAccount: '3andak account already?',
      noAccount: 'Mesh 3andak account?',
      demoNote: 'Shaghal fi demo mode — el data beta3ak fi el browser da bas.',
      nameRequired: 'Ektib esmak min fadlak.',
      emailRequired: 'Ektib el email beta3ak min fadlak.',
      emailInvalid: 'Ektib email sa7i7 min fadlak.',
    },
    wizard: {
      title: 'Yalla nebni el funnel beta3ak',
      step: 'Khatwa',
      of: 'men',
      industryQ: 'Nashat eh da?',
      nameQ: 'Esm el nashat eh?',
      namePh: 'Mesalan: Marina Heights Realty',
      langQ: 'El funnel yeb2a be anhy logha?',
      regionQ: 'El 3omala2 beta3ak fen?',
      goalQ: 'Eh el hadaf el awal men el funnel da?',
      toneQ: 'Ekhtar el tone w el lawn',
      audiencePh: '3omala2ak meen? (ekhteyari)',
      generating: 'Bnebni el funnel beta3ak…',
      generatingSub: 'Benaktob el page, el ads, bot el WhatsApp, w el social — fi sawany.',
      ready: 'El funnel beta3ak gahez 🎉',
      readySub: 'Landing page, ad copy, WhatsApp bot, w social posts — kolohom gahzeen.',
      openEditor: 'Efta7 fel editor',
    },
    goals: {
      leads: 'Zawed el leads',
      bookings: 'Zawed el bookings / mawa3eed',
      sales: 'Zawed el online sales',
      calls: 'Zawed mokalmat WhatsApp',
    },
    tones: { bold: 'Bold', friendly: 'Friendly', luxury: 'Luxury', professional: 'Professional' },
    dash: {
      title: 'El funnels beta3ak',
      empty: 'Mafeesh funnels lessa',
      emptySub: 'Wallad awel sales funnel beta3ak bel AI fi a2al men da2i2a.',
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
      publishedAt: 'Live 3ala',
      copyLink: 'Copy el link',
      simulator: 'Garrab el bot',
      typeMessage: 'Ektib resala…',
    },
    pricing: {
      title: 'As3ar betekbar ma3ak',
      sub: 'Ebda2 majjany. Ra22i lama el leads tebda2 tegy. As3ar mazbota le so2ak.',
      egypt: 'Masr',
      gulf: 'El Khaleeg / El Emarat',
      monthly: 'Shahry',
      annual: 'Sanawy −20%',
      mo: '/shahr',
      popular: 'El aktar talab',
      choose: 'Ekhtar el plan',
      current: 'El plan el 7aly',
      contact: 'Kallem el sales',
    },
    lang: { switch: 'العربية', label: 'FRN' },
  },
}

export type Dict = (typeof STRINGS)['en']

const Ctx = createContext<{ locale: UILocale; t: Dict; setLocale: (l: UILocale) => void; isRTL: boolean } | null>(null)

/** Shared across the marketing site's LocaleProvider (src/i18n/LocaleProvider.tsx)
 * too, so a language chosen while browsing the marketing pages carries into
 * /signup and the app instead of silently resetting to English — see that file's
 * `persist` handling for the other half of this bridge. */
export const LOCALE_KEY = 'autoleadss:locale'
/** Pre-rebrand key (this SaaS was ported from the "Virlo" project name). Read-only —
 * we migrate it into LOCALE_KEY on first load so returning users keep their choice. */
const LEGACY_LOCALE_KEY = 'virlo:locale'

/** BCP-47 lang per UI locale — Franco is Egyptian Arabic in Latin script, so
 * "ar-Latn" (not "fr-eg", which would misleadingly read as French). */
const HTML_LANG: Record<UILocale, string> = { en: 'en', ar: 'ar', 'fr-eg': 'ar-Latn' }

function isUILocale(v: string | null): v is UILocale {
  return v === 'ar' || v === 'en' || v === 'fr-eg'
}

function readStoredLocale(): UILocale | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(LOCALE_KEY)
  if (isUILocale(saved)) return saved
  const legacy = window.localStorage.getItem(LEGACY_LOCALE_KEY)
  if (isUILocale(legacy)) {
    try {
      window.localStorage.setItem(LOCALE_KEY, legacy)
    } catch {}
    return legacy
  }
  return null
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UILocale>('en')

  useEffect(() => {
    const saved = readStoredLocale()
    if (saved) setLocaleState(saved)
  }, [])

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', HTML_LANG[locale])
    document.documentElement.setAttribute('dir', dir)
  }, [locale])

  const setLocale = (l: UILocale) => {
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
