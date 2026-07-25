import { uid, slugify, createFunnel } from '../store'
import type { Funnel, FunnelSpec, Locale } from '../types'

/** Champagne-gold accent for a sell-mode site — matches `--store-gold`. */
const STORE_ACCENT = '#a9853f'

const HERO_COPY: Record<Locale, { headline: (name: string) => string; subhead: string; cta: string }> = {
  en: { headline: (name) => `Shop ${name}`, subhead: 'New arrivals, thoughtfully chosen.', cta: 'Shop now' },
  ar: { headline: (name) => `تسوّق من ${name}`, subhead: 'وصل حديثاً، مُختار بعناية.', cta: 'تسوّق الآن' },
}

/**
 * A minimal, neutral `FunnelSpec` for a sell-mode site (section 6). Only the
 * fields StorefrontRenderer actually reads (`mode`, `businessName`,
 * `language`, `page.hero`) carry real content — everything else `FunnelSpec`
 * requires for a capture-mode funnel (stats/features/testimonials/faq/ads/
 * chatbot/social/leadForm/finalCta) stays empty rather than inventing copy
 * that's never shown. The full storefront editor (4c) is what eventually
 * lets a merchant customize the hero copy below.
 */
export function buildStorefrontSpec(businessName: string, language: Locale): FunnelSpec {
  const copy = HERO_COPY[language]
  return {
    industry: 'ecommerce',
    language,
    businessName,
    mode: 'sell',
    page: {
      hero: { eyebrow: '', headline: copy.headline(businessName), subhead: copy.subhead, ctaPrimary: copy.cta, ctaSecondary: '', badges: [] },
      stats: [],
      features: [],
      testimonials: [],
      faq: [],
      finalCta: { headline: '', sub: '', cta: '' },
      leadForm: { title: '', fields: [], button: '' },
    },
    ads: [],
    chatbot: { greeting: '', qualifyingQuestions: [], flow: [], bookingMessage: '' },
    social: [],
  }
}

/** Creates and immediately publishes a sell-mode site for the current
 * workspace, so it's live at `/p/:slug` right away — see the design spec's
 * "demonstrable end to end" requirement. The full editor is 4c's job; this
 * just gets a merchant with products from zero to a live storefront. */
export function createStorefrontSite(businessName: string, language: Locale): Funnel {
  const id = uid('site_')
  const funnel: Funnel = {
    id,
    name: businessName,
    slug: slugify(businessName),
    industry: 'ecommerce',
    language,
    status: 'published',
    accent: STORE_ACCENT,
    spec: buildStorefrontSpec(businessName, language),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    visits: 0,
    leads: [],
  }
  createFunnel(funnel)
  return funnel
}
