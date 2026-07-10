export type Locale = 'en' | 'ar'
export type Region = 'egypt' | 'gulf'
export type Industry = 'real-estate' | 'ecommerce' | 'clinic' | 'restaurant' | 'fitness' | 'services' | 'other'
export type PlanId = 'starter' | 'growth' | 'pro' | 'dwy' | 'whitelabel'
export type Tone = 'bold' | 'friendly' | 'luxury' | 'professional'

/** A generated funnel spec — the single source of truth the generator produces and the renderer consumes. */
export interface FunnelSpec {
  industry: string
  language: Locale
  businessName: string
  page: {
    hero: {
      eyebrow: string
      headline: string
      subhead: string
      ctaPrimary: string
      ctaSecondary: string
      badges: string[]
    }
    stats: { value: string; label: string }[]
    features: { title: string; body: string; icon: string }[]
    testimonials: { quote: string; name: string; role: string }[]
    faq: { q: string; a: string }[]
    finalCta: { headline: string; sub: string; cta: string }
    leadForm: { title: string; fields: string[]; button: string }
  }
  ads: { platform: string; headline: string; description: string; cta: string }[]
  chatbot: {
    greeting: string
    qualifyingQuestions: string[]
    flow: { trigger: string; response: string }[]
    bookingMessage: string
  }
  social: { platform: string; caption: string; hashtags: string[] }[]
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  source: 'page' | 'whatsapp'
  status: 'new' | 'qualified' | 'won' | 'lost'
  createdAt: number
}

export interface Funnel {
  id: string
  name: string
  slug: string
  industry: Industry
  language: Locale
  status: 'draft' | 'published'
  accent: string
  spec: FunnelSpec
  createdAt: number
  updatedAt: number
  visits: number
  leads: Lead[]
  subAccountId?: string
  /** Owner's white-label branding, attached on public published fetches. */
  brand?: { brandName?: string; hideBadge: boolean }
}

/** White-label branding for an agency (tier D). */
export interface AgencySettings {
  brandName?: string
  accent?: string
  logoUrl?: string
  hideBadge: boolean
}

/** A client account managed by a white-label agency. */
export interface SubAccount {
  id: string
  name: string
  contactEmail?: string
  createdAt: number
}

export interface Workspace {
  id: string
  name: string
  region: Region
  plan: PlanId
  createdAt: number
}

export interface User {
  id: string
  name: string
  email: string
}

export interface Session {
  user: User
  workspace: Workspace
}

export interface WizardInput {
  industry: Industry
  businessName: string
  language: Locale
  region: Region
  goal: string
  tone: Tone
  accent: string
  audience?: string
}
