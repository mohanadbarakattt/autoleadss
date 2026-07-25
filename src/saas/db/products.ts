import type { RemoteAuth } from './api'
import { authedRequest } from './api'
import type { Product, Order } from '../types'

/** Phase 4a remote data-access — same shape as db/api.ts's funnel functions
 * (throws on any failure; the caller decides the localStorage fallback). */

export async function listProducts(auth: RemoteAuth): Promise<Product[]> {
  const { products } = await authedRequest<{ products: Product[] }>(auth, '/api/products')
  return products
}

export async function createProduct(auth: RemoteAuth, p: Product): Promise<void> {
  await authedRequest(auth, '/api/products', { method: 'POST', body: JSON.stringify(p) })
}

export async function updateProduct(auth: RemoteAuth, id: string, patch: Partial<Product>): Promise<void> {
  await authedRequest(auth, `/api/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

/** Reports which outcome the server chose — see api/products/[id].ts's
 * archive-if-referenced rule (a sold product's order history must survive a
 * merchant deleting it). */
export async function deleteProduct(auth: RemoteAuth, id: string): Promise<{ action: 'deleted' | 'archived' }> {
  return authedRequest(auth, `/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function listOrders(auth: RemoteAuth): Promise<Order[]> {
  const { orders } = await authedRequest<{ orders: Order[] }>(auth, '/api/orders')
  return orders
}
