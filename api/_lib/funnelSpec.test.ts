import { describe, expect, it } from 'vitest'
import { sanitizeFunnelSpec } from './funnelSpec'
import type { Funnel } from '../../src/saas/types'

function baseSpec(over: Partial<Funnel['spec']> = {}): Funnel['spec'] {
  return {
    industry: 'services',
    language: 'en',
    businessName: 'Acme Co',
    page: {
      hero: { eyebrow: '', headline: '', subhead: '', ctaPrimary: '', ctaSecondary: '', badges: [] },
      stats: [],
      features: [],
      testimonials: [],
      faq: [],
      finalCta: { headline: '', sub: '', cta: '' },
      leadForm: { title: '', fields: [], button: '' },
    },
    ads: [],
    chatbot: { greeting: '', qualifyingQuestions: [], flow: [], bookingMessage: '' },
    social: [],
    ...over,
  }
}

describe('sanitizeFunnelSpec — thank-you ctaHref (SEC1)', () => {
  it('strips a javascript: ctaHref', () => {
    const spec = baseSpec({ page: { ...baseSpec().page, thankYou: { headline: 'Thanks', body: 'Body', ctaHref: 'javascript:alert(1)' } } })
    const out = sanitizeFunnelSpec(spec)
    expect(out.page.thankYou?.ctaHref).toBeUndefined()
  })

  it('strips a data: ctaHref', () => {
    const spec = baseSpec({ page: { ...baseSpec().page, thankYou: { headline: 'Thanks', body: 'Body', ctaHref: 'data:text/html,<script>alert(1)</script>' } } })
    expect(sanitizeFunnelSpec(spec).page.thankYou?.ctaHref).toBeUndefined()
  })

  it('strips a protocol-relative ctaHref', () => {
    const spec = baseSpec({ page: { ...baseSpec().page, thankYou: { headline: 'Thanks', body: 'Body', ctaHref: '//evil.com/payload' } } })
    expect(sanitizeFunnelSpec(spec).page.thankYou?.ctaHref).toBeUndefined()
  })

  it('keeps a valid https ctaHref, and keeps the rest of thankYou intact', () => {
    const spec = baseSpec({ page: { ...baseSpec().page, thankYou: { headline: 'Thanks', body: 'Body', ctaLabel: 'Next', ctaHref: 'https://example.com/book' } } })
    const out = sanitizeFunnelSpec(spec)
    expect(out.page.thankYou).toEqual({ headline: 'Thanks', body: 'Body', ctaLabel: 'Next', ctaHref: 'https://example.com/book' })
  })

  it('is a no-op when there is no thankYou at all', () => {
    const spec = baseSpec()
    expect(sanitizeFunnelSpec(spec)).toEqual(spec)
  })

  it('is a no-op when thankYou has no ctaHref', () => {
    const spec = baseSpec({ page: { ...baseSpec().page, thankYou: { headline: 'Thanks', body: 'Body' } } })
    expect(sanitizeFunnelSpec(spec).page.thankYou?.ctaHref).toBeUndefined()
  })
})

describe('sanitizeFunnelSpec — tracking ids (pre-existing behavior, unchanged)', () => {
  it('strips an invalid ga4Id and metaPixelId', () => {
    const spec = baseSpec({ tracking: { ga4Id: "XSS'); //", metaPixelId: 'not-a-pixel-id' } })
    const out = sanitizeFunnelSpec(spec)
    expect(out.tracking?.ga4Id).toBeUndefined()
    expect(out.tracking?.metaPixelId).toBeUndefined()
  })

  it('keeps valid tracking ids', () => {
    const spec = baseSpec({ tracking: { ga4Id: 'G-ABC123', metaPixelId: '123456789' } })
    expect(sanitizeFunnelSpec(spec).tracking).toEqual({ ga4Id: 'G-ABC123', metaPixelId: '123456789' })
  })
})
