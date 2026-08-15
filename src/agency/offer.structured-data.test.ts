import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PACKAGE_USD, PACKAGE_AD_SPEND_USD } from './offer'

/**
 * index.html is static HTML and cannot import from TypeScript, so the package
 * price is physically duplicated into its JSON-LD and its meta description.
 * That duplication is the bug waiting to happen: someone changes the price in
 * offer.ts, every rendered surface updates, and the <head> quietly keeps
 * advertising the old number to Google and to every social unfurler.
 *
 * Structured data that contradicts the visible price is not merely untidy —
 * it is a Google spam-policy issue and it misleads a buyer before they ever
 * reach the page. So the duplication is allowed, but it is pinned here.
 *
 * This test fails loudly if index.html and offer.ts ever disagree.
 */

const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')

/** Pull every JSON-LD block out of index.html and parse it. */
function jsonLdBlocks(): Record<string, unknown>[] {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  return blocks.map((m) => JSON.parse(m[1]) as Record<string, unknown>)
}

describe('index.html <head> agrees with src/agency/offer.ts', () => {
  it('parses every JSON-LD block as valid JSON', () => {
    // A trailing comma or stray character silently voids the whole block for
    // Google — it is never reported, it just stops working.
    expect(() => jsonLdBlocks()).not.toThrow()
    expect(jsonLdBlocks().length).toBeGreaterThan(0)
  })

  it('quotes the package price that offer.ts defines', () => {
    const service = jsonLdBlocks().find((b) => b['@type'] === 'ProfessionalService')
    expect(service, 'no ProfessionalService JSON-LD block found').toBeTruthy()

    const offer = service!.makesOffer as { price?: string; priceCurrency?: string } | undefined
    expect(offer, 'ProfessionalService has no makesOffer').toBeTruthy()
    expect(offer!.price).toBe(String(PACKAGE_USD))
    expect(offer!.priceCurrency).toBe('USD')
  })

  it('states the included ad spend in the offer description', () => {
    const service = jsonLdBlocks().find((b) => b['@type'] === 'ProfessionalService')
    const offer = service!.makesOffer as { description?: string }
    // Whether media budget is included is the most disputed line in agency
    // pricing — it must survive in the machine-readable copy too.
    expect(offer.description).toContain(String(PACKAGE_AD_SPEND_USD))
  })

  it('quotes the same price in the meta description crawlers read', () => {
    const meta = html.match(/<meta name="description"[^>]*content="([^"]*)"/)
    expect(meta, 'no meta description found').toBeTruthy()
    // Formatted with a thousands separator in prose ("$1,500"), so compare
    // against the localised form rather than the bare integer.
    const formatted = PACKAGE_USD.toLocaleString('en-US')
    expect(meta![1]).toContain(formatted)
    expect(meta![1]).toContain(PACKAGE_AD_SPEND_USD.toLocaleString('en-US'))
  })

  it('does not ship a keywords meta tag', () => {
    // Google has ignored it since 2009 and says so in its SEO Starter Guide.
    // It only leaked our target-keyword list. Removed 2026-08-15; this keeps
    // it removed.
    expect(html).not.toMatch(/<meta\s+name="keywords"/i)
  })
})
