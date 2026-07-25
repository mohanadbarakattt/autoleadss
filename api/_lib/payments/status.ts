import type { PaymentStatus } from './types'

/**
 * The payment status state machine, as an explicit allowed-transitions map
 * (not a rank comparison — a rank lets any status "beneath" refunded reach
 * it, e.g. pending -> refunded or failed -> refunded, neither of which is a
 * real thing: you can only refund money that was actually paid). pending is
 * the only non-terminal state; paid can only move to refunded; failed,
 * expired, and refunded are terminal — including to themselves, so a
 * same-status replay is never treated as an allowed write here (the webhook
 * route's ledger dedup is what makes literal event replays idempotent).
 */
const ALLOWED: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['paid', 'failed', 'expired'],
  paid: ['refunded'],
  failed: [],
  expired: [],
  refunded: [],
}

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return ALLOWED[from].includes(to)
}
