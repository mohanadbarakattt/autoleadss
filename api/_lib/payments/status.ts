import type { PaymentStatus } from './types'

/**
 * The payment status state machine, as an explicit allowed-transitions map.
 *
 * DO NOT "simplify" THIS BACK INTO A RANK COMPARISON. It was one, once:
 * `RANK = { pending:0, paid:1, failed:1, expired:1, refunded:2 }` with
 * `canTransition = RANK[to] > RANK[from]`. It is shorter, it reads as
 * obviously-correct, and it is wrong: because `refunded` outranks everything,
 * it makes `pending -> refunded`, `failed -> refunded` and `expired -> refunded`
 * all legal. That is refunding money that was never charged. Only a payment
 * that actually reached `paid` can be refunded, which a rank cannot express —
 * the legal moves are a graph, not a ladder.
 *
 * The bug survived its own test suite, which is the other half of the lesson:
 * the original status test re-derived the SAME rank table and asserted the
 * implementation against it, so it passed with the bug fully intact. The test
 * below is a hand-written literal matrix for exactly that reason — if the map
 * changes, the matrix must be edited by hand, deliberately. Never generate the
 * expectation from the thing under test.
 *
 * pending is the only non-terminal state; paid can only move to refunded;
 * failed, expired and refunded are terminal — including to themselves, so a
 * same-status replay is never an allowed write here (the webhook route's
 * ledger dedup is what makes literal event replays idempotent).
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
