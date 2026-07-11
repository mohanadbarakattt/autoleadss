/**
 * Cost basis for the WhatsApp-AI / AI-action caps (PRICING-SPEC-DRAFT.md §2.2,
 * ~/projects/mbai-ecosystem/docs/) and the margin-guard CI check
 * (scripts/margin-guard.ts). This is the one config module every margin
 * calculation reads from — no cost/FX literal should be duplicated inline
 * elsewhere.
 */

/** WhatsApp Cloud API cost per AI-answered conversation. Flagged OPEN in the spec:
 * no Meta per-country/per-category (marketing/utility/service/authentication) rate
 * card has been sourced yet — every margin number derived from this is provisional. */
export const WHATSAPP_COST_USD = 0.03

/** mbai-franco via the shared MBAI Model Gateway, ~250 in / 150 out tokens per
 * generation — the same representative interaction as `api/ai-generate.ts`. */
export const AI_ACTION_COST_USD = 0.00004

/** Cross-ecosystem blended FX basis (PRICING-SPEC-DRAFT.md "FX basis"). */
export const FX_USD_TO_EGP = 49

/** Paymob's blended fee (2.75% + 1 EGP flat) on an EGP charge. */
export function paymobFeeEgp(priceEgp: number): number {
  return priceEgp * 0.0275 + 1
}

/** Stripe/Paddle's blended fee (2.9% + $0.30) on a USD charge. */
export function stripeFeeUsd(priceUsd: number): number {
  return priceUsd * 0.029 + 0.3
}
