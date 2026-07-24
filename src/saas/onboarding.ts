import { ShoppingCart, Utensils, User, Plus, Home, Star, Briefcase, Hotel, type LucideIcon } from 'lucide-react'
import type { Industry } from './types'
import type { ToolKey } from './suite/tools'

/** The 8 business types from the approved onboarding prototype
 * (.superpowers/al-onboarding.html). */
export type BusinessTypeId = 'retail' | 'restaurant' | 'beauty' | 'clinic' | 'realEstate' | 'coaching' | 'services' | 'hospitality'

export interface BusinessType {
  id: BusinessTypeId
  icon: LucideIcon
  /** Maps onto the existing generation-engine `Industry` type (types.ts) so the
   * wizard/ads/AI pipeline keeps working unchanged — unifying the two taxonomies
   * is Phase 7, out of scope here. */
  industry: Industry
  /** Default recommended toolkit (ToolKey[] from the shared registry, suite/tools.ts).
   * User-editable after onboarding. */
  toolkit: ToolKey[]
}

export const BUSINESS_TYPES: BusinessType[] = [
  { id: 'retail', icon: ShoppingCart, industry: 'ecommerce', toolkit: ['storefront', 'ads', 'whatsapp', 'reviews'] },
  { id: 'restaurant', icon: Utensils, industry: 'restaurant', toolkit: ['whatsapp', 'bookings', 'social', 'reviews'] },
  { id: 'beauty', icon: User, industry: 'services', toolkit: ['bookings', 'whatsapp', 'social', 'reviews'] },
  { id: 'clinic', icon: Plus, industry: 'clinic', toolkit: ['bookings', 'pages', 'whatsapp', 'leads'] },
  { id: 'realEstate', icon: Home, industry: 'real-estate', toolkit: ['pages', 'leads', 'ads', 'whatsapp'] },
  { id: 'coaching', icon: Star, industry: 'services', toolkit: ['pages', 'leads', 'bookings', 'social'] },
  { id: 'services', icon: Briefcase, industry: 'services', toolkit: ['pages', 'leads', 'ads', 'insights'] },
  { id: 'hospitality', icon: Hotel, industry: 'services', toolkit: ['bookings', 'whatsapp', 'reviews', 'ads'] },
]

/** Payment gateway chips shown on the onboarding toolkit card, per market region —
 * DISPLAY ONLY. No payment code exists until Phase 3 (see Start.tsx's honesty copy). */
export const PAYMENT_CHIPS: Record<'gulf' | 'global', string[]> = {
  gulf: ['Tap', 'PayTabs', 'Tabby', 'Tamara', 'Stripe', 'Apple Pay'],
  global: ['Stripe', 'PayPal', 'Apple Pay'],
}
