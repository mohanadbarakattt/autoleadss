/**
 * Coerce a value that may have crossed the wire as a bigint-string into a JS
 * number, throwing rather than silently accepting anything that isn't a safe
 * integer.
 *
 * WHY THIS EXISTS: every `bigint` column in the `autoleadss` schema (amount_minor,
 * price_minor, subtotal_minor, unit_price_minor, count(*) results, ...) is Postgres
 * OID 20. The Neon driver's text-mode parser returns OID 20 as a STRING to avoid
 * silent precision loss above 2^53 — never a JS number, regardless of what a TS
 * row-shape annotation claims. Comparing or arithmetic-ing that string directly
 * against a real JS number (e.g. `"5000" !== 5000`) is always wrong; this used to
 * 409 every legitimate payment webhook before the bug was found (see
 * api/payments/webhook/[gateway].ts's module doc for the full story). Extracted
 * here so every route touching a bigint money column reuses the same fix instead
 * of re-deriving it.
 */
export function toSafeInt(raw: unknown, field: string): number {
  const n = typeof raw === 'string' ? Number(raw) : raw
  if (typeof n !== 'number' || !Number.isSafeInteger(n)) throw new Error(`${field} is not a safe integer: ${String(raw)}`)
  return n
}
