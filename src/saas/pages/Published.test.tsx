import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Published from './Published'
import { LocaleProvider } from '../i18n'
import { createFunnel, publishFunnel, createProduct } from '../store'
import { createStorefrontSite } from '../storefront/createStore'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderPublished(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/p/${slug}`]}>
        <LocaleProvider>
          <Routes>
            <Route path="/p/:slug" element={<Published />} />
          </Routes>
        </LocaleProvider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

function metaContent(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null
}

function makePublishedCaptureFunnel(id: string): Funnel {
  const spec = generateFromTemplate({ industry: 'services', businessName: 'Acme Services', language: 'en', region: 'gulf', goal: 'leads', tone: 'bold', accent: '#FF5C2A' })
  const funnel: Funnel = {
    id,
    name: 'Acme Services',
    slug: `acme-${id}`,
    industry: 'services',
    language: 'en',
    status: 'draft',
    accent: '#FF5C2A',
    spec,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    visits: 0,
    leads: [],
  }
  createFunnel(funnel)
  publishFunnel(id)
  return funnel
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Published — SEO, capture mode', () => {
  it('real title, description, and canonical derived from the funnel’s own data', async () => {
    const funnel = makePublishedCaptureFunnel('pub_capture_1')
    renderPublished(funnel.slug)

    await waitFor(() => expect(document.title).toContain('Acme Services'))
    expect(metaContent('meta[name="description"]')).toBe(funnel.spec.page.hero.subhead)
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://${funnel.slug}.autoleadss.site/`)
    expect(metaContent('meta[property="og:title"]')).toContain('Acme Services')
    expect(metaContent('meta[property="og:description"]')).toBe(funnel.spec.page.hero.subhead)
  })

  it('never fabricates an og:image — capture mode has no real image source, so the tag is omitted', async () => {
    const funnel = makePublishedCaptureFunnel('pub_capture_2')
    renderPublished(funnel.slug)
    await waitFor(() => expect(document.title).toContain('Acme Services'))
    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull()
  })

  it('does not noindex a real published page', async () => {
    const funnel = makePublishedCaptureFunnel('pub_capture_3')
    renderPublished(funnel.slug)
    await waitFor(() => expect(document.title).toContain('Acme Services'))
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })
})

describe('Published — SEO, sell mode', () => {
  it('omits og:image when no product has a real photo', async () => {
    const site = createStorefrontSite('Maison Noor', 'en')
    renderPublished(site.slug)
    await waitFor(() => expect(document.title).toContain('Maison Noor'))
    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull()
  })

  it('uses a real product photo as og:image when one exists — never an invented image', async () => {
    const site = createStorefrontSite('Maison Noor Two', 'en')
    const now = Date.now()
    createProduct({
      id: 'prod_seo_1',
      name: 'Oud Leather Tote',
      description: 'Full-grain leather',
      imageUrl: 'https://example.com/real-photo.jpg',
      priceMinor: 240050,
      currency: 'AED',
      stock: 4,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    renderPublished(site.slug)
    await waitFor(() => expect(document.title).toContain('Maison Noor Two'))
    expect(metaContent('meta[property="og:image"]')).toBe('https://example.com/real-photo.jpg')
  })
})

describe('Published — noindex for anything not published', () => {
  it('noindexes the "not published here" fallback', async () => {
    renderPublished('no-such-slug-at-all')
    await waitFor(() => expect(screen.getByText(/isn.t published here yet/i)).toBeInTheDocument())
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
  })
})
