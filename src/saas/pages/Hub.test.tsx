import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HubContent } from './Hub'
import { LocaleProvider, LOCALE_KEY } from '../i18n'

function renderHub() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <HubContent />
      </LocaleProvider>
    </MemoryRouter>,
  )
}

// Frozen truth — deliberately hardcoded, NOT imported from Hub.tsx, so this test
// actually pins the implementation instead of just echoing it back. Later phases
// update these two lists by hand as tools genuinely go live (design spec §4).
const ALL_TOOL_KEYS = ['storefront', 'ads', 'whatsapp', 'pages', 'leads', 'social', 'insights', 'reviews', 'bookings']
const LIVE_TOOL_KEYS = ['ads', 'whatsapp', 'pages', 'leads', 'insights']

beforeEach(() => {
  window.localStorage.clear()
})

// LocaleProvider sets dir="rtl"/lang="ar" on <html> as a side effect and never
// unsets them — without this, an AR test leaves the DOM in RTL for every test
// that runs after it in the same file (or worse, another file, since jsdom's
// document persists across test files in the same worker).
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Hub', () => {
  it('renders all 9 tools in EN', () => {
    renderHub()
    for (const key of ALL_TOOL_KEYS) {
      expect(screen.getByTestId(`tool-${key}`)).toBeInTheDocument()
    }
  })

  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    renderHub()
    expect(screen.getByText('مجموعة نموّك')).toBeInTheDocument()
    expect(screen.getByText('الإعلانات')).toBeInTheDocument()
  })

  it('honest-status guard: exactly {Ads, WhatsApp, Landing pages, Leads & CRM, Insights} render as Live', () => {
    renderHub()
    const liveTestIds = ALL_TOOL_KEYS.filter((key) => screen.getByTestId(`tool-${key}`).dataset.status === 'live')
    expect(new Set(liveTestIds)).toEqual(new Set(LIVE_TOOL_KEYS))
    expect(liveTestIds).toHaveLength(5)
  })

  it('"Soon" tiles have no link and no live dot', () => {
    renderHub()
    for (const key of ALL_TOOL_KEYS.filter((k) => !LIVE_TOOL_KEYS.includes(k as (typeof LIVE_TOOL_KEYS)[number]))) {
      const tile = screen.getByTestId(`tool-${key}`)
      expect(tile.tagName).not.toBe('A')
      expect(tile.querySelector('a')).toBeNull()
      expect(tile).toHaveAttribute('aria-disabled', 'true')
      expect(tile.querySelector('[data-live-dot]')).toBeNull()
    }
  })

  it('the flagship CTA does not claim the storefront is open', () => {
    renderHub()
    const cta = screen.getByRole('button', { name: /coming soon/i })
    expect(cta).toBeDisabled()
    expect(screen.queryByRole('link', { name: /open storefront/i })).not.toBeInTheDocument()
  })
})
