/**
 * Generic ISO-4217 minor-unit money helpers for the Sell product/order model
 * (AED, USD, ...). NOT vendored — unlike the other files in this directory
 * (money.ts/constants.ts/fees.ts/margin.ts, synced from mbai-ecosystem's
 * EGP-piastres + VAT/margin package), this file is local to AutoLeadss and
 * free to edit here.
 */

/**
 * Converts a human-entered major-unit amount (e.g. "2400.50", from a price
 * input) into an integer minor-unit amount (e.g. 240050) — the ONE place this
 * conversion happens, at the client/DB boundary, so a price is never
 * multiplied or divided by 100 anywhere else.
 *
 * Rejects anything that isn't a plain positive number with at most 2 decimal
 * places: NaN, negative, zero, and >2-decimal strings all throw rather than
 * silently rounding to a different price. The regex guarantees at most 2
 * fractional digits before any arithmetic runs, so `Math.round(Number(str) *
 * 100)` lands on an exact integer even for classic float-drift inputs like
 * 0.1 or 0.7 (0.1 * 100 = 10.000000000000002 in IEEE754, but Math.round
 * fixes that back to 10 — the drift never accumulates because this function
 * is only ever called once per price, not chained).
 */
export function majorToMinor(major: string | number): number {
  const str = typeof major === 'number' ? String(major) : major.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(str)) throw new Error(`majorToMinor: not a valid amount: ${JSON.stringify(major)}`)
  const minor = Math.round(Number(str) * 100)
  if (!Number.isSafeInteger(minor) || minor <= 0) throw new Error(`majorToMinor: not a valid amount: ${JSON.stringify(major)}`)
  return minor
}

/** Inverse of majorToMinor, for pre-filling an EDITABLE price input with a
 * stored value (e.g. opening the edit form for a 240050-minor-unit product
 * shows "2400.50"). Not for display — use formatMinorUnits for that (it adds
 * the currency code and drops trailing zeros, neither of which belongs in an
 * editable numeric field). Keeping this here, rather than a bare `minor /
 * 100` in the component, is what makes "never do ad-hoc /100 arithmetic
 * outside this file" actually true. */
export function minorToMajorInput(minor: number): string {
  return (minor / 100).toFixed(2)
}

/** Formats integer minor units + an ISO currency code for display, e.g.
 * `formatMinorUnits(240000, 'AED')` -> "AED 2,400", `formatMinorUnits(240050, 'AED')`
 * -> "AED 2,400.50". Drops ".00" on whole amounts, like the vendored formatEgp's
 * `compact` mode — "AED 2,400" reads better than "AED 2,400.00". Never do ad-hoc
 * `/100` arithmetic in a component; always go through this. */
export function formatMinorUnits(minor: number, currency: string): string {
  const whole = minor % 100 === 0
  const num = whole ? String(minor / 100) : (minor / 100).toFixed(2)
  const grouped = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${currency} ${grouped}`
}
