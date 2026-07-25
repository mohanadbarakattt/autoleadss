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
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor" products={products()} acceptsPayments onCheckout={vi.fn()} />)

    expect(screen.getAllByText('Maison Noor').length).toBeGreaterThan(0)
    expect(screen.getByText('Oud Leather Tote')).toBeInTheDocument()
    expect(screen.getByText('AED 2,400.50')).toBeInTheDocument()
    expect(screen.getByText('Silk Scarf')).toBeInTheDocument()
    expect(screen.getByText('AED 300')).toBeInTheDocument()
  })

  it('renders right-to-left with Arabic copy in AR', () => {
    const { container } = render(
      <StorefrontRenderer spec={buildStorefrontSpec('ميزون نور', 'ar')} slug="maison-noor-ar" products={products()} acceptsPayments onCheckout={vi.fn()} />,
    )

    expect(container.firstChild).toHaveAttribute('dir', 'rtl')
    expect(screen.getAllByText('ميزون نور').length).toBeGreaterThan(0)
    expect(screen.getAllByText('أضف إلى السلة').length).toBeGreaterThan(0) // "Add to cart" — real AR copy, not fallback English
  })

  it('shows a graceful empty state instead of a broken/empty grid when there are no products', () => {
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor" products={[]} acceptsPayments onCheckout={vi.fn()} />)

    expect(screen.getByText('No products yet')).toBeInTheDocument()
    expect(screen.queryByText('Oud Leather Tote')).not.toBeInTheDocument()
  })

  it('shows a neutral placeholder, never a broken <img>, for a product without an image', () => {
    const { container } = render(
      <StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor" products={products()} acceptsPayments onCheckout={vi.fn()} />,
    )

    // Only Silk Scarf (no imageUrl) gets the placeholder; only Oud Leather Tote gets a real <img>.
    expect(container.querySelectorAll('[data-testid="product-image-placeholder"]')).toHaveLength(1)
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(screen.getByAltText('Oud Leather Tote')).toBeInTheDocument()
  })

  it('treats an invalid (javascript:) imageUrl the same as no image — neutral placeholder, never an <img src> (SEC1)', () => {
    const badProducts: PublicProduct[] = [
      { id: 'p1', name: 'Oud Leather Tote', priceMinor: 240050, currency: 'AED', imageUrl: 'javascript:alert(1)', inStock: true },
    ]
    const { container } = render(
      <StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-bad-image" products={badProducts} acceptsPayments onCheckout={vi.fn()} />,
    )
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(container.querySelectorAll('[data-testid="product-image-placeholder"]')).toHaveLength(1)
  })

  it('falls back to generic band copy when the merchant has not set any', () => {
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-band-default" products={products()} acceptsPayments onCheckout={vi.fn()} />)
    expect(screen.getByText('Shop the store')).toBeInTheDocument()
    expect(screen.getByText('The full collection')).toBeInTheDocument()
    // "Shop now" appears twice by default: the hero CTA and the band's
    // fallback CTA both use the same generic copy.
    expect(screen.getAllByText('Shop now').length).toBe(2)
  })

  it("renders the merchant's own band copy (Phase 4c: spec.page.finalCta) instead of the generic fallback", () => {
    const spec = buildStorefrontSpec('Maison Noor', 'en')
    spec.page.finalCta = { sub: 'Members only', headline: 'The winter edit', cta: 'Browse the edit' }
    render(<StorefrontRenderer spec={spec} slug="maison-noor-band-custom" products={products()} acceptsPayments onCheckout={vi.fn()} />)
    expect(screen.getByText('Members only')).toBeInTheDocument()
    expect(screen.getByText('The winter edit')).toBeInTheDocument()
    expect(screen.getByText('Browse the edit')).toBeInTheDocument()
    expect(screen.queryByText('Shop the store')).not.toBeInTheDocument()
  })

  it('adding a product to the cart bumps the header cart badge', () => {
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-cart" products={products()} acceptsPayments onCheckout={vi.fn()} />)

    expect(screen.queryByText('1')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByText('Add to cart')[0])
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})

// The PII fix: when the store isn't accepting payments, the shopper must see
// that BEFORE a contact form ever appears — never after typing in a name/
// email/phone for an order that can't be placed.
describe('StorefrontRenderer — acceptsPayments gate', () => {
  function addFirstItemAndOpenCart() {
    fireEvent.click(screen.getAllByText('Add to cart')[0])
    fireEvent.click(screen.getByLabelText('Cart'))
  }

  it('shows the gated message and no contact form when acceptsPayments is false', () => {
    render(
      <StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-gated" products={products()} acceptsPayments={false} onCheckout={vi.fn()} />,
    )
    addFirstItemAndOpenCart()

    expect(screen.getByText("This store isn't accepting payments yet")).toBeInTheDocument()
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Full name')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Phone')).not.toBeInTheDocument()
  })

  it('never calls onCheckout when acceptsPayments is false — there is no path to submit', () => {
    const onCheckout = vi.fn()
    render(
      <StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-gated-2" products={products()} acceptsPayments={false} onCheckout={onCheckout} />,
    )
    addFirstItemAndOpenCart()
    expect(onCheckout).not.toHaveBeenCalled()
  })

  it('shows the real Checkout button and contact form when acceptsPayments is true', () => {
    render(
      <StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-open" products={products()} acceptsPayments onCheckout={vi.fn()} />,
    )
    addFirstItemAndOpenCart()

    expect(screen.queryByText("This store isn't accepting payments yet")).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Checkout'))
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument()
  })
})

describe('StorefrontRenderer — cart drawer scroll lock', () => {
  it('locks background scroll while open and restores it exactly on close', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    render(<StorefrontRenderer spec={buildStorefrontSpec('Maison Noor', 'en')} slug="maison-noor-scroll" products={products()} acceptsPayments onCheckout={vi.fn()} />)

    expect(document.body.style.position).toBe('')

    fireEvent.click(screen.getByLabelText('Cart'))
    expect(document.body.style.position).toBe('fixed') // background can no longer scroll while the drawer is open

    fireEvent.click(screen.getAllByLabelText('Close')[0])
    expect(document.body.style.position).toBe('') // fully restored — no leftover inline styles causing a layout shift
    expect(scrollToSpy).toHaveBeenCalled() // the prior scroll position is restored, not left at the top

    scrollToSpy.mockRestore()
  })
})
