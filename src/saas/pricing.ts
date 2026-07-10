import type { PlanId, Region, Locale } from './types'

export interface Tier {
  id: PlanId
  name: { en: string; ar: string }
  priceEgypt: string
  priceGulf: string
  popular?: boolean
  contact?: boolean
  tagline: { en: string; ar: string }
  features: { en: string; ar: string }[]
}

/**
 * Dual-region pricing. Gulf is ≥1.5× the Egyptian equivalent (runs ~2×);
 * white-label is the $6,000 enterprise tier. Mirrors docs/SAAS_BUILD_PROMPT.md §5.
 */
export const TIERS: Tier[] = [
  {
    id: 'starter',
    name: { en: 'Starter', ar: 'ستارتر' },
    priceEgypt: '1,500 EGP',
    priceGulf: '$59',
    tagline: { en: 'Get the system running.', ar: 'شغّل النظام.' },
    features: [
      { en: '1 funnel', ar: 'قمع واحد' },
      { en: 'AI page builder', ar: 'منشئ صفحات بالذكاء الاصطناعي' },
      { en: 'Basic web chatbot', ar: 'شات بوت أساسي للموقع' },
      { en: '~500 leads / month', ar: '~500 عميل شهرياً' },
      { en: 'AutoLeadss badge', ar: 'شارة AutoLeadss' },
    ],
  },
  {
    id: 'growth',
    name: { en: 'Growth', ar: 'Growth' },
    priceEgypt: '3,000 EGP',
    priceGulf: '$149',
    popular: true,
    tagline: { en: 'Scale what works.', ar: 'وسّع ما ينجح.' },
    features: [
      { en: '5 funnels', ar: '5 أقماع' },
      { en: 'WhatsApp AI bot', ar: 'بوت واتساب ذكي' },
      { en: 'Ad + social generation', ar: 'توليد إعلانات وسوشيال' },
      { en: 'Remove badge · CRM · A/B test', ar: 'إزالة الشارة · CRM · اختبار A/B' },
    ],
  },
  {
    id: 'pro',
    name: { en: 'Pro', ar: 'برو' },
    priceEgypt: '7,500 EGP',
    priceGulf: '$349',
    tagline: { en: 'Maximum output.', ar: 'أقصى إنتاجية.' },
    features: [
      { en: 'Unlimited funnels', ar: 'أقماع غير محدودة' },
      { en: 'Team seats', ar: 'مقاعد للفريق' },
      { en: 'Priority AI + analytics', ar: 'ذكاء اصطناعي أولوية + تحليلات' },
      { en: 'Integrations', ar: 'تكاملات' },
    ],
  },
  {
    id: 'dwy',
    name: { en: 'Done-with-you', ar: 'نبنيه معك' },
    priceEgypt: 'from 30,000 EGP',
    priceGulf: 'from $1,500',
    contact: true,
    tagline: { en: 'We build & optimize with you.', ar: 'نبني ونحسّن معك.' },
    features: [
      { en: 'Everything in Pro', ar: 'كل ما في برو' },
      { en: 'AutoLeadss team builds & optimizes', ar: 'فريق AutoLeadss يبني ويحسّن' },
      { en: 'Managed ads & content', ar: 'إدارة إعلانات ومحتوى' },
    ],
  },
  {
    id: 'whitelabel',
    name: { en: 'White-label', ar: 'وايت ليبل' },
    priceEgypt: 'from 150,000 EGP',
    priceGulf: 'from $6,000',
    contact: true,
    tagline: { en: 'Resell AutoLeadss as your own.', ar: 'أعد بيع AutoLeadss باسمك.' },
    features: [
      { en: 'Agency sub-accounts', ar: 'حسابات فرعية للوكالات' },
      { en: 'Your branding & domain', ar: 'هويتك ونطاقك' },
      { en: 'Priority support', ar: 'دعم أولوية' },
    ],
  },
]

export function priceFor(tier: Tier, region: Region): string {
  return region === 'egypt' ? tier.priceEgypt : tier.priceGulf
}

export function planName(id: PlanId, locale: Locale): string {
  const t = TIERS.find((x) => x.id === id)
  return t ? t.name[locale] : id
}
