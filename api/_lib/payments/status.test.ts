import { describe, expect, it } from 'vitest'
import { canTransition } from './status'
import type { PaymentStatus } from './types'

const STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded', 'expired']

// Hand-written truth table — deliberately NOT derived from the same formula
// the implementation uses (a rank-comparison table would pass even if
// status.ts regressed to ranking refunded above every other status, which is
// exactly the bug this replaces: pending/failed/expired -> refunded must be
// false, only paid -> refunded is a real refund).
const TABLE: Record<PaymentStatus, Record<PaymentStatus, boolean>> = {
  pending: { pending: false, paid: true, failed: true, refunded: false, expired: true },
  paid: { pending: false, paid: false, failed: false, refunded: true, expired: false },
  failed: { pending: false, paid: false, failed: false, refunded: false, expired: false },
  refunded: { pending: false, paid: false, failed: false, refunded: false, expired: false },
  expired: { pending: false, paid: false, failed: false, refunded: false, expired: false },
}

describe('canTransition — hand-written truth table (all 25 pairs)', () => {
  for (const from of STATUSES) {
    for (const to of STATUSES) {
      it(`${from} -> ${to} is ${TABLE[from][to]}`, () => {
        expect(canTransition(from, to)).toBe(TABLE[from][to])
      })
    }
  }
})

describe('canTransition — named invariants', () => {
  it('pending -> refunded is false — you cannot refund money that was never paid', () => {
    expect(canTransition('pending', 'refunded')).toBe(false)
  })

  it('failed -> refunded is false', () => {
    expect(canTransition('failed', 'refunded')).toBe(false)
  })

  it('expired -> refunded is false', () => {
    expect(canTransition('expired', 'refunded')).toBe(false)
  })

  it('refunded -> paid is false (a refund can never un-refund into paid)', () => {
    expect(canTransition('refunded', 'paid')).toBe(false)
  })

  it('paid -> pending is false (out-of-order pending must never revert paid)', () => {
    expect(canTransition('paid', 'pending')).toBe(false)
  })

  it('pending -> paid is true (the normal happy path)', () => {
    expect(canTransition('pending', 'paid')).toBe(true)
  })

  it('paid -> refunded is true (the only legal refund transition)', () => {
    expect(canTransition('paid', 'refunded')).toBe(true)
  })

  it('paid -> paid is false — an already-applied status is not re-appliable here (the ledger handles literal replays)', () => {
    expect(canTransition('paid', 'paid')).toBe(false)
  })
})

/**
 * An invariant the webhook's OLD write ordering silently depended on, and which
 * nobody had written down.
 *
 * Under that ordering a concurrent delivery that lost the row lock still
 * committed its idempotency-ledger row while applying no effect; its later
 * redelivery then short-circuited on `on conflict do nothing` as "already
 * handled". That only loses money if the loser's transition would STILL be
 * legal after the winner's — and with this table it never is, because the
 * statuses reachable from `pending` ({paid,failed,expired}) and those reachable
 * from `paid` ({refunded}) do not intersect.
 *
 * The webhook no longer relies on this (a loser now writes nothing at all), but
 * the property is worth pinning: if someone later adds, say, `failed -> paid`
 * for a retry flow, this test explains what else has to hold and why it mattered.
 */
describe('no transition is legal both before AND after another transition', () => {
  it('holds for every from/winner/loser triple', () => {
    const statuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'expired', 'refunded']
    const offenders: string[] = []
    for (const from of statuses) {
      for (const winner of statuses) {
        if (!canTransition(from, winner)) continue
        for (const loser of statuses) {
          // The loser passed the read-only phase (legal from `from`) — is it
          // still legal once the winner has moved the row to `winner`?
          if (canTransition(from, loser) && canTransition(winner, loser)) {
            offenders.push(`${from} -> winner ${winner}, loser ${loser} still legal`)
          }
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
