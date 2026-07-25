import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/published/products.ts tests — public, no-auth catalogue. Same
 * fake-SQL-harness style as api/products/index.test.ts. price_minor is
 * returned as a STRING on every read, same bigint-over-the-wire behavior as
 * the real Neon driver. */

interface FunnelRow {
  slug: string
  clerk_user_id: string
  status: string
}

interface ProductRow {
  id: string
  clerk_user_id: string
  name: string
  description: string | null
  image_url: string | null
  price_minor: number
  currency: string
  stock: number
  status: string
}

interface ConnectionRow {
  clerk_user_id: string
  gateway: string
  status: string
}

const db = { funnels: [] as FunnelRow[], products: [] as ProductRow[], connections: [] as ConnectionRow[] }

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('select clerk_user_id from autoleadss.funnels')) {
    const [slug] = vals as [string]
    return db.funnels.filter((f) => f.slug === slug && f.status === 'published').map((f) => ({ clerk_user_id: f.clerk_user_id }))
  }
  if (text.includes('select id, name, description, image_url, price_minor, currency, stock')) {
    const [ownerId] = vals as [string]
    return db.products
      .filter((p) => p.clerk_user_id === ownerId && p.status === 'active')
      .map((p) => ({ ...p, price_minor: String(p.price_minor) }))
  }
  if (text.includes('select gateway from autoleadss.payment_connections')) {
    const [ownerId] = vals as [string]
    return db.connections.filter((c) => c.clerk_user_id === ownerId && c.status === 'connected').map((c) => ({ gateway: c.gateway }))
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

const { default: handler } = await import('./products')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(query: Record<string, string> = {}) {
  return { method: 'GET', query, body: {}, headers: {} } as any
}

beforeEach(() => {
  db.funnels = []
  db.products = []
  db.connections = []
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
  delete process.env.PAYMENTS_FAKE_ADAPTER
})

describe('method + config guards', () => {
  it('405s on POST', async () => {
    const r = res()
    await handler({ method: 'POST', query: {}, body: {}, headers: {} } as any, r)
    expect(r.statusCode).toBe(405)
  })

  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect(r.statusCode).toBe(501)
  })

  it('400s without a slug', async () => {
    const r = res()
    await handler(req({}), r)
    expect(r.statusCode).toBe(400)
  })

  it('404s for an unpublished/unknown slug', async () => {
    const r = res()
    await handler(req({ slug: 'nope' }), r)
    expect(r.statusCode).toBe(404)
  })
})

describe('display-safe catalogue', () => {
  it('returns only active products, mapped to display-safe fields', async () => {
    db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published' })
    db.products.push(
      { id: 'p1', clerk_user_id: 'merchant_A', name: 'Oud Tote', description: 'Leather', image_url: 'https://x/1.jpg', price_minor: 240050, currency: 'aed', stock: 4, status: 'active' },
      { id: 'p2', clerk_user_id: 'merchant_A', name: 'Draft item', description: null, image_url: null, price_minor: 1000, currency: 'AED', stock: 0, status: 'draft' },
      { id: 'p3', clerk_user_id: 'merchant_A', name: 'Archived item', description: null, image_url: null, price_minor: 1000, currency: 'AED', stock: 0, status: 'archived' },
      { id: 'p4', clerk_user_id: 'merchant_B', name: "Someone else's", description: null, image_url: null, price_minor: 1000, currency: 'AED', stock: 9, status: 'active' },
    )

    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect(r.statusCode).toBe(200)
    const products = (r.body as any).products

    expect(products).toHaveLength(1) // draft, archived, and another merchant's product all excluded
    expect(products[0]).toEqual({ id: 'p1', name: 'Oud Tote', description: 'Leather', imageUrl: 'https://x/1.jpg', priceMinor: 240050, currency: 'aed', inStock: true })

    const serialized = JSON.stringify(products)
    expect(serialized).not.toContain('clerk_user_id')
    expect(serialized).not.toContain('merchant_A')
    expect(serialized).not.toContain('"stock"') // only the computed inStock boolean, never the raw count
  })

  it('reports inStock:false for a zero-stock active product', async () => {
    db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published' })
    db.products.push({ id: 'p1', clerk_user_id: 'merchant_A', name: 'Sold out', description: null, image_url: null, price_minor: 1000, currency: 'AED', stock: 0, status: 'active' })

    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect((r.body as any).products[0].inStock).toBe(false)
  })
})

// The display-safe UX hint api/published/order.ts's checkout gate is
// re-derived from — never which gateway, never a connection id.
describe('acceptsPayments', () => {
  it('is false when the owner has no connected gateway', async () => {
    db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published' })
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect((r.body as any).acceptsPayments).toBe(false)
  })

  it('is false when a gateway is connected but not implemented (every real gateway today)', async () => {
    db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published' })
    db.connections.push({ clerk_user_id: 'merchant_A', gateway: 'tap', status: 'connected' })
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect((r.body as any).acceptsPayments).toBe(false)
  })

  it('is true once a connected + implemented (fake, test-only) gateway exists, and never leaks which one', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published' })
    db.connections.push({ clerk_user_id: 'merchant_A', gateway: 'fake', status: 'connected' })
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect((r.body as any).acceptsPayments).toBe(true)

    const serialized = JSON.stringify(r.body)
    expect(serialized).not.toContain('fake') // the gateway id itself never appears in the response
    expect(serialized).not.toContain('merchant_A')
  })

  it("ignores another merchant's connected gateway", async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published' })
    db.connections.push({ clerk_user_id: 'merchant_B', gateway: 'fake', status: 'connected' })
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect((r.body as any).acceptsPayments).toBe(false)
  })
})
