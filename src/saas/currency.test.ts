import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  convertUsdToCurrency,
  currencyForCountry,
  detectCurrency,
  formatCurrencyAmount,
  getStoredCurrency,
  resolveCurrency,
  resolveCurrencyForRegion,
  setStoredCurrency,
  SUPPORTED_CURRENCIES,
} from './currency'

describe('currencyForCountry', () => {
  it('maps the supported Gulf/Egypt countries', () => {
    expect(currencyForCountry('EG')).toBe('EGP')
    expect(currencyForCountry('AE')).toBe('AED')
    expect(currencyForCountry('SA')).toBe('SAR')
  })

  it('is case-insensitive', () => {
    expect(currencyForCountry('eg')).toBe('EGP')
  })

  it('falls back to USD for any unmapped country', () => {
    expect(currencyForCountry('US')).toBe('USD')
    expect(currencyForCountry('FR')).toBe('USD')
    expect(currencyForCountry('XX')).toBe('USD')
  })
})

describe('convertUsdToCurrency', () => {
  it('converts at the exact AED peg (3.6725), rounded to a whole unit', () => {
    // Hand-computed: 59 * 3.6725 = 216.6775 -> 217
    expect(convertUsdToCurrency(59, 'AED')).toBe(217)
    // 149 * 3.6725 = 547.2025 -> 547
    expect(convertUsdToCurrency(149, 'AED')).toBe(547)
    // 1500 * 3.6725 = 5508.75 -> 5509
    expect(convertUsdToCurrency(1500, 'AED')).toBe(5509)
  })

  it('converts at the exact SAR peg (3.75), rounded to a whole unit', () => {
    // Hand-computed: 59 * 3.75 = 221.25 -> 221
    expect(convertUsdToCurrency(59, 'SAR')).toBe(221)
    // 12 * 3.75 = 45 exactly
    expect(convertUsdToCurrency(12, 'SAR')).toBe(45)
    // 6000 * 3.75 = 22500 exactly
    expect(convertUsdToCurrency(6000, 'SAR')).toBe(22500)
  })

  it('passes USD through unchanged (no peg entry)', () => {
    expect(convertUsdToCurrency(59, 'USD')).toBe(59)
  })

  it('NEVER derives EGP — throws rather than silently converting', () => {
    expect(() => convertUsdToCurrency(59, 'EGP')).toThrow(/never be derived/i)
  })
})

describe('formatCurrencyAmount', () => {
  it('formats USD/AED/SAR in EN with Western digits and the ISO code', () => {
    expect(formatCurrencyAmount(59, 'USD', 'en')).toBe('$59')
    expect(formatCurrencyAmount(217, 'AED', 'en')).toBe('AED 217')
    expect(formatCurrencyAmount(221, 'SAR', 'en')).toBe('SAR 221')
  })

  it('formats in AR with Western digits, the Arabic currency name, and RTL bidi marks', () => {
    // Intl embeds RLM (U+200F) marks around ar-EG currency output — asserting
    // the exact string (not just a substring) proves both the digits AND the
    // bidi-safety are correct, not just the currency abbreviation.
    expect(formatCurrencyAmount(59, 'USD', 'ar')).toBe('‏59 US$')
    expect(formatCurrencyAmount(217, 'AED', 'ar')).toBe('‏217 د.إ.‏')
    expect(formatCurrencyAmount(221, 'SAR', 'ar')).toBe('‏221 ر.س.‏')
  })
})

describe('detectCurrency', () => {
  const originalDateTimeFormat = Intl.DateTimeFormat

  afterEach(() => {
    Intl.DateTimeFormat = originalDateTimeFormat
  })

  function mockTimeZone(timeZone: string) {
    // @ts-expect-error - test double, only resolvedOptions().timeZone is read
    Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone }) })
  }

  it('detects EGP for Cairo, AED for Dubai, SAR for Riyadh', () => {
    mockTimeZone('Africa/Cairo')
    expect(detectCurrency()).toBe('EGP')
    mockTimeZone('Asia/Dubai')
    expect(detectCurrency()).toBe('AED')
    mockTimeZone('Asia/Riyadh')
    expect(detectCurrency()).toBe('SAR')
  })

  it('falls back to USD for an unmapped timezone', () => {
    mockTimeZone('America/New_York')
    expect(detectCurrency()).toBe('USD')
  })

  it('falls back to USD, without crashing, if Intl throws', () => {
    // @ts-expect-error - test double: simulate a broken/old environment
    Intl.DateTimeFormat = () => {
      throw new Error('Intl not implemented')
    }
    expect(detectCurrency()).toBe('USD')
  })
})

describe('stored currency override + resolution', () => {
  const originalDateTimeFormat = Intl.DateTimeFormat

  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
    Intl.DateTimeFormat = originalDateTimeFormat
  })

  it('getStoredCurrency is null until a choice is made', () => {
    expect(getStoredCurrency()).toBeNull()
  })

  it('setStoredCurrency persists a supported currency', () => {
    setStoredCurrency('AED')
    expect(getStoredCurrency()).toBe('AED')
  })

  it('ignores a corrupted/unsupported stored value', () => {
    window.localStorage.setItem('autoleadss:currency:v1', 'not-a-currency')
    expect(getStoredCurrency()).toBeNull()
  })

  it('the manual override ALWAYS wins over detection', () => {
    // @ts-expect-error - test double: detection would say AED (Dubai)
    Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone: 'Asia/Dubai' }) })
    expect(detectCurrency()).toBe('AED') // sanity: detection alone would pick AED
    setStoredCurrency('SAR')
    expect(resolveCurrency()).toBe('SAR') // but the explicit choice wins
  })

  it('resolveCurrency falls back to detection with no override', () => {
    // @ts-expect-error - test double
    Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone: 'Africa/Cairo' }) })
    expect(resolveCurrency()).toBe('EGP')
  })

  it('resolveCurrencyForRegion prefers a stored override over the region hint', () => {
    setStoredCurrency('USD')
    expect(resolveCurrencyForRegion('egypt')).toBe('USD')
  })

  it('resolveCurrencyForRegion falls back to the egypt region hint over detection', () => {
    // @ts-expect-error - test double: detection alone would say AED
    Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone: 'Asia/Dubai' }) })
    expect(resolveCurrencyForRegion('egypt')).toBe('EGP')
  })

  it('resolveCurrencyForRegion falls back to detection for a gulf region hint', () => {
    // @ts-expect-error - test double
    Intl.DateTimeFormat = () => ({ resolvedOptions: () => ({ timeZone: 'Asia/Riyadh' }) })
    expect(resolveCurrencyForRegion('gulf')).toBe('SAR')
  })
})

describe('SUPPORTED_CURRENCIES', () => {
  it('is exactly USD/AED/SAR/EGP', () => {
    expect([...SUPPORTED_CURRENCIES].sort()).toEqual(['AED', 'EGP', 'SAR', 'USD'])
  })
})
