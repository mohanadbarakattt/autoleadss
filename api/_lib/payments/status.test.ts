import { describe, expect, it } from 'vitest'
import { canTransition } from './status'
import type { PaymentStatus } from './types'

const STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded', 'expired']

// Rank: pending(0) < paid(1) | failed(1) | expired(1) < refunded(2). Only
// forward moves (strictly higher rank) or identical->identical are legal.
const RANK: Record<PaymentStatus, number> = { pending: 0, paid: 1, failed: 1, expired: 1, refunded: 2 }

describe('canTransition — every from/to pair', () => {
  for (const from of STATUSES) {
    for (const to of STATUSES) {
      const expected = from === to || RANK[to] > RANK[from]
      it(`${from} -> ${to} is ${expected}`, () => {
        expect(canTransition(from, to)).toBe(expected)
      })
    }
  }
})

describe('canTransition — named invariants', () => {
  it('refunded -> paid is false (a refund can never un-refund into paid)', () => {
    expect(canTransition('refunded', 'paid')).toBe(false)
  })

  it('paid -> pending is false (out-of-order pending must never revert paid)', () => {
    expect(canTransition('paid', 'pending')).toBe(false)
  })

  it('pending -> paid is true (the normal happy path)', () => {
    expect(canTransition('pending', 'paid')).toBe(true)
  })

  it('paid -> refunded is true', () => {
    expect(canTransition('paid', 'refunded')).toBe(true)
  })

  it('paid -> paid is true (identical is a no-op, not illegal)', () => {
    expect(canTransition('paid', 'paid')).toBe(true)
  })
})
