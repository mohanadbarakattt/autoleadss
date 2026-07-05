import type { Industry } from './types'

export interface IndustryMeta {
  id: Industry
  icon: string // lucide name
  label: { en: string; ar: string }
  emoji: string
}

export const INDUSTRIES: IndustryMeta[] = [
  { id: 'real-estate', icon: 'Building2', emoji: '🏙️', label: { en: 'Real estate', ar: 'عقارات' } },
  { id: 'ecommerce', icon: 'ShoppingBag', emoji: '🛍️', label: { en: 'E-commerce', ar: 'تجارة إلكترونية' } },
  { id: 'clinic', icon: 'Stethoscope', emoji: '🦷', label: { en: 'Clinic / medical', ar: 'عيادة / طبي' } },
  { id: 'restaurant', icon: 'UtensilsCrossed', emoji: '🍽️', label: { en: 'Restaurant / food', ar: 'مطعم / طعام' } },
  { id: 'fitness', icon: 'Dumbbell', emoji: '💪', label: { en: 'Fitness / gym', ar: 'لياقة / جيم' } },
  { id: 'services', icon: 'Briefcase', emoji: '💼', label: { en: 'Services / other', ar: 'خدمات / أخرى' } },
]

export function industryLabel(id: Industry, locale: 'en' | 'ar'): string {
  return INDUSTRIES.find((i) => i.id === id)?.label[locale] ?? id
}
