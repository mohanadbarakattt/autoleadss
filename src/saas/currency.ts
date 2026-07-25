import type { Currency, Locale, Region } from './types'

/**
 * Display-currency detection, conversion, and formatting (Phase 7b —
 * geo-located pricing currency). Payments are NOT live yet (Phase 3b is
 * parked, see billing/checkout.ts), so everything here is display-only: it
 * decides what a visitor SEES, never what they're charged.
 */

/** USD is the worldwide default/fallback. AED/SAR are added because their
 * pegs are well-documented central-bank rates we're confident in (see
 * CURRENCY_PEGS below) — more Gulf currencies (QAR, BHD, OMR, ...) can be
 * added the same way once their pegs are confirmed, but guessing one is
 * worse than leaving it on USD. */
export const SUPPORTED_CURRENCIES: readonly Currency[] = ['USD', 'AED', 'SAR', 'EGP']

/** UAE dirham, pegged to USD by the UAE Central Bank since November 1997. */
const AED_PER_USD = 3.6725
/** Saudi riyal, pegged to USD by SAMA since June 1986. */
const SAR_PER_USD = 3.75

/** One named constant per pegged currency, so there is exactly one line to
 * audit or update if a peg is ever revalued. These are central-bank pegs, NOT
 * live market rates — pegged currencies don't float, so a fixed constant is
 * exactly as accurate as an API call and needs zero upkeep. */
export const CURRENCY_PEGS: Readonly<Partial<Record<Currency, number>>> = {
  AED: AED_PER_USD,
  SAR: SAR_PER_USD,
}

/**
 * THE LOAD-BEARING RULE: pegged vs floating.
 *
 * AED and SAR are pegged to the US dollar by their central banks, so a price
 * in those currencies can be derived exactly from the USD price and stays
 * accurate indefinitely — deriving is safe and margin-neutral.
 *
 * EGP FLOATS. A derived EGP price would silently drift every time the pound
 * moves against the dollar — the displayed price would change without anyone
 * deciding it. That's exactly why `TIERS`/`TOPUP_PACKS` (pricing.ts) already
 * carry a hand-written `priceEgypt` list instead of a USD figure. NEVER
 * derive EGP here — this function throws rather than silently doing it.
 *
 * Rounding: results round to the nearest whole currency unit (`Math.round`).
 * Every price in this app is already a whole number in its home currency, so
 * this is the ONE rounding policy, applied uniformly — there is no per-price
 * hand-tuning. The owner reviews the resulting table and adjusts source
 * prices if needed, never this function.
 *
 * Never add a peg constant for a currency you're not confident is a genuine
 * central-bank peg — an invented rate is a wrong price. Unpegged/unconfirmed
 * currencies fall through to USD (no entry in CURRENCY_PEGS).
 */
export function convertUsdToCurrency(usdAmount: number, currency: Currency): number {
  if (currency === 'EGP') {
    throw new Error('convertUsdToCurrency: EGP must never be derived — use the hand-written priceEgypt value')
  }
  const peg = CURRENCY_PEGS[currency]
  return peg ? Math.round(usdAmount * peg) : usdAmount
}

/**
 * Formats a whole-unit amount as a currency string. Western digits
 * (`numberingSystem: 'latn'`) in both locales, matching this app's existing
 * numeral convention elsewhere (e.g. `pack.aiAction.toLocaleString()` in
 * Pricing.tsx) — only the currency symbol/name, its placement, and the
 * RTL bidi marks change between 'en' and 'ar'. Intl.NumberFormat embeds its
 * own bidi control characters (RLM) for 'ar-EG', so the result is safe to
 * drop into either an LTR or RTL surrounding layout without extra wrapping.
 */
export function formatCurrencyAmount(amount: number, currency: Currency, locale: Locale = 'en'): string {
  const intlLocale = locale === 'ar' ? 'ar-EG' : 'en-US'
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    numberingSystem: 'latn',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** ISO-3166-1 country code -> display currency. Placeholder for a real
 * geo-IP integration later — there is none today (see `detectCurrency`
 * below), so this is exercised directly by tests and by the timezone-proxy
 * detector's lookup. Unmapped countries fall back to USD. */
const COUNTRY_CURRENCY: Readonly<Partial<Record<string, Currency>>> = {
  EG: 'EGP',
  AE: 'AED',
  SA: 'SAR',
}

export function currencyForCountry(countryCode: string): Currency {
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? 'USD'
}

/** The only IANA timezones this app maps to a supported currency's home
 * country — mirrors `detectRegion`'s 'Africa/Cairo' proxy in pricing.ts, just
 * extended to the Gulf currencies we support. Everything else falls to USD. */
const TIMEZONE_COUNTRY: Readonly<Record<string, string>> = {
  'Africa/Cairo': 'EG',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
}

/**
 * Best-effort currency guess for a visitor with no stored preference. There
 * is no server-side geo-IP in this app (and none should be added — see the
 * Phase 7b spec), so this reuses `detectRegion`'s free, keyless proxy: the
 * browser's IANA timezone. Falls back to USD — both for unmapped timezones
 * and if `Intl` throws (older/misconfigured environments) — so a detection
 * failure never crashes the pricing page.
 */
export function detectCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const country = TIMEZONE_COUNTRY[tz]
    return country ? currencyForCountry(country) : 'USD'
  } catch {
    return 'USD'
  }
}

const CURRENCY_STORAGE_KEY = 'autoleadss:currency:v1'

/** The visitor's own explicit currency choice, if they've made one. Timezone
 * detection is a weak proxy — VPNs, travellers, and misconfigured devices all
 * get it wrong — so a manual choice, once made, must always win over it. */
export function getStoredCurrency(): Currency | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    return raw && (SUPPORTED_CURRENCIES as readonly string[]).includes(raw) ? (raw as Currency) : null
  } catch {
    return null
  }
}

export function setStoredCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  } catch {
    /* ignore quota/storage errors — still usable in-memory this session */
  }
}

/** Resolves the currency to display: the visitor's stored override first
 * (always wins), else the timezone-proxy detection, else USD. */
export function resolveCurrency(): Currency {
  return getStoredCurrency() ?? detectCurrency()
}

/** Same as `resolveCurrency`, but a signed-in workspace's `Region` (set at
 * signup, not a guess) is a stronger hint than timezone — used as the
 * fallback ahead of `detectCurrency()` when no override is stored. Region
 * only distinguishes egypt/gulf, so it can only ever suggest EGP; a gulf
 * workspace still falls through to timezone detection for USD/AED/SAR. */
export function resolveCurrencyForRegion(regionHint?: Region): Currency {
  return getStoredCurrency() ?? (regionHint === 'egypt' ? 'EGP' : detectCurrency())
}
