import type { Industry } from './types'

export interface IndustryMeta {
  id: Industry
  icon: string // lucide name
  label: { en: string; ar: string }
  emoji: string
  /** Example business name shown as the wizard's step-2 placeholder, tailored to this industry. */
  namePlaceholder: { en: string; ar: string }
}

export const INDUSTRIES: IndustryMeta[] = [
  { id: 'real-estate', icon: 'Building2', emoji: '🏙️', label: { en: 'Real estate', ar: 'عقارات' }, namePlaceholder: { en: 'e.g. Marina Heights Realty', ar: 'مثال: مرتفعات المارينا العقارية' } },
  { id: 'ecommerce', icon: 'ShoppingBag', emoji: '🛍️', label: { en: 'E-commerce', ar: 'تجارة إلكترونية' }, namePlaceholder: { en: 'e.g. Nile Threads Co.', ar: 'مثال: خيوط النيل للتجارة' } },
  { id: 'clinic', icon: 'Stethoscope', emoji: '🦷', label: { en: 'Clinic / medical', ar: 'عيادة / طبي' }, namePlaceholder: { en: 'e.g. Cedars Dental Clinic', ar: 'مثال: عيادة الأرز لطب الأسنان' } },
  { id: 'restaurant', icon: 'UtensilsCrossed', emoji: '🍽️', label: { en: 'Restaurant / food', ar: 'مطعم / طعام' }, namePlaceholder: { en: 'e.g. Zeytoon Kitchen', ar: 'مثال: مطبخ زيتون' } },
  { id: 'fitness', icon: 'Dumbbell', emoji: '💪', label: { en: 'Fitness / gym', ar: 'لياقة / جيم' }, namePlaceholder: { en: 'e.g. Flex Fitness Studio', ar: 'مثال: استوديو فليكس للياقة' } },
  { id: 'services', icon: 'Briefcase', emoji: '💼', label: { en: 'Services / other', ar: 'خدمات / أخرى' }, namePlaceholder: { en: 'e.g. Falcon Consulting', ar: 'مثال: فالكون للاستشارات' } },
]

export function industryLabel(id: Industry, locale: 'en' | 'ar'): string {
  return INDUSTRIES.find((i) => i.id === id)?.label[locale] ?? id
}

export function industryNamePlaceholder(id: Industry | null, locale: 'en' | 'ar'): string {
  const fallback = locale === 'ar' ? 'مثال: اسم نشاطك' : 'e.g. Your Business Name'
  if (!id) return fallback
  return INDUSTRIES.find((i) => i.id === id)?.namePlaceholder[locale] ?? fallback
}
