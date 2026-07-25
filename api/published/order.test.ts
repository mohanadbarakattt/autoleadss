import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * api/published/order.ts tests — the fail-closed checkout path. Same
 * fake-SQL-harness style as api/products/index.test.ts, extended with a
 * `.transaction()` mock (the fake function's body has no internal `await`
 * before it mutates the in-memory tables, so by the time the array literal
 * passed to `.transaction()` is constructed, every insert in it has already
 * run — good enough to assert on final table state without modeling real
 * Postgres transaction semantics). price_minor comes back as a STRING on
 * every product read, same bigint-over-the-wire behavior as the real Neon
 * driver.
 */

interface FunnelRow {
  slug: string
  clerk_user_id: string
  status: string
  spec: { mode?: string }
}

interface ConnectionRow {
  clerk_user_id: string
  gateway: string
  status: string
}

interface ProductRow {
  id: string
  clerk_user_id: string
  name: string
  price_minor: number
  currency: string
  stock: number
  status: string
}

interface PaymentRow {
  id: string
  clerk_user_id: string
  gateway: string
  amount_minor: number
  currency: string
  status: string
  reference: string
}

interface OrderRow {
  id: string
  clerk_user_id: string
  status: string
  subtotal_minor: number
  currency: string
  payment_id: string
  buyer_name: string
  buyer_email: string | null
  buyer_phone: string
}

interface OrderItemRow {
  id: string
  order_id: string
  product_id: string
  name_snapshot: string
  unit_price_minor: number
  quantity: number
  currency: string
}

const db = {
  funnels: [] as FunnelRow[],
  connections: [] as ConnectionRow[],
  products: [] as ProductRow[],
  payments: [] as PaymentRow[],
  orders: [] as OrderRow[],
  orderItems: [] as OrderItemRow[],
}

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')

  if (text.includes('select clerk_user_id, spec from autoleadss.funnels')) {
    const [slug] = vals as [string]
    return db.funnels.filter((f) => f.slug === slug && f.status === 'published').map((f) => ({ clerk_user_id: f.clerk_user_id, spec: f.spec }))
  }
  if (text.includes('select gateway from autoleadss.payment_connections')) {
    const [ownerId] = vals as [string]
    return db.connections.filter((c) => c.clerk_user_id === ownerId && c.status === 'connected').map((c) => ({ gateway: c.gateway }))
  }
  if (text.includes('select id, name, price_minor, currency, stock, status from autoleadss.products')) {
    const [productId, ownerId] = vals as [string, string]
    return db.products
      .filter((p) => p.id === productId && p.clerk_user_id === ownerId)
      .map((p) => ({ id: p.id, name: p.name, price_minor: String(p.price_minor), currency: p.currency, stock: p.stock, status: p.status }))
  }
  if (text.includes('insert into autoleadss.payments')) {
    const [id, clerk_user_id, gateway, amount_minor, currency, reference] = vals as [string, string, string, number, string, string]
    db.payments.push({ id, clerk_user_id, gateway, amount_minor, currency, status: 'pending', reference })
    return []
  }
  if (text.includes('insert into autoleadss.orders')) {
    const [id, clerk_user_id, subtotal_minor, currency, payment_id, buyer_name, buyer_email, buyer_phone] = vals as [
      string, string, number, string, string, string, string | null, string,
    ]
    db.orders.push({ id, clerk_user_id, status: 'pending', subtotal_minor, currency, payment_id, buyer_name, buyer_email, buyer_phone })
    return []
  }
  if (text.includes('insert into autoleadss.order_items')) {
    const [id, order_id, product_id, name_snapshot, unit_price_minor, quantity, currency] = vals as [
      string, string, string, string, number, number, string,
    ]
    db.orderItems.push({ id, order_id, product_id, name_snapshot, unit_price_minor, quantity, currency })
    return []
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}
;(fakeSql as unknown as { transaction: (queries: Promise<unknown>[]) => Promise<unknown> }).transaction = (queries) => Promise.all(queries)

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

const { default: handler } = await import('./order')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, body: unknown = {}) {
  return { method, query: {}, body, headers: {} } as any
}

const BUYER = { name: 'Sara', phone: '+971500000000' }

function seedSellSite(overrides: Partial<FunnelRow> = {}) {
  db.funnels.push({ slug: 'noor', clerk_user_id: 'merchant_A', status: 'published', spec: { mode: 'sell' }, ...overrides })
}

function seedFakeGatewayConnected(ownerId = 'merchant_A') {
  db.connections.push({ clerk_user_id: ownerId, gateway: 'fake', status: 'connected' })
}

function seedProduct(overrides: Partial<ProductRow> = {}) {
  db.products.push({ id: 'prod_1', clerk_user_id: 'merchant_A', name: 'Oud Tote', price_minor: 5000, currency: 'AED', stock: 10, status: 'active', ...overrides })
}

beforeEach(() => {
  db.funnels = []
  db.connections = []
  db.products = []
  db.payments = []
  db.orders = []
  db.orderItems = []
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
  delete process.env.PAYMENTS_FAKE_ADAPTER
})

function totalRowCount() {
  return db.payments.length + db.orders.length + db.orderItems.length
}

describe('method + config guards', () => {
  it('405s on non-POST', async () => {
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(405)
  })

  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [], buyer: BUYER }), r)
    expect(r.statusCode).toBe(501)
  })
})

describe('site resolution', () => {
  it('404s when the slug does not exist', async () => {
    const r = res()
    await handler(req('POST', { slug: 'nope', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(404)
    expect(totalRowCount()).toBe(0)
  })

  it('404s when the site exists but is not sell mode', async () => {
    seedSellSite({ spec: { mode: 'capture' } })
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(404)
  })
})

describe('gateway gate (fail-closed)', () => {
  it('409s with payments_not_connected and writes ZERO rows when no gateway is connected at all', async () => {
    seedSellSite()
    seedProduct()
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(409)
    expect(r.body).toEqual({ error: 'payments_not_connected' })
    expect(totalRowCount()).toBe(0)
  })

  it('409s and writes ZERO rows when a gateway is connected but not implemented (every real gateway today)', async () => {
    seedSellSite()
    seedProduct()
    db.connections.push({ clerk_user_id: 'merchant_A', gateway: 'tap', status: 'connected' })
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(409)
    expect(totalRowCount()).toBe(0)
  })

  it('succeeds once the fake (test-only, PAYMENTS_FAKE_ADAPTER=1) gateway is connected', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedProduct()
    seedFakeGatewayConnected()
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(201)
    expect(db.orders).toHaveLength(1)
    expect(db.orders[0].status).toBe('pending') // never 'paid' from this route
  })
})

describe('price tampering', () => {
  it('ignores whatever price/amount the client sends — the persisted order total is the sum of STORED prices', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedProduct({ price_minor: 5000 }) // real price: AED 50.00
    seedFakeGatewayConnected()

    const r = res()
    await handler(
      req('POST', {
        slug: 'noor',
        items: [{ productId: 'prod_1', quantity: 2, price: 1, amount: 1 }], // client claims AED 0.01
        buyer: BUYER,
      }),
      r,
    )
    expect(r.statusCode).toBe(201)
    expect(db.orders[0].subtotal_minor).toBe(10000) // 5000 * 2, not the client's claimed price
    expect(db.orderItems[0].unit_price_minor).toBe(5000)
  })
})

describe('cross-owner isolation', () => {
  it("400s and writes nothing when a product id belongs to a different merchant", async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    db.products.push({ id: 'prod_other', clerk_user_id: 'merchant_B', name: 'Not yours', price_minor: 1000, currency: 'AED', stock: 5, status: 'active' })

    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_other', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(400)
    expect(totalRowCount()).toBe(0)
  })
})

describe('draft/archived products are not purchasable', () => {
  it.each(['draft', 'archived'])('400s and writes nothing for a %s product', async (status) => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    seedProduct({ status })

    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(400)
    expect(totalRowCount()).toBe(0)
  })
})

describe('stock', () => {
  it('refuses an order exceeding available stock, writing nothing', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    seedProduct({ stock: 2 })

    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 3 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(400)
    expect(totalRowCount()).toBe(0)
  })

  it('does NOT decrement stock on a successful (pending) order', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    seedProduct({ stock: 5 })

    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 2 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(201)
    expect(db.products.find((p) => p.id === 'prod_1')!.stock).toBe(5) // unchanged — decrement belongs to payment confirmation
  })
})

describe('quantity validation', () => {
  it.each([0, -1, 1.5, 20000])('rejects quantity %s, writing nothing', async (quantity) => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    seedProduct()

    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(400)
    expect(totalRowCount()).toBe(0)
  })
})

describe('mixed currencies', () => {
  it('400s when items span more than one currency', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    seedProduct({ id: 'prod_aed', currency: 'AED' })
    seedProduct({ id: 'prod_usd', currency: 'USD' })

    const r = res()
    await handler(
      req('POST', { slug: 'noor', items: [{ productId: 'prod_aed', quantity: 1 }, { productId: 'prod_usd', quantity: 1 }], buyer: BUYER }),
      r,
    )
    expect(r.statusCode).toBe(400)
    expect(totalRowCount()).toBe(0)
  })
})

describe('order items snapshot name + unit price', () => {
  it('records the name and price AS SOLD at order time', async () => {
    process.env.PAYMENTS_FAKE_ADAPTER = '1'
    seedSellSite()
    seedFakeGatewayConnected()
    seedProduct({ id: 'prod_1', name: 'Oud Leather Tote', price_minor: 240050 })

    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: BUYER }), r)
    expect(r.statusCode).toBe(201)
    expect(db.orderItems[0]).toMatchObject({ name_snapshot: 'Oud Leather Tote', unit_price_minor: 240050, quantity: 1 })
  })
})

describe('buyer validation', () => {
  it('400s when buyer name/phone are missing', async () => {
    seedSellSite()
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [{ productId: 'prod_1', quantity: 1 }], buyer: { name: '', phone: '' } }), r)
    expect(r.statusCode).toBe(400)
  })

  it('400s when items array is empty', async () => {
    seedSellSite()
    const r = res()
    await handler(req('POST', { slug: 'noor', items: [], buyer: BUYER }), r)
    expect(r.statusCode).toBe(400)
  })
})
