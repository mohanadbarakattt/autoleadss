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
    /** Shown instead of the default inline "Sent ✅" panel after a lead submits, when set. */
    thankYou?: { headline: string; body: string; ctaLabel?: string; ctaHref?: string }
  }
  /** Per-funnel conversion tracking — injected into the published page's <head> (see
   * Published.tsx). Both optional and independent of each other. */
  tracking?: { metaPixelId?: string; ga4Id?: string }
  ads: { platform: string; headline: string; description: string; cta: string }[]
  chatbot: {
    greeting: string
    qualifyingQuestions: string[]
    flow: { trigger: string; response: string }[]
    bookingMessage: string
  }
  social: { platform: string; caption: string; hashtags: string[] }[]
  /** True when this spec's body copy (features/testimonials/FAQ/chatbot/ads/social)
   * is still template-derived rather than freshly written by a live AI model — the
   * demo-mode generator personalizes the template (business name, goal, tone,
   * location) but doesn't rewrite it from scratch. Drives the "edit it in the
   * editor" disclosure shown to the funnel owner (never on the public page). */
  isDemoContent?: boolean
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
  /** True for the fictitious leads `seedDemoLeads` injects on a new funnel so the
   * CRM never looks empty — lets the UI badge them and offer a one-click clear. */
  sample?: boolean
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
  /** Daily visit rollup, keyed by UTC 'YYYY-MM-DD', for the visits trend chart in
   * FunnelAnalytics — `visits` alone is just a running total with no timeline.
   * Optional so older stored funnels (from before this field existed) still load. */
  visitsByDay?: Record<string, number>
  /** The fake visit count `seedDemoLeads` added at creation time (so "clear sample
   * data" can subtract exactly that many and leave any real, later visits intact). */
  seedVisits?: number
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
  /** Reported to `/api/ai-generate` so its server-side AI-action cap backstop
   * (api/ai-generate.ts) can look up the right cap for this caller. Only the
   * wizard's live-AI path (generateLive.ts) needs this — template-only callers
   * (e.g. Editor.tsx's regenerate, which never hits `/api/ai-generate`) can omit it. */
  plan?: PlanId
}
