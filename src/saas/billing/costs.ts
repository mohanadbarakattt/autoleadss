/**
 * Cost basis for the WhatsApp-AI / AI-action caps and the margin-guard CI
 * check (scripts/margin-guard.ts).
 *
 * Money maths now comes from the shared @mbai/money package, vendored at
 * src/saas/lib/money — see mbai-ecosystem/packages/money. Do NOT reintroduce
 * FX, VAT or processor-fee literals here; a drift check enforces the copy.
 *
 * WHAT CHANGED 2026-07-20, and why the old numbers flattered every margin:
 *   - FX was 49 against an owner-confirmed 55 (costs understated ~12%).
 *   - AI_ACTION_COST_USD was 0.00004, set for the retired Gemma model.
 *     Production ledger rows show a real mbai-franco call now costs
 *     174 µUSD — 4.3× more — because Gemini is dearer AND the Franco prompt
 *     pack adds ~1,700 prompt tokens to every single call.
 *   - Paymob was modelled as 2.75% + 1 EGP; the real rate is 2.75% + 3 EGP.
 *   - VAT was ignored entirely. Prices are VAT-INCLUSIVE, so 14% of every
 *     headline price is remitted and was never ours. This was the single
 *     biggest correction.
 */
export {
  usdToEgpRate,
  DEFAULT_USD_TO_EGP,
  paymobFee,
  fawryFee,
  processorFee,
  stripeFeeUsd,
  WHATSAPP_EGYPT_USD,
} from '../lib/money/index.js'

/**
 * WhatsApp cost per AI-answered conversation, USD.
 *
 * Owner confirmed 2026-07-20 that these are CUSTOMER-INITIATED SERVICE
 * replies, which is the cheapest category — historically free inside the
 * 24-hour window. We deliberately do NOT model them as free:
 *
 *   1. Meta is withdrawing the free 24h service window during 2026, so these
 *      become billable. Modelling zero would make every margin collapse the
 *      day that lands.
 *   2. AI-answered messages may fall under Meta Business Agent pricing, which
 *      bills on TOKENS (~$2.00/M) rather than per conversation — a different
 *      cost shape entirely, and this feature is exactly that shape.
 *   3. [NEEDS-OWNER] BSP markup. Meta does not sell the API direct; a
 *      provider (Quali-D / Twilio / 360dialog) resells it with its own fees
 *      on top. Until one is chosen this number is a FLOOR on cost.
 *
 * So: the service-category rate, held as a deliberate over-estimate rather
 * than an optimistic zero.
 */
export const WHATSAPP_COST_USD = 0.04

/**
 * Cost per AI action, USD. MEASURED from a production usage_ledger row for
 * mbai-franco on gemini-3.1-flash-lite including the Franco prompt pack —
 * not estimated from a token guess.
 */
export const AI_ACTION_COST_USD = 0.000174
