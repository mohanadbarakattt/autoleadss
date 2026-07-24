import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StartContent } from './pages/Start'
import { LocaleProvider, LOCALE_KEY } from './i18n'
import { BUSINESS_TYPES } from './onboarding'
import { TOOLS } from './suite/tools'
import type { Industry } from './types'
import { signUp, useSession } from './store'

const VALID_INDUSTRIES: Industry[] = ['real-estate', 'ecommerce', 'clinic', 'restaurant', 'fitness', 'services', 'other']
const VALID_TOOL_KEYS = TOOLS.map((tool) => tool.key)

function renderStart() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <StartContent />
      </LocaleProvider>
    </MemoryRouter>,
  )
}

/** Reads the store's own session hook, so the persistence test verifies through
 * the same path the app uses (Hub, SuiteShell) rather than poking localStorage. */
function Probe() {
  const session = useSession()
  return (
    <div data-testid="probe">
      {session?.workspace.businessType ?? ''}:{(session?.workspace.toolkit ?? []).join(',')}
    </div>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

// LocaleProvider sets dir="rtl"/lang="ar" on <html> as a side effect and never
// unsets them — without this, the AR test below leaks RTL into every test that
// runs after it (see the same fix in Hub.test.tsx).
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('onboarding business types', () => {
  it('every business type has a non-empty toolkit of valid ToolKeys', () => {
    for (const type of BUSINESS_TYPES) {
      expect(type.toolkit.length).toBeGreaterThan(0)
      for (const key of type.toolkit) expect(VALID_TOOL_KEYS).toContain(key)
    }
  })

  it('every business type maps to a valid Industry', () => {
    for (const type of BUSINESS_TYPES) expect(VALID_INDUSTRIES).toContain(type.industry)
  })
})

describe('Start page', () => {
  it('renders all 8 business types in EN and switching selection updates the kit card', () => {
    renderStart()
    for (const type of BUSINESS_TYPES) {
      expect(screen.getByTestId(`biztype-${type.id}`)).toBeInTheDocument()
    }

    // Default selection is retail, which recommends Storefront but not Bookings.
    expect(screen.getByText('Storefront')).toBeInTheDocument()
    expect(screen.queryByText('Bookings')).not.toBeInTheDocument()

    // Clinic recommends Bookings but not Storefront — the kit card must flip.
    fireEvent.click(screen.getByTestId('biztype-clinic'))
    expect(screen.queryByText('Storefront')).not.toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
  })

  it('confirm persists businessType + toolkit on the workspace', () => {
    signUp('Test User', 'test@example.com', 'gulf')
    render(
      <MemoryRouter>
        <LocaleProvider>
          <StartContent />
          <Probe />
        </LocaleProvider>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('biztype-clinic'))
    fireEvent.click(screen.getByRole('button', { name: /build my toolkit/i }))

    const clinic = BUSINESS_TYPES.find((type) => type.id === 'clinic')!
    expect(screen.getByTestId('probe')).toHaveTextContent(`clinic:${clinic.toolkit.join(',')}`)
  })

  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    renderStart()
    expect(screen.getByText('لنبنِ نموّك')).toBeInTheDocument()
    expect(screen.getByText('عقارات')).toBeInTheDocument()
  })

  it('the payments strip promises correctly — "arriving", never "ready"', () => {
    renderStart()
    expect(screen.getByText(/arriving with checkout/i)).toBeInTheDocument()
    expect(screen.getByText('Soon')).toBeInTheDocument()
    expect(screen.queryByText(/ready/i)).not.toBeInTheDocument()
  })
})
