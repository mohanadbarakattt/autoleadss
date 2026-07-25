import { describe, expect, it } from 'vitest'
import { toSafeInt } from './money'

describe('toSafeInt', () => {
  it('coerces a bigint-over-the-wire string (the real Neon driver behavior) to a number', () => {
    expect(toSafeInt('5000', 'amount_minor')).toBe(5000)
  })

  it('passes through a real number unchanged', () => {
    expect(toSafeInt(5000, 'amount_minor')).toBe(5000)
  })

  it('throws on a non-integer string', () => {
    expect(() => toSafeInt('5000.5', 'amount_minor')).toThrow()
  })

  it('throws on a non-numeric string', () => {
    expect(() => toSafeInt('not-a-number', 'amount_minor')).toThrow()
  })

  it('throws on a value beyond Number.MAX_SAFE_INTEGER', () => {
    expect(() => toSafeInt('99999999999999999999', 'amount_minor')).toThrow()
  })

  it('throws on NaN', () => {
    expect(() => toSafeInt(NaN, 'amount_minor')).toThrow()
  })
})
