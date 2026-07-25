import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StorefrontRenderer from './StorefrontRenderer'
import { buildStorefrontSpec } from './createStore'
import type { PublicProduct } from '../types'

function products(): PublicProduct[] {
  return [
    { id: 'p1', name: 'Oud Leather Tote', priceMinor: 240050, currency: 'AED', imageUrl: 'https://example.com/tote.jpg', inStock: true },
    { id: 'p2', name: 'Silk Scarf', priceMinor: 30000, currency: 'AED', inStock: true }, // no imageUrl
  ]
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('StorefrontRenderer', () => {
  it('renders the business name, products, and formatted prices in EN', () => {
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor" products={products()} onCheckout={vi.fn()} />)

    expect(screen.getAllByText('Maison Noor').length).toBeGreaterThan(0)
    expect(screen.getByText('Oud Leather Tote')).toBeInTheDocument()
    expect(screen.getByText('AED 2,400.50')).toBeInTheDocument()
    expect(screen.getByText('Silk Scarf')).toBeInTheDocument()
    expect(screen.getByText('AED 300')).toBeInTheDocument()
  })

  it('renders right-to-left with Arabic copy in AR', () => {
    const { container } = render(
      <StorefrontRenderer spec={buildStorefrontSpec('ميزون نور', 'ar')} slug="maison-noor-ar" products={products()} onCheckout={vi.fn()} />,
    )

    expect(container.firstChild).toHaveAttribute('dir', 'rtl')
    expect(screen.getAllByText('ميزون نور').length).toBeGreaterThan(0)
    expect(screen.getAllByText('أضف إلى السلة').length).toBeGreaterThan(0) // "Add to cart" — real AR copy, not fallback English
  })

  it('shows a graceful empty state instead of a broken/empty grid when there are no products', () => {
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor" products={[]} onCheckout={vi.fn()} />)

    expect(screen.getByText('No products yet')).toBeInTheDocument()
    expect(screen.queryByText('Oud Leather Tote')).not.toBeInTheDocument()
  })

  it('shows a neutral placeholder, never a broken <img>, for a product without an image', () => {
    const { container } = render(
      <StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor" products={products()} onCheckout={vi.fn()} />,
    )

    // Only Silk Scarf (no imageUrl) gets the placeholder; only Oud Leather Tote gets a real <img>.
    expect(container.querySelectorAll('[data-testid="product-image-placeholder"]')).toHaveLength(1)
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(screen.getByAltText('Oud Leather Tote')).toBeInTheDocument()
  })

  it('adding a product to the cart bumps the header cart badge', () => {
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-cart" products={products()} onCheckout={vi.fn()} />)

    expect(screen.queryByText('1')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Add to cart')[0])
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
