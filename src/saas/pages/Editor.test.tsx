import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { EditorContent } from './Editor'
import { LocaleProvider } from '../i18n'
import { createFunnel } from '../store'
import { createStorefrontSite } from '../storefront/createStore'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderEditor(id: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/app/edit/${id}`]}>
        <LocaleProvider>
          <Routes>
            <Route path="/app/edit/:id" element={<EditorContent />} />
          </Routes>
        </LocaleProvider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

function makeCaptureFunnel(id: string): Funnel {
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
  return funnel
}

beforeEach(() => {
  window.localStorage.clear()
})

// LocaleProvider sets dir="rtl"/lang="ar" on <html> as a side effect and never
// unsets them — same cleanup as Hub.test.tsx/Products.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Editor — capture mode (default, unchanged)', () => {
  it('shows the capture tabs, not the sell tabs', () => {
    const funnel = makeCaptureFunnel('funnel_capture_1')
    renderEditor(funnel.id)

    expect(screen.getByRole('button', { name: 'Landing page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ads' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'WhatsApp bot' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Social' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Leads/ })).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Storefront' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Products' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Orders/ })).not.toBeInTheDocument()
  })
})

describe('Editor — sell mode', () => {
  it('shows the sell tabs, not the capture tabs', () => {
    const site = createStorefrontSite('Maison Noor', 'en')
    renderEditor(site.id)

    expect(screen.getByRole('button', { name: 'Storefront' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Products' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Orders/ })).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Landing page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ads' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'WhatsApp bot' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Social' })).not.toBeInTheDocument()
  })

  it('both modes still show the shared insights/settings/domain tabs', () => {
    const site = createStorefrontSite('Maison Noor 2', 'en')
    renderEditor(site.id)
    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument()
  })

  it('defaults to the storefront tab and lets the merchant edit the hero headline', () => {
    const site = createStorefrontSite('Maison Noor 3', 'en')
    renderEditor(site.id)
    // storefront tab is the default view — its hero headline field is visible without a click
    expect(screen.getByDisplayValue(site.spec.page.hero.headline)).toBeInTheDocument()
  })
})
