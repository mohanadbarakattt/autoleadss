// VENDORED from mbai-ecosystem/packages/money/src/constants.ts
// DO NOT EDIT HERE — edit the source package and re-run:
//   node packages/money/sync.mjs <this-dir>
// A CI drift check (packages/money/check-drift.mjs) fails if this copy is
// edited locally or falls behind source.
/**
 * Owner-provided economic constants. See docs/EGYPT-ECONOMICS.md for
 * provenance — these are NOT estimates and must never be replaced by a guess.
 */

/** Piastres per EGP. Money is stored as INTEGER piastres everywhere: floats
 * lose money at the edges and 0.1 + 0.2 !== 0.3 is not acceptable in a ledger. */
export const PIASTRES_PER_EGP = 100;

/**
 * Default USD -> EGP rate (owner, 2026-07-20).
 *
 * DELIBERATELY OVERRIDABLE via MBAI_USD_EGP. Costs are USD (Google) and
 * revenue is EGP, so this number IS the margin risk: a rate hardcoded once
 * silently understates cost as the pound moves. autoleadss shipped 49 while
 * the real rate was 55 — a 12% cost understatement that made every margin
 * report look healthier than it was.
 */
export const DEFAULT_USD_TO_EGP = 55;

/**
 * Paymob's flat per-transaction fee in piastres (2.75 EGP, owner 2026-07-20).
 *
 * Flat, not percentage — which is why it dominates small top-ups: a 20 EGP
 * purchase loses ~14% to fees alone. The fee, not model cost, sets the
 * minimum sensible price point.
 *
 * [NEEDS-OWNER] Confirm whether Paymob also takes a percentage, and whether
 * card / Vodafone Cash wallet / Fawry kiosk price differently — the three
 * rails usually do, and Fawry often adds its own collection fee.
 */
export const PAYMOB_FLAT_FEE_PIASTRES = 275;

/**
 * Egypt standard VAT rate.
 * [NEEDS-OWNER] The RATE is public, but whether MBAI's listed prices are
 * VAT-inclusive or exclusive is a business decision nobody has recorded.
 * Until that is answered, use vatInclusive()/vatExclusive() explicitly rather
 * than assuming — the helpers do not pick a default for you.
 */
export const EGYPT_VAT_RATE = 0.14;

/** Reads the live rate from the environment, falling back to the owner value. */
export function usdToEgpRate(env: Record<string, string | undefined> = process.env): number {
  const raw = env.MBAI_USD_EGP;
  if (!raw) return DEFAULT_USD_TO_EGP;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`MBAI_USD_EGP must be a positive number, got "${raw}"`);
  }
  return n;
}
