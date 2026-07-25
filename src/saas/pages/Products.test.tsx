import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductsContent } from './Products'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { createProduct, signUp } from '../store'

function renderProducts() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <ProductsContent />
      </LocaleProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

// LocaleProvider sets dir="rtl"/lang="ar" on <html> as a side effect and never
// unsets them — without this an AR test leaks RTL into every test that runs
// after it in the same worker (same fix as Hub.test.tsx/onboarding.test.tsx).
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Products', () => {
  // Runs before any test creates a product, so the store's in-memory product
  // list is still empty here (see store.ts — there's no per-product reset,
  // same pattern the rest of this test suite relies on).
  it('renders the empty state when there are no products yet', () => {
    renderProducts()
    expect(screen.getByTestId('products-empty')).toBeInTheDocument()
    expect(screen.getByText('No products yet')).toBeInTheDocument()
  })

  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    renderProducts()
    expect(screen.getByText('المنتجات')).toBeInTheDocument()
    expect(screen.getByText('لا توجد منتجات بعد')).toBeInTheDocument()
  })

  it('renders a product once one exists, with its formatted price and stock', () => {
    const now = Date.now()
    createProduct({
      id: 'prod_test_1',
      name: 'Oud Leather Tote',
      priceMinor: 240050,
      currency: 'AED',
      stock: 4,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    renderProducts()
    const card = screen.getByTestId('product-prod_test_1')
    expect(card).toHaveTextContent('Oud Leather Tote')
    expect(card).toHaveTextContent('AED 2,400.50')
    expect(card).toHaveTextContent('4')
    expect(screen.queryByTestId('products-empty')).not.toBeInTheDocument()
  })
})

// Runs last and deliberately signs in — the earlier tests above render with no
// session, which the storefront callout's create action guards against.
describe('storefront callout', () => {
  it('prompts to create a storefront when the workspace has none yet', () => {
    signUp('Test Merchant', 'merchant@example.com', 'gulf')
    renderProducts()
    expect(screen.getByText('No storefront yet')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /view store/i })).not.toBeInTheDocument()
  })

  it('creating a storefront switches the panel to a live "View store" link', () => {
    renderProducts()
    fireEvent.click(screen.getByText('Create your storefront'))

    expect(screen.getByText('Your storefront is live')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /view store/i })
    expect(link).toHaveAttribute('href', expect.stringMatching(/^\/p\//))
  })
})
