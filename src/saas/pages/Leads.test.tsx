import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LeadsContent } from './Leads'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { createFunnel, addLead, seedDemoLeads } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderLeads() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <LeadsContent />
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
// unsets them — same cleanup as Hub.test.tsx/Products.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Leads', () => {
  // Runs before any test creates a funnel/lead, so the store's in-memory funnel
  // list is still empty here (no per-test store reset — same pattern
  // Products.test.tsx relies on).
  it('renders the true-zero empty state when there are no leads yet, with no fabricated count', () => {
    renderLeads()
    expect(screen.getByTestId('leads-empty')).toBeInTheDocument()
    expect(screen.getByText('No leads yet')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /export csv/i })).not.toBeInTheDocument()
  })

  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    renderLeads()
    expect(screen.getByText('العملاء وإدارة العلاقات')).toBeInTheDocument()
  })

  it('shows a captured lead with which site it came from, and lets its status change inline', () => {
    const funnel = makeFunnel('f_leads_1', 'Marina Realty')
    const lead = addLead(funnel.slug, { name: 'Sara Ahmed', phone: '+971500000001', source: 'page' })
    renderLeads()

    const row = screen.getByTestId(`lead-${lead.id}`)
    expect(row).toHaveTextContent('Sara Ahmed')
    expect(row).toHaveTextContent('Marina Realty')

    const statusSelect = within(row).getByDisplayValue('New')
    fireEvent.change(statusSelect, { target: { value: 'won' } })
    expect(statusSelect).toHaveValue('won')
  })

  it('searches by name, phone, or email', () => {
    const funnel = makeFunnel('f_leads_2', 'Sunset Salon')
    const match = addLead(funnel.slug, { name: 'Unique Zayn', phone: '+971500000002', source: 'page' })
    const other = addLead(funnel.slug, { name: 'Someone Else', phone: '+971500000003', source: 'page' })
    renderLeads()

    fireEvent.change(screen.getByPlaceholderText('Search name, phone, or email…'), { target: { value: 'Unique Zayn' } })
    expect(screen.getByTestId(`lead-${match.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`lead-${other.id}`)).not.toBeInTheDocument()
  })

  it('filters by site', () => {
    const siteOne = makeFunnel('f_leads_3', 'Site Filter One')
    const siteTwo = makeFunnel('f_leads_4', 'Site Filter Two')
    const fromOne = addLead(siteOne.slug, { name: 'From Site One', phone: '1', source: 'page' })
    const fromTwo = addLead(siteTwo.slug, { name: 'From Site Two', phone: '2', source: 'page' })
    renderLeads()

    fireEvent.change(screen.getByDisplayValue('All sites'), { target: { value: siteOne.id } })
    expect(screen.getByTestId(`lead-${fromOne.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`lead-${fromTwo.id}`)).not.toBeInTheDocument()
  })

  it('filters by status', () => {
    const funnel = makeFunnel('f_leads_5', 'Status Filter Site')
    const won = addLead(funnel.slug, { name: 'Won Lead', phone: '3', source: 'page' })
    const stillNew = addLead(funnel.slug, { name: 'New Lead', phone: '4', source: 'page' })
    renderLeads()
    fireEvent.change(within(screen.getByTestId(`lead-${won.id}`)).getByDisplayValue('New'), { target: { value: 'won' } })

    fireEvent.change(screen.getByDisplayValue('All statuses'), { target: { value: 'won' } })
    expect(screen.getByTestId(`lead-${won.id}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`lead-${stillNew.id}`)).not.toBeInTheDocument()
  })

  it('offers a CSV export once there are leads', () => {
    const funnel = makeFunnel('f_leads_6', 'Export Test Site')
    addLead(funnel.slug, { name: 'Exportable', phone: '5', source: 'page' })
    renderLeads()
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })

  it('labels sample-seeded leads and offers to clear them, never passing them off as real', () => {
    const funnel = makeFunnel('f_leads_7', 'Sample Site')
    seedDemoLeads(funnel.id, [['Demo Person', '+971500000099']])
    renderLeads()

    expect(screen.getByText('Sample')).toBeInTheDocument()
    expect(screen.getByText('Start from scratch')).toBeInTheDocument()
  })

  it('drafts an AI follow-up and enables the WhatsApp send link', async () => {
    const funnel = makeFunnel('f_leads_8', 'Follow Up Site')
    const lead = addLead(funnel.slug, { name: 'Reply Target', phone: '+971500000077', source: 'page', message: 'Interested' })
    renderLeads()

    const row = screen.getByTestId(`lead-${lead.id}`)
    fireEvent.click(within(row).getByRole('button', { name: /instant reply/i }))

    const link = await screen.findByRole('link', { name: /send via whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/971500000077'))
  })
})
