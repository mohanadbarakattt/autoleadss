import { convertUsdToCurrency, formatCurrencyAmount } from '../saas/currency'
import type { Currency, Locale } from '../saas/types'

/**
 * The agency retainer — ONE definition, used by every surface that quotes it.
 *
 * AutoLeadss is a done-for-you growth agency: the suite under src/saas is how
 * the work gets delivered, not something a visitor buys. Any page that mentions
 * a price reads it from here so the marketing site, a proposal and a contract
 * can never quote different numbers.
 *
 * TWO THINGS THIS FILE EXISTS TO KEEP HONEST:
 *
 * 1. It is a FLOOR, not a fixed price — "from $3,500/month". Scope varies per
 *    client, so anything that renders this must keep the "from".
 * 2. $500 of the retainer IS ad spend. Whether media budget is included is the
 *    single most disputed line in agency pricing, so it is a first-class field
 *    here and must be shown wherever the price is shown — never buried in a
 *    footnote and never omitted.
 */

/** Monthly floor, in whole USD. */
export const RETAINER_FROM_USD = 3_500

/** Of the retainer, this much is ad spend paid to the platforms, not fees. */
export const RETAINER_AD_SPEND_USD = 500

/** What the retainer covers. Deliverables only — no outcome or result claims:
 * those belong to a case study with measured numbers behind it. */
export const RETAINER_DELIVERABLES = [
  'socialPosts', // 4 per day
  'adCampaign', // new campaign every week
  'website',
  'chatbot',
] as const

export type RetainerDeliverable = (typeof RETAINER_DELIVERABLES)[number]

/**
 * The retainer in a visitor's currency.
 *
 * AED and SAR are pegged to the dollar, so converting is exact and stable.
 * EGP FLOATS — a derived EGP figure would drift with the pound and quietly
 * change the price nobody agreed to change, which is why this codebase never
 * derives EGP (see src/saas/pricing.ts's hand-written priceEgypt list). Until
 * an EGP retainer price is set by the owner, an EGP visitor is quoted in USD.
 * That is a deliberate fallback, not an oversight.
 */
export function retainerPrice(currency: Currency, locale: Locale = 'en'): { amount: string; adSpend: string; quotedIn: Currency } {
  const quotedIn: Currency = currency === 'EGP' ? 'USD' : currency
  const amount = quotedIn === 'USD' ? RETAINER_FROM_USD : convertUsdToCurrency(RETAINER_FROM_USD, quotedIn)
  const adSpend = quotedIn === 'USD' ? RETAINER_AD_SPEND_USD : convertUsdToCurrency(RETAINER_AD_SPEND_USD, quotedIn)
  return {
    amount: formatCurrencyAmount(amount, quotedIn, locale),
    adSpend: formatCurrencyAmount(adSpend, quotedIn, locale),
    quotedIn,
  }
}
