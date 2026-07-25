import type { BusinessTypeId } from './onboarding'
import type { ToolKey } from './suite/tools'

export type Locale = 'en' | 'ar'
export type Region = 'egypt' | 'gulf'
/** Display currency for pricing (Phase 7b). Independent of `Region` — `Region`
 * still drives which price list (`priceEgypt`/`priceGulf`) and money path a
 * workspace uses; `Currency` only controls what a visitor SEES. See
 * `src/saas/currency.ts` for the pegged-vs-floating rule and conversion. */
export type Currency = 'USD' | 'AED' | 'SAR' | 'EGP'
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
  /** Phase 4b: a site's mode. Absent or 'capture' = today's lead funnel
   * (FunnelRenderer), unchanged. 'sell' = a storefront (StorefrontRenderer) —
   * same Funnel/FunnelSpec entity, same /p/:slug route, just a different
   * renderer picked in Published.tsx off this field. No migration needed
   * since `spec` is jsonb. */
  mode?: 'capture' | 'sell'
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

/** A `Lead` plus which funnel it came from — the shape `GET /api/leads` (the
 * cross-site list) and the demo-mode equivalent in Leads.tsx both produce, so
 * the CRM surface can show provenance without a second round-trip per lead. */
export interface LeadWithFunnel extends Lead {
  funnelId: string
  funnelName: string
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
  /** Owner's white-label branding, resolved server-side and attached on
   * public published fetches (api/published/index.ts) — see that file's
   * module doc for the Phase 6 fix this represents (previously nothing ever
   * set this field, so Published.tsx silently fell back to the visitor's own
   * local agency state instead). */
  brand?: { brandName?: string; logoUrl?: string; hideBadge: boolean }
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

/** A merchant's catalogue item (Phase 4a "Sell"). `priceMinor` is integer minor
 * units (fils/cents) — see `src/saas/lib/money/minorUnits.ts` for the
 * major-unit conversion/formatting boundary; never do ad-hoc `/100` math. */
export interface Product {
  id: string
  name: string
  description?: string
  imageUrl?: string
  priceMinor: number
  currency: string
  stock: number
  status: 'draft' | 'active' | 'archived'
  createdAt: number
  updatedAt: number
}

/** Display-safe product shape returned by the public storefront API
 * (api/published/products.ts) — never `clerk_user_id`, never the raw `stock`
 * count, just a computed `inStock` boolean. */
export interface PublicProduct {
  id: string
  name: string
  description?: string
  imageUrl?: string
  priceMinor: number
  currency: string
  inStock: boolean
}

/** A single sold line. `nameSnapshot`/`unitPriceMinor` freeze the product's
 * name/price AS SOLD — see the order_items comment in migration 0005_sell.sql
 * for why this must never re-read the live product. */
export interface OrderItem {
  id: string
  productId?: string
  nameSnapshot: string
  unitPriceMinor: number
  quantity: number
  currency: string
}

/** A merchant's order (Phase 4a: read-only — created only by Phase 4b's
 * checkout, marked 'paid' only by the Phase 3a payments webhook). */
export interface Order {
  id: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  subtotalMinor: number
  currency: string
  paymentId?: string
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  createdAt: number
  updatedAt: number
  items: OrderItem[]
}

/** Cross-site lead counts by status/source — shared shape between
 * `GET /api/insights`'s per-site + totals rollup and the demo-mode equivalent
 * (`src/saas/insights/demo.ts`), so both sides of the remote/demo split
 * produce the exact same aggregate shape (Phase 5b). */
export interface LeadStatusCounts {
  new: number
  qualified: number
  won: number
  lost: number
}

export interface LeadSourceCounts {
  page: number
  whatsapp: number
}

/** One calendar day's count in a trend series — always UTC-keyed 'YYYY-MM-DD'
 * (see api/insights/index.ts's module doc for why: `visits_by_day` has no
 * per-visit timestamp to re-bucket into another timezone). Display formatting
 * (e.g. "7/24") happens in the page, not here. */
export interface InsightsDayCount {
  day: string
  count: number
}

export interface SiteInsights {
  id: string
  name: string
  visits: number
  leads: number
  leadsByStatus: LeadStatusCounts
  leadsBySource: LeadSourceCounts
}

/** Cross-site totals + per-site breakdown + bounded daily trend series — the
 * response shape of `GET /api/insights` (api/insights/index.ts) and of its
 * demo-mode equivalent (`src/saas/insights/demo.ts`). No revenue field: an
 * order can only ever be 'paid' once a payment gateway is connected (Phase
 * 3b, parked), so `ordersPending` is explicitly labeled pending, never shown
 * as earned revenue (design honesty requirement b). */
export interface InsightsSummary {
  windowDays: number
  totals: {
    visits: number
    leads: number
    leadsByStatus: LeadStatusCounts
    leadsBySource: LeadSourceCounts
    ordersPending: { count: number; byCurrency: { currency: string; valueMinor: number }[] }
  }
  sites: SiteInsights[]
  series: {
    visits: InsightsDayCount[]
    leads: InsightsDayCount[]
  }
}

/** A merchant's custom domain, mapped to one of their funnels (Phase 4c).
 * Verified via a real DNS TXT lookup at `_autoleadss.<hostname>` (see
 * api/domains/verify.ts) — never a checkbox. Only resolves publicly once
 * `verified` is true (see api/published/index.ts's `?host=` path). */
export interface Domain {
  id: string
  funnelId: string
  hostname: string
  verified: boolean
  /** The exact value the owner must publish in a TXT record at
   * `_autoleadss.<hostname>` to prove control of the domain. */
  verificationToken: string
  createdAt: number
  verifiedAt?: number
}

export interface Workspace {
  id: string
  name: string
  region: Region
  plan: PlanId
  createdAt: number
  /** Suite v2 Hub region pill (Gulf · Global) — independent of `region` above, which
   * drives pricing/money paths and migrates separately in Phase 7. Optional so
   * existing sessions default to 'gulf' without a migration. */
  marketRegion?: 'gulf' | 'global'
  /** Suite v2 onboarding (/app/start) — the business type + recommended toolkit the
   * workspace chose. Optional so existing sessions (pre-onboarding) don't need a
   * migration; the Hub redirects to /app/start until `toolkit` is set. */
  businessType?: BusinessTypeId
  toolkit?: ToolKey[]
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
