import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config'
import type { PlanId, Region } from '../types'

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

/** Billing is live only when a Stripe publishable key + Supabase are configured. */
export const billingEnabled = !!(STRIPE_PK && SUPABASE_URL && SUPABASE_ANON_KEY)

/**
 * Starts a dual-region checkout via the `create-checkout` edge function
 * (Stripe for Gulf/USD, Paymob for Egypt/EGP). Returns a redirect URL, or null
 * if billing isn't configured / the plan isn't purchasable (caller falls back).
 */
export async function startCheckout(plan: PlanId, region: Region, userId?: string): Promise<string | null> {
  if (!billingEnabled || !SUPABASE_URL) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: SUPABASE_ANON_KEY!, authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ plan, region, userId, origin: window.location.origin }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.url === 'string' ? data.url : null
  } catch {
    return null
  }
}
