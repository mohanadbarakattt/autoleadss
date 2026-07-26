import { describe, expect, it } from 'vitest'
import { validateHostname } from './domains'

describe('validateHostname — happy path', () => {
  it('accepts a normal hostname and lowercases it', () => {
    const r = validateHostname('Shop.YourBrand.com')
    expect(r).toEqual({ ok: true, hostname: 'shop.yourbrand.com' })
  })

  it('trims surrounding whitespace', () => {
    expect(validateHostname('  shop.yourbrand.com  ')).toEqual({ ok: true, hostname: 'shop.yourbrand.com' })
  })

  it('accepts a hostname that merely contains the funnel root as a substring, not as a suffix', () => {
    const r = validateHostname('notautoleadss.site')
    expect(r.ok).toBe(true)
  })
})

describe('validateHostname — malformed input', () => {
  it('rejects an empty string', () => {
    expect(validateHostname('').ok).toBe(false)
  })

  it('rejects a single-label hostname (no TLD)', () => {
    expect(validateHostname('shop').ok).toBe(false)
  })

  it('rejects embedded whitespace', () => {
    expect(validateHostname('evil .com').ok).toBe(false)
  })

  it('rejects a trailing dot', () => {
    expect(validateHostname('evil.com.').ok).toBe(false)
  })

  it('rejects a scheme', () => {
    expect(validateHostname('https://evil.com').ok).toBe(false)
  })

  it('rejects a path', () => {
    expect(validateHostname('evil.com/admin').ok).toBe(false)
  })

  it('rejects a port', () => {
    expect(validateHostname('evil.com:8080').ok).toBe(false)
  })

  it('rejects a wildcard', () => {
    expect(validateHostname('*.evil.com').ok).toBe(false)
  })

  it('rejects an IPv4 literal', () => {
    expect(validateHostname('192.168.1.1').ok).toBe(false)
  })

  it('rejects an IPv6 literal', () => {
    expect(validateHostname('::1').ok).toBe(false)
    expect(validateHostname('2001:db8::1').ok).toBe(false)
  })

  it('rejects localhost', () => {
    expect(validateHostname('localhost').ok).toBe(false)
  })

  it('rejects a unicode/homograph lookalike (Cyrillic а, not Latin a)', () => {
    expect(validateHostname('аutoleadss.com').ok).toBe(false)
  })

  it('rejects a label with invalid characters', () => {
    expect(validateHostname('evil.com#.autoleadss.site').ok).toBe(false)
  })

  it('rejects a non-string input', () => {
    expect(validateHostname(undefined).ok).toBe(false)
    expect(validateHostname(42).ok).toBe(false)
  })
})

describe('validateHostname — reserved hostnames (platform hijack prevention)', () => {
  it('rejects our own apex domain', () => {
    expect(validateHostname('autoleadss.com').ok).toBe(false)
  })

  it('rejects our own apex domain uppercased', () => {
    expect(validateHostname('AUTOLEADSS.COM').ok).toBe(false)
  })

  it('rejects www of our own apex domain', () => {
    expect(validateHostname('www.autoleadss.com').ok).toBe(false)
  })

  it('rejects the funnel root itself', () => {
    expect(validateHostname('autoleadss.site').ok).toBe(false)
  })

  it("rejects ANY subdomain of the funnel root (another merchant's free subdomain)", () => {
    expect(validateHostname('sub.autoleadss.site').ok).toBe(false)
    expect(validateHostname('someone-elses-shop.autoleadss.site').ok).toBe(false)
  })

  it('rejects a subdomain of the funnel root uppercased', () => {
    expect(validateHostname('SUB.AUTOLEADSS.SITE').ok).toBe(false)
  })

  it('rejects bare vercel.app', () => {
    expect(validateHostname('vercel.app').ok).toBe(false)
  })

  it('rejects any *.vercel.app subdomain', () => {
    expect(validateHostname('my-preview.vercel.app').ok).toBe(false)
  })

  it('rejects any subdomain of our own apex domain (platform hijack via subdomain)', () => {
    expect(validateHostname('app.autoleadss.com').ok).toBe(false)
    expect(validateHostname('api.autoleadss.com').ok).toBe(false)
    expect(validateHostname('admin.autoleadss.com').ok).toBe(false)
  })

  it('rejects an apex-domain subdomain uppercased', () => {
    expect(validateHostname('API.AutoLeadss.com').ok).toBe(false)
  })

  it('rejects an apex-domain subdomain with a trailing dot', () => {
    expect(validateHostname('admin.autoleadss.com.').ok).toBe(false)
  })

  it('rejects an apex-domain subdomain padded with whitespace', () => {
    expect(validateHostname('  app.autoleadss.com  ').ok).toBe(false)
  })
})

describe('punycode / IDN homograph bypass', () => {
  it('rejects the punycode encoding of a platform-domain homograph', () => {
    // `аutoleadss.com` (Cyrillic а) is rejected as non-ASCII, but its punycode
    // encoding is pure ASCII and used to pass — and a browser renders it back
    // as `аutoleadss.com`, i.e. visually the platform's own domain.
    expect(validateHostname('xn--utoleadss-zyh.com').ok).toBe(false)
    expect(validateHostname('XN--UTOLEADSS-ZYH.COM').ok).toBe(false)
  })

  it('rejects punycode anywhere in the hostname, not just the first label', () => {
    expect(validateHostname('sub.xn--80ak6aa92e.com').ok).toBe(false)
    expect(validateHostname('xn--80ak6aa92e.example.com').ok).toBe(false)
  })

  it('still accepts ordinary ASCII hostnames', () => {
    expect(validateHostname('example.com').ok).toBe(true)
    expect(validateHostname('shop.my-brand.co.uk').ok).toBe(true)
  })
})
