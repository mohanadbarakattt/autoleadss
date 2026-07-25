import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { InsightsContent } from './Insights'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { createFunnel, addLead, seedDemoLeads, recordVisit } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderInsights() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <InsightsContent />
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
// unsets them — same cleanup as Hub.test.tsx/Leads.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Insights', () => {
  it('renders the true-zero empty state when there are no sites yet, with no fabricated numbers', () => {
    renderInsights()
    expect(screen.getByTestId('insights-empty')).toBeInTheDocument()
    expect(screen.getByText('No data yet')).toBeInTheDocument()
    expect(screen.queryByTestId(/insights-kpi-/)).not.toBeInTheDocument()
  })

  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    renderInsights()
    expect(screen.getByText('التحليلات')).toBeInTheDocument()
  })

  // Relies on running before any other test in this file adds a funnel — the
  // in-memory store (store.ts) is never reset between tests, only this test
  // and the two above it run against a genuinely empty store (same ordering
  // dependency Leads.test.tsx documents on its own first data-bearing test).
  // Every test after this one scopes its assertions to a specific site's own
  // row instead of the cross-site KPI totals, so it stays valid regardless of
  // what earlier tests accumulated.
  it('aggregates real visits and leads across every site into the cross-site KPI tiles', () => {
    const siteOne = makeFunnel('f_ins_1', 'Marina Realty')
    const siteTwo = makeFunnel('f_ins_2', 'Sunset Salon')
    recordVisit(siteOne.slug)
    recordVisit(siteOne.slug)
    recordVisit(siteTwo.slug)
    addLead(siteOne.slug, { name: 'Sara', phone: '1', source: 'page' })
    addLead(siteTwo.slug, { name: 'Amal', phone: '2', source: 'whatsapp' })
    renderInsights()

    expect(screen.getByTestId('insights-kpi-0')).toHaveTextContent('3') // visits: 2 + 1
    expect(screen.getByTestId('insights-kpi-1')).toHaveTextContent('2') // leads
    expect(screen.getByTestId(`insights-site-${siteOne.id}`)).toHaveTextContent('Marina Realty')
    expect(screen.getByTestId(`insights-site-${siteTwo.id}`)).toHaveTextContent('Sunset Salon')
  })

  it('never lets seeded sample data masquerade as real business intelligence, and labels it', () => {
    const funnel = makeFunnel('f_ins_sample', 'Sample Site')
    seedDemoLeads(funnel.id, [
      ['Demo One', '+971500000001'],
      ['Demo Two', '+971500000002'],
    ])
    renderInsights()

    // The seeded leads/visits must not be counted in this site's own row —
    // requirement (a). seedDemoLeads adds 2 sample leads and a nonzero fake
    // visit count; the row's visits/leads/won cells must all read zero
    // (scoped to this funnel's row so it's immune to other funnels' totals
    // accumulated by earlier tests in this file — store.ts's in-memory state
    // is never reset between tests, same as Leads.test.tsx/Products.test.tsx).
    const row = screen.getByTestId(`insights-site-${funnel.id}`)
    const cells = Array.from(row.querySelectorAll('td')).map((c) => c.textContent)
    expect(cells).toEqual(['Sample Site', '0', '0', '0%', '0'])

    // And the site is unmistakably labeled as carrying sample data.
    expect(screen.getByText(/sample data/i)).toBeInTheDocument()
    expect(screen.getByText('Start from scratch')).toBeInTheDocument()
  })

  it('a real lead alongside sample leads on the same site is still counted; the sample leads are not', () => {
    const funnel = makeFunnel('f_ins_mixed', 'Mixed Site')
    seedDemoLeads(funnel.id, [['Demo One', '+971500000001']])
    addLead(funnel.slug, { name: 'Real Lead', phone: '+971500000099', source: 'page' })
    renderInsights()

    const row = screen.getByTestId(`insights-site-${funnel.id}`)
    const cells = Array.from(row.querySelectorAll('td'))
    expect(cells[2].textContent).toBe('1') // leads column: only the real lead, not the sample one
  })

  it('never presents pending order value as earned revenue, and shows the honest empty state when there are none', () => {
    makeFunnel('f_ins_orders', 'Orders Site')
    renderInsights()

    expect(screen.getByText('No pending orders yet.')).toBeInTheDocument()
    expect(screen.queryByText(/revenue/i)).not.toBeInTheDocument()
    // Demo mode never creates orders (see store.ts's `orders` doc) — Pending
    // must never appear with a live currency figure here.
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
  })

  it('labels the trend-chart day boundary as UTC rather than silently presenting it as local "today"', () => {
    makeFunnel('f_ins_boundary_note', 'Boundary Note Site')
    renderInsights()
    expect(screen.getByText(/Gulf-time \(UTC\+4\)/)).toBeInTheDocument()
  })

  it('buckets a visit recorded today into the UTC "today" bucket, consistent with the UTC note', () => {
    const funnel = makeFunnel('f_ins_bucket', 'Bucket Site')
    recordVisit(funnel.slug)
    renderInsights()
    const todayKey = new Date().toISOString().slice(0, 10)
    const label = `${Number(todayKey.slice(5, 7))}/${Number(todayKey.slice(8, 10))}`
    // The visits chart's last bar (today, UTC) carries a title starting with
    // today's label and a positive count — not asserting an exact count,
    // since store.ts's in-memory state accumulates visits from earlier tests
    // in this file (no per-test reset — same as every other page test here).
    const bar = document.querySelector(`[title^="${label}: "]`)
    expect(bar).toBeTruthy()
    expect(Number(bar!.getAttribute('title')!.split(': ')[1])).toBeGreaterThan(0)
  })
})
