import { describe, expect, it } from 'vitest'
import { priceForCurrency, TIERS, TOPUP_PACKS } from './pricing'

// Intl.NumberFormat puts a NON-BREAKING space (U+00A0) between an ISO
// currency code and its amount in 'en-US' — not a plain space — so these
// expectations spell it out explicitly rather than relying on an invisible
// character typed into the source.
const NBSP = ' '

describe('priceForCurrency', () => {
  it('NEVER derives EGP — returns the hand-written priceEgypt value verbatim, for every tier', () => {
    for (const tier of TIERS) {
      expect(priceForCurrency(tier, 'EGP')).toBe(tier.priceEgypt)
    }
  })

  it('NEVER derives EGP for top-up packs either', () => {
    for (const pack of TOPUP_PACKS) {
      expect(priceForCurrency(pack, 'EGP')).toBe(pack.priceEgypt)
    }
  })

  it('shows priceGulf verbatim for USD, unchanged from today', () => {
    const starter = TIERS.find((t) => t.id === 'starter')!
    expect(priceForCurrency(starter, 'USD')).toBe('$59')
  })

  it('converts AED at the peg for a fixed-price tier', () => {
    const starter = TIERS.find((t) => t.id === 'starter')!
    // 59 * 3.6725 = 216.6775 -> AED 217
    expect(priceForCurrency(starter, 'AED')).toBe(`AED${NBSP}217`)
  })

  it('converts SAR at the peg for a fixed-price tier', () => {
    const starter = TIERS.find((t) => t.id === 'starter')!
    // 59 * 3.75 = 221.25 -> SAR 221
    expect(priceForCurrency(starter, 'SAR')).toBe(`SAR${NBSP}221`)
  })

  it('preserves the "from " prefix on contact-us tiers when converting', () => {
    const dwy = TIERS.find((t) => t.id === 'dwy')!
    expect(dwy.priceGulf).toBe('from $1,500')
    // 1500 * 3.6725 = 5508.75 -> AED 5,509
    expect(priceForCurrency(dwy, 'AED')).toBe(`from AED${NBSP}5,509`)
  })

  it('converts top-up packs the same way as tiers', () => {
    const small = TOPUP_PACKS.find((p) => p.id === 'small')!
    expect(small.priceGulf).toBe('$12')
    // 12 * 3.6725 = 44.07 -> AED 44
    expect(priceForCurrency(small, 'AED')).toBe(`AED${NBSP}44`)
    // 12 * 3.75 = 45 exactly
    expect(priceForCurrency(small, 'SAR')).toBe(`SAR${NBSP}45`)
  })
})
