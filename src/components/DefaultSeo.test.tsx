import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import DefaultSeo from './DefaultSeo'

/**
 * Regression tests for the duplicate-<head>-tag defect.
 *
 * react-helmet-async only reconciles tags carrying `data-rh`, so index.html's
 * unmarked static SEO tags used to survive forever and every route-level
 * <Helmet> appended a SECOND tag beside them. Crawlers read the first match in
 * document order — the stale marketing default — so per-route SEO silently did
 * nothing while looking right in devtools.
 *
 * These tests assert tag COUNTS, not just presence: presence-only assertions
 * pass happily while a duplicate sits in front of the tag being asserted, which
 * is exactly how the bug survived unnoticed.
 */

/** Reproduces index.html's static, `data-rh`-marked defaults. */
function seedStaticIndexHtmlTags() {
  document.head.innerHTML = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" data-rh="true" content="We build and run complete sales systems for UAE & Egypt: sales funnels, landing pages, Google Ads, social media, AI chatbots, and SEO/GEO.">
    <meta name="keywords" content="lead generation UAE">
    <meta property="og:title" data-rh="true" content="AutoLeadss — Growth & Sales Systems for UAE & Egypt">
    <meta property="og:image" data-rh="true" content="https://autoleadss.com/og-image.png">
  `
}

const count = (sel: string) => document.head.querySelectorAll(sel).length
const content = (sel: string) => document.head.querySelector(sel)?.getAttribute('content') ?? null

beforeEach(seedStaticIndexHtmlTags)
afterEach(() => {
  document.head.innerHTML = ''
})

describe('DefaultSeo + index.html tag ownership', () => {
  it('adopts the static tags instead of duplicating them', async () => {
    render(
      <HelmetProvider>
        <DefaultSeo />
      </HelmetProvider>,
    )
    await waitFor(() => expect(count('meta[name="description"]')).toBe(1))
    expect(count('meta[property="og:title"]')).toBe(1)
    expect(count('meta[property="og:image"]')).toBe(1)
  })

  it('leaves exactly ONE description when a route overrides it, and it is the route value', async () => {
    render(
      <HelmetProvider>
        <DefaultSeo />
        <Helmet defer={false}>
          <meta name="description" content="A merchant storefront description" />
        </Helmet>
      </HelmetProvider>,
    )
    await waitFor(() => expect(content('meta[name="description"]')).toBe('A merchant storefront description'))
    // The heart of the bug: the stale default must be GONE, not merely outranked.
    expect(count('meta[name="description"]')).toBe(1)
  })

  it('overrides og tags singly too', async () => {
    render(
      <HelmetProvider>
        <DefaultSeo />
        <Helmet defer={false}>
          <meta property="og:title" content="Merchant store" />
          <meta property="og:image" content="https://cdn.example.com/product.jpg" />
        </Helmet>
      </HelmetProvider>,
    )
    await waitFor(() => expect(content('meta[property="og:title"]')).toBe('Merchant store'))
    expect(count('meta[property="og:title"]')).toBe(1)
    expect(count('meta[property="og:image"]')).toBe(1)
    expect(content('meta[property="og:image"]')).toBe('https://cdn.example.com/product.jpg')
  })

  it('keeps a description on routes that set none — the marked defaults are re-asserted, not deleted', async () => {
    render(
      <HelmetProvider>
        <DefaultSeo />
        <Helmet defer={false}>
          <meta name="robots" content="noindex" />
        </Helmet>
      </HelmetProvider>,
    )
    await waitFor(() => expect(count('meta[name="robots"]')).toBe(1))
    expect(count('meta[name="description"]')).toBe(1)
    expect(content('meta[name="description"]')).toContain('complete sales systems')
  })

  it('never touches unmarked tags that nothing re-asserts', async () => {
    render(
      <HelmetProvider>
        <DefaultSeo />
      </HelmetProvider>,
    )
    await waitFor(() => expect(count('meta[name="description"]')).toBe(1))
    // Marking these would have Helmet delete them on first render.
    expect(count('meta[name="viewport"]')).toBe(1)
    expect(count('meta[charset]')).toBe(1)
    expect(count('meta[name="keywords"]')).toBe(1)
  })
})
