import type { PaymentStatus } from './types'

/**
 * The payment status state machine. Rank: pending(0) < paid(1) | failed(1) |
 * expired(1) < refunded(2) — only forward moves are legal, plus an
 * identical-to-identical no-op. This is what makes out-of-order webhook
 * delivery safe: a `pending` event arriving after `paid` has a lower rank than
 * the current status, so canTransition returns false and the caller must
 * treat it as a no-op instead of reverting the payment.
 */
const RANK: Record<PaymentStatus, number> = {
  pending: 0,
  paid: 1,
  failed: 1,
  expired: 1,
  refunded: 2,
}

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return true
  return RANK[to] > RANK[from]
}
