import { describe, expect, it } from 'vitest'
import { frEgToAr } from './legacyFrEgRedirect'

describe('frEgToAr — dead /fr-eg/* URLs land on /ar/* instead of 404ing', () => {
  it('maps the bare /fr-eg root to /ar', () => {
    expect(frEgToAr('/fr-eg', '', '')).toBe('/ar')
  })

  it('maps /fr-eg/privacy to the equivalent /ar/privacy', () => {
    expect(frEgToAr('/fr-eg/privacy', '', '')).toBe('/ar/privacy')
  })

  it('maps /fr-eg/terms to the equivalent /ar/terms', () => {
    expect(frEgToAr('/fr-eg/terms', '', '')).toBe('/ar/terms')
  })

  it('preserves query string and hash', () => {
    expect(frEgToAr('/fr-eg', '?ref=old', '#faq')).toBe('/ar?ref=old#faq')
  })
})
