import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HubContent, LIVE_TOOL_KEYS } from './Hub'
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

const ALL_TOOL_KEYS = ['storefront', 'ads', 'whatsapp', 'pages', 'leads', 'social', 'insights', 'reviews', 'bookings']

beforeEach(() => {
  window.localStorage.clear()
})

describe('Hub', () => {
  it('renders all 9 tools in EN', () => {
    renderHub()
    for (const key of ALL_TOOL_KEYS) {
      expect(screen.getByTestId(`tool-${key}`)).toBeInTheDocument()
    }
  })

  it('renders in AR with Arabic strings present', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    renderHub()
    expect(screen.getByText('مجموعة نموّك')).toBeInTheDocument()
    expect(screen.getByText('الإعلانات')).toBeInTheDocument()
  })

  it('honest-status guard: exactly {Ads, WhatsApp, Landing pages} render as Live', () => {
    renderHub()
    const liveTestIds = ALL_TOOL_KEYS.filter((key) => screen.getByTestId(`tool-${key}`).dataset.status === 'live')
    expect(new Set(liveTestIds)).toEqual(new Set(LIVE_TOOL_KEYS))
    expect(liveTestIds).toHaveLength(3)
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
