import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardContent } from './Dashboard'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { UpgradeProvider } from '../billing/UpgradeContext'
import { signUp, createFunnel } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderDashboard() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <UpgradeProvider>
          <DashboardContent />
        </UpgradeProvider>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

function makeFunnel(id: string, name: string): Funnel {
  const spec = generateFromTemplate({ industry: 'services', businessName: name, language: 'en', region: 'gulf', goal: 'leads', tone: 'bold', accent: '#FF5C2A' })
  const funnel: Funnel = {
    id,
    name,
    slug: `slug-${id}`,
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
// unsets them — same cleanup as Hub.test.tsx/Whatsapp.test.tsx/Agency.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Dashboard', () => {
  it('renders the empty state with no funnels', () => {
    renderDashboard()
    expect(screen.getByText('Your funnels')).toBeInTheDocument()
    expect(screen.getByText('No funnels yet')).toBeInTheDocument()
  })

  it('renders a funnel card once a funnel exists', () => {
    signUp('Demo', 'demo@example.com', 'gulf')
    makeFunnel('f_dash_1', 'Demo Site')
    renderDashboard()
    expect(screen.getByText('Demo Site')).toBeInTheDocument()
    expect(screen.queryByText('No funnels yet')).not.toBeInTheDocument()
  })
})

describe('Dashboard — locale', () => {
  it('renders Arabic strings in AR locale', () => {
    // Asserts title + the always-present "new funnel" CTA rather than the
    // empty-state copy — store state (funnels created by earlier tests in
    // this file) persists across `it()`s, so the funnel list isn't
    // guaranteed empty here even after `localStorage.clear()`.
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    signUp('Demo', 'demo@example.com', 'gulf')
    renderDashboard()
    expect(screen.getByText('أقماعك')).toBeInTheDocument()
    expect(screen.getByText('قمع جديد')).toBeInTheDocument()
  })
})
