import { useEffect, useState } from 'react'

/**
 * Client-side cart for the public storefront (Phase 4b), persisted to
 * localStorage per store slug (so a shopper browsing two different
 * AutoLeadss stores in one browser doesn't cross-contaminate carts).
 *
 * Stores product ids + quantities ONLY — never prices. Prices are always
 * read from the server-provided product list at render/checkout time (see
 * StorefrontRenderer/CartDrawer, and api/published/order.ts's server-computed
 * subtotal), so a stale or tampered cart can never change what a shopper is
 * shown or charged.
 */
export interface CartItem {
  productId: string
  quantity: number
}

const KEY_PREFIX = 'autoleadss:cart:'

function storageKey(slug: string): string {
  return `${KEY_PREFIX}${slug}`
}

function isCartItem(v: unknown): v is CartItem {
  if (typeof v !== 'object' || v === null) return false
  const c = v as Record<string, unknown>
  return typeof c.productId === 'string' && !!c.productId && typeof c.quantity === 'number' && c.quantity > 0
}

function load(slug: string): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(slug))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

function save(slug: string, items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(items))
  } catch {
    /* ignore quota */
  }
}

/** Cart state for one store, scoped by `slug`. */
export function useCart(slug: string) {
  const [items, setItems] = useState<CartItem[]>(() => load(slug))

  useEffect(() => {
    save(slug, items)
  }, [slug, items])

  function add(productId: string, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) return prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i))
      return [...prev, { productId, quantity }]
    })
  }

  function setQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    )
  }

  function remove(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function clear() {
    setItems([])
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, add, setQuantity, remove, clear, count }
}

export type Cart = ReturnType<typeof useCart>
