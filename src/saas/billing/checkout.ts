import type { PlanId, Region } from '../types'

/**
 * Dual-region checkout (Stripe for Gulf/USD, Paymob for Egypt/EGP) was wired to a
 * Supabase Edge Function (`create-checkout`) before the Phase 2 migration to the
 * shared Neon backend. That edge function depended on the Supabase project removed
 * in this phase (see docs/SETUP.md), so `billingEnabled` is hardcoded off for now.
 * Re-wiring checkout to a Vercel function under `api/` is a reasonable follow-up but
 * is out of scope for this phase (funnels/leads/publish persistence only).
 */
export const billingEnabled = false

/**
 * Starts a dual-region checkout. Always returns `null` for now (see above) — the
 * caller already falls back to setting the plan locally (demo) when this happens.
 *
 * Phase 7b note for whoever re-wires this: pricing is now shown to visitors in
 * USD, AED, SAR, or EGP (src/saas/currency.ts), display-only until this lands.
 * Whatever currency was DISPLAYED is what a real gateway integration here must
 * CHARGE — silently billing in a different currency than what was shown would
 * be a bait-and-switch. `region` alone (egypt/gulf) isn't enough to know that;
 * thread the resolved `Currency` through from the caller too.
 */
export async function startCheckout(_plan: PlanId, _region: Region, _userId?: string): Promise<string | null> {
  return null
}
