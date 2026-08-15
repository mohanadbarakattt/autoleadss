/**
 * The agency package — ONE definition, used by every surface that quotes it.
 *
 * AutoLeadss is a done-for-you growth agency. There is exactly ONE package at
 * ONE price, quoted in ONE currency. Any page that mentions a price reads it
 * from here so the marketing site, a proposal and a contract can never quote
 * different numbers.
 *
 * THREE THINGS THIS FILE EXISTS TO KEEP HONEST:
 *
 * 1. It is a FIXED price, not a floor. The offer used to be "from $3,500/month"
 *    and every surface carried a "from" qualifier. One package at one price
 *    means no "from" anywhere — a visitor should read the number and know
 *    exactly what they will pay.
 * 2. USD ONLY. The site used to convert the price into AED/SAR/EGP behind a
 *    currency switcher. Removed 2026-08-15: the package is sold in dollars, and
 *    a converted figure invites a client to expect that exact number on an
 *    invoice — while pegs move, the pound floats, and their bank applies its
 *    own rate. One currency, no ambiguity, nothing to reconcile later.
 * 3. $500 of the package IS ad spend. Whether media budget is included is the
 *    single most disputed line in agency pricing, so it is a first-class value
 *    here and must be shown wherever the price is shown — never buried in a
 *    footnote and never omitted.
 */

/** The monthly package price, in whole USD. Fixed, not a floor. */
export const PACKAGE_USD = 1_500

/** Of the package price, this much is ad spend paid to the platforms, not fees. */
export const PACKAGE_AD_SPEND_USD = 500

/** The free consultation, in minutes. No card, no commitment. */
export const CONSULT_MINUTES = 30

/** `1500` → `"$1,500"`. Grouping separators only — the package has no cents. */
function usd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * The package price, formatted for display. Always USD, in both locales —
 * the Arabic page shows the same "$1,500" a client would see on an invoice
 * rather than Arabic-Indic digits for a dollar amount.
 */
export function packagePrice(): { amount: string; adSpend: string } {
  return { amount: usd(PACKAGE_USD), adSpend: usd(PACKAGE_AD_SPEND_USD) }
}
