import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StorefrontPanel, ProductsPanel, OrdersPanel } from './SellPanels'
import { LocaleProvider } from '../../i18n'
import { buildStorefrontSpec } from '../../storefront/createStore'
import type { Order } from '../../types'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

function wrap(children: React.ReactNode) {
  return render(
    <MemoryRouter>
      <LocaleProvider>{children}</LocaleProvider>
    </MemoryRouter>,
  )
}

function order(over: Partial<Order> = {}): Order {
  return {
    id: 'order_1',
    status: 'paid',
    subtotalMinor: 240050,
    currency: 'AED',
    buyerName: 'Sara Ahmed',
    buyerEmail: 'sara@example.com',
    buyerPhone: '+971500000000',
    createdAt: new Date('2026-07-20T10:00:00Z').getTime(),
    updatedAt: new Date('2026-07-20T10:00:00Z').getTime(),
    items: [{ id: 'oi_1', productId: 'prod_1', nameSnapshot: 'Oud Leather Tote', unitPriceMinor: 240050, quantity: 1, currency: 'AED' }],
    ...over,
  }
}

describe('OrdersPanel — real order data, display only', () => {
  it('shows the empty state when there are no orders', () => {
    wrap(<OrdersPanel orders={[]} />)
    expect(screen.getByText('No orders yet.')).toBeInTheDocument()
  })

  it('renders buyer, items, formatted total, and status for a real order', () => {
    wrap(<OrdersPanel orders={[order()]} />)
    expect(screen.getByText('Sara Ahmed')).toBeInTheDocument()
    expect(screen.getByText('Oud Leather Tote ×1')).toBeInTheDocument()
    expect(screen.getByText('AED 2,400.50')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })

  it('renders newest-first order as passed in (sorting is the caller/API’s job, not this panel’s)', () => {
    const older = order({ id: 'order_older', buyerName: 'Older Buyer', createdAt: Date.now() - 100000 })
    const newer = order({ id: 'order_newer', buyerName: 'Newer Buyer', createdAt: Date.now() })
    wrap(<OrdersPanel orders={[newer, older]} />)
    const rows = screen.getAllByRole('row').slice(1) // drop the header row
    expect(rows[0]).toHaveTextContent('Newer Buyer')
    expect(rows[1]).toHaveTextContent('Older Buyer')
  })

  it('has no status control — display only, never mutates', () => {
    wrap(<OrdersPanel orders={[order()]} />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('StorefrontPanel — edits the fields StorefrontRenderer reads', () => {
  it('editing the hero headline field calls set() with the new value', () => {
    const spec = buildStorefrontSpec('Maison Noor', 'en')
    const set = vi.fn((mutate: (s: typeof spec) => typeof spec) => mutate(spec))
    wrap(<StorefrontPanel spec={spec} set={set} />)

    const headlineInput = screen.getByDisplayValue(spec.page.hero.headline)
    fireEvent.change(headlineInput, { target: { value: 'New headline' } })
    expect(set).toHaveBeenCalled()
  })

  it('shows band-section fields (label/headline/button) seeded from spec.page.finalCta', () => {
    const spec = buildStorefrontSpec('Maison Noor', 'en')
    spec.page.finalCta = { sub: 'Members only', headline: 'The winter edit', cta: 'Browse' }
    wrap(<StorefrontPanel spec={spec} set={vi.fn()} />)
    expect(screen.getByDisplayValue('Members only')).toBeInTheDocument()
    expect(screen.getByDisplayValue('The winter edit')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Browse')).toBeInTheDocument()
  })
})

describe('ProductsPanel — link through, not a duplicate CRUD surface', () => {
  it('links to /app/products', () => {
    wrap(<ProductsPanel />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/app/products')
  })
})
