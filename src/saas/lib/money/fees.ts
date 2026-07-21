// VENDORED from mbai-ecosystem/packages/money/src/fees.ts
// DO NOT EDIT HERE — edit the source package and re-run:
//   node packages/money/sync.mjs <this-dir>
// A CI drift check (packages/money/check-drift.mjs) fails if this copy is
// edited locally or falls behind source.
import type { Piastres } from './money.js';

/**
 * Payment-processor and channel fees. Owner-sourced 2026-07-20 with citations
 * — see docs/EGYPT-ECONOMICS.md. Do not replace any of these with a guess.
 */

/**
 * Paymob standard rate: 2.75% + 3 EGP per transaction, cards AND mobile
 * wallets (Vodafone/Etisalat/Orange Cash, WE Pay), no monthly or setup fee.
 *
 * This RESOLVES an earlier conflict and both previous values were wrong:
 * the owner first recalled a flat ~2.75 EGP, and autoleadss shipped
 * `price * 0.0275 + 1`. The real flat component is 3 EGP, so the shipped code
 * understated every transaction by 2 EGP.
 *
 * Negotiable at volume (1.65–2.5% on cards; Meeza ~0.75%), but we model the
 * STANDARD rate — assuming a discount we have not signed would overstate
 * margin.
 */
export const PAYMOB_PERCENT = 0.0275;
export const PAYMOB_FLAT_PIASTRES = 300;

/** Paymob fee on a gross (VAT-inclusive) charge. */
export function paymobFee(grossP: Piastres): Piastres {
  return Math.round(grossP * PAYMOB_PERCENT) + PAYMOB_FLAT_PIASTRES;
}

/**
 * Fawry / cash-on-delivery costs MORE: the standard Paymob rate applies, and
 * Fawry adds its own collection fee on top — historically 2.5–3% plus fixed
 * amounts that vary by ticket size. We model the TOP of that range because
 * the exact schedule is unconfirmed and understating a fee overstates margin.
 *
 * [NEEDS-OWNER] Fawry's actual collection schedule, and the fixed component by
 * ticket size. Also note settlement differs: cards/wallets clear T+1..T+3,
 * Fawry and COD usually weekly — a cash-flow consideration, not a margin one.
 */
export const FAWRY_EXTRA_PERCENT = 0.03;

export function fawryFee(grossP: Piastres): Piastres {
  return paymobFee(grossP) + Math.round(grossP * FAWRY_EXTRA_PERCENT);
}

export type PayMethod = 'card' | 'wallet' | 'fawry';

/** Fee for the method actually used. Cards and wallets price identically. */
export function processorFee(grossP: Piastres, method: PayMethod = 'card'): Piastres {
  return method === 'fawry' ? fawryFee(grossP) : paymobFee(grossP);
}

/** Stripe/Paddle on a USD charge: 2.9% + $0.30, returned in USD. */
export function stripeFeeUsd(priceUsd: number): number {
  return priceUsd * 0.029 + 0.3;
}

/**
 * Meta WhatsApp Business API — per-CONVERSATION cost in USD, Egypt rates
 * (owner-sourced 2026-07-20).
 *
 * The category is decided by the FIRST message and changes the price several
 * times over, so a single blended "whatsapp cost" constant — which is what
 * autoleadss shipped — cannot be right for every flow.
 *
 * TWO 2026 POLICY CHANGES THAT MATTER:
 *  1. The free 24-hour service window is going away, so replies that used to
 *     cost nothing become billable. Any model assuming free service replies
 *     is now optimistic.
 *  2. AI-powered messages (Meta Business Agent) bill on TOKEN usage
 *     (~$2.00/M tokens) instead of a flat conversation fee — a different cost
 *     model entirely from the one below.
 *
 * [NEEDS-OWNER] BSP markup. You cannot buy the API from Meta directly; a
 * Business Solution Provider (Quali-D, Twilio, 360dialog…) resells it and
 * adds per-message or monthly fees ON TOP of these rates. Until we pick a BSP
 * and record its markup, every WhatsApp margin below is a FLOOR on cost, not
 * the real cost.
 */
export const WHATSAPP_EGYPT_USD = {
  /** Promotional campaigns, announcements, Click-to-WhatsApp follow-ups. */
  marketing: 0.065,
  /** [NEEDS-VERIFY] Transactional updates. Sourced as "lower than marketing"
   * without a figure — placeholder pending the real rate card. */
  utility: 0.04,
  /** [NEEDS-VERIFY] OTPs and verification. Same caveat. */
  authentication: 0.04,
  /** [NEEDS-VERIFY] Customer-initiated. Historically free in the 24h window,
   * but that free tier is being withdrawn in 2026. */
  service: 0.04,
} as const;

export type WhatsAppCategory = keyof typeof WHATSAPP_EGYPT_USD;
