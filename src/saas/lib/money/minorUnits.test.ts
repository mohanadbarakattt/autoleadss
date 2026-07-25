import { describe, expect, it } from 'vitest'
import { majorToMinor, formatMinorUnits } from './minorUnits'

describe('majorToMinor', () => {
  it('is exact for classic float-drift decimals', () => {
    // 0.1 * 100 === 10.000000000000002 and 0.7 * 100 === 70.00000000000001 in
    // IEEE754 — this must land on the exact integer, not the drifted float.
    expect(majorToMinor('0.1')).toBe(10)
    expect(majorToMinor('0.7')).toBe(70)
  })

  it('is exact for realistic prices', () => {
    expect(majorToMinor('2400.50')).toBe(240050)
    expect(majorToMinor('19.99')).toBe(1999)
    expect(majorToMinor('100')).toBe(10000)
  })

  it('accepts a plain number input the same way as its string form', () => {
    expect(majorToMinor(19.99)).toBe(1999)
  })

  it('rejects more than 2 decimal places', () => {
    expect(() => majorToMinor('1.234')).toThrow()
    expect(() => majorToMinor('19.999')).toThrow()
  })

  it('rejects negative amounts', () => {
    expect(() => majorToMinor('-5')).toThrow()
    expect(() => majorToMinor(-19.99)).toThrow()
  })

  it('rejects zero', () => {
    expect(() => majorToMinor('0')).toThrow()
    expect(() => majorToMinor('0.00')).toThrow()
  })

  it('rejects NaN', () => {
    expect(() => majorToMinor(NaN)).toThrow()
  })

  it('rejects non-numeric strings', () => {
    expect(() => majorToMinor('abc')).toThrow()
    expect(() => majorToMinor('')).toThrow()
    expect(() => majorToMinor('12.5.5')).toThrow()
    expect(() => majorToMinor('1e3')).toThrow()
  })
})

describe('formatMinorUnits', () => {
  it('drops the decimals on a whole amount', () => {
    expect(formatMinorUnits(240000, 'AED')).toBe('AED 2,400')
  })

  it('keeps 2 decimals on a fractional amount', () => {
    expect(formatMinorUnits(240050, 'AED')).toBe('AED 2,400.50')
  })

  it('groups thousands', () => {
    expect(formatMinorUnits(1000000, 'USD')).toBe('USD 10,000')
  })
})
