import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AgencyContent } from './Agency'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { UpgradeProvider } from '../billing/UpgradeContext'
import { signUp, setPlan, createFunnel, createSubAccount, setActiveSubAccount, getFunnelBySlug } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderAgency() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <UpgradeProvider>
          <AgencyContent />
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
// unsets them — same cleanup as Hub.test.tsx/Leads.test.tsx/Whatsapp.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Agency — entitlement gate', () => {
  it('locks the page behind the whitelabel plan when the caller has no session (default/starter)', () => {
    renderAgency()
    expect(screen.getByText('Agency mode (white-label)')).toBeInTheDocument()
    expect(screen.queryByText('White-label branding')).not.toBeInTheDocument()
  })

  it('locks the page on a lower plan that does not include whiteLabel (e.g. growth)', () => {
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('growth')
    renderAgency()
    expect(screen.getByText('Agency mode (white-label)')).toBeInTheDocument()
  })

  it('unlocks the full page on the whitelabel plan', () => {
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('whitelabel')
    renderAgency()
    expect(screen.getByText('White-label branding')).toBeInTheDocument()
    expect(screen.getByText('Client sub-accounts')).toBeInTheDocument()
  })
})

describe('Agency — locale', () => {
  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('whitelabel')
    renderAgency()
    expect(screen.getByText('وضع الوكالة')).toBeInTheDocument()
    expect(screen.getByText('الهوية (وايت ليبل)')).toBeInTheDocument()
    expect(screen.getByText('حسابات العملاء')).toBeInTheDocument()
  })

  it('resolves a stale persisted fr-eg to Arabic (the Franco locale was removed)', () => {
    window.localStorage.setItem(LOCALE_KEY, 'fr-eg')
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('whitelabel')
    renderAgency()
    expect(screen.getByText('وضع الوكالة')).toBeInTheDocument()
    expect(screen.getByText('الهوية (وايت ليبل)')).toBeInTheDocument()
    expect(screen.getByText('حسابات العملاء')).toBeInTheDocument()
  })
})

describe('Agency — branding form', () => {
  beforeEach(() => {
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('whitelabel')
  })

  it('saves branding and shows a confirmation', () => {
    renderAgency()
    fireEvent.change(screen.getByPlaceholderText('Your Agency'), { target: { value: 'Sunrise Realty Group' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save branding' }))
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('rejects an oversized brand name without saving', () => {
    renderAgency()
    fireEvent.change(screen.getByPlaceholderText('Your Agency'), { target: { value: 'x'.repeat(81) } })
    fireEvent.click(screen.getByRole('button', { name: 'Save branding' }))
    expect(screen.getByText('Brand name must be 1–80 characters.')).toBeInTheDocument()
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('rejects a non-https logo URL without saving', () => {
    renderAgency()
    fireEvent.change(screen.getByPlaceholderText('https://your-cdn.com/logo.png'), { target: { value: 'javascript:alert(1)' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save branding' }))
    expect(screen.getByText('Logo URL must be a valid https:// link.')).toBeInTheDocument()
  })
})

describe('Agency — sub-accounts and the "no orphaned sites" delete guarantee', () => {
  beforeEach(() => {
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('whitelabel')
  })

  it('adds a client sub-account', () => {
    renderAgency()
    fireEvent.change(screen.getByPlaceholderText('Client name'), { target: { value: 'Marina Developers Co' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(screen.getByText('Marina Developers Co')).toBeInTheDocument()
  })

  it('selecting a sub-account shows the "building for" banner with a link to start a new site', () => {
    renderAgency()
    fireEvent.change(screen.getByPlaceholderText('Client name'), { target: { value: 'Riviera Clients' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    fireEvent.click(screen.getByText('Riviera Clients'))

    const banner = screen.getByTestId('agency-building-for')
    expect(within(banner).getByText('Riviera Clients')).toBeInTheDocument()
    expect(within(banner).getByRole('link', { name: /new site for this client/i })).toHaveAttribute('href', '/app/new')
  })

  it('deleting a sub-account reassigns its funnels to "All accounts" instead of deleting or orphaning them', () => {
    const sa = createSubAccount('Coastal Properties', 'ops@coastal.example')
    setActiveSubAccount(sa.id)
    const funnel = makeFunnel('f_agency_1', 'Coastal Site')
    expect(getFunnelBySlug(funnel.slug)?.subAccountId).toBe(sa.id) // assignment happened via the active sub-account

    renderAgency()
    expect(within(screen.getByTestId('agency-sub-Coastal Properties')).getByText(/1 funnel/)).toBeInTheDocument()

    // Click the trash trigger -> confirmation copy shown, not deleted yet.
    fireEvent.click(screen.getByTestId('agency-sub-delete-Coastal Properties'))
    expect(screen.getByText(/reassigned to/i)).toBeInTheDocument()
    expect(screen.getByTestId('agency-sub-Coastal Properties')).toBeInTheDocument()

    // Cancel keeps the sub-account.
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(/reassigned to/i)).not.toBeInTheDocument()
    expect(screen.getByTestId('agency-sub-Coastal Properties')).toBeInTheDocument()

    // Confirm deletes the sub-account, but "All accounts" still counts the site.
    fireEvent.click(screen.getByTestId('agency-sub-delete-Coastal Properties'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete client' })) // the confirm button inside the row
    expect(screen.queryByTestId('agency-sub-Coastal Properties')).not.toBeInTheDocument()
    expect(getFunnelBySlug(funnel.slug)?.subAccountId).toBeUndefined() // reassigned to unassigned, not deleted
    const allAccountsRow = screen.getByText('All accounts').closest('div')!.parentElement!
    expect(allAccountsRow).toHaveTextContent('1 funnel')
  })
})
