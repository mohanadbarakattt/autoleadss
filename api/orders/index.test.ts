import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/orders/index.ts tests — GET-only, ownership isolation, newest-first,
 * with items. Same fake-SQL-harness style as api/products/index.test.ts.
 * subtotal_minor/unit_price_minor come back as STRINGS on every read, same
 * bigint-over-the-wire behavior as the real Neon driver. */

interface OrderRow {
  id: string
  clerk_user_id: string
  status: string
  subtotal_minor: number
  currency: string
  payment_id: string | null
  buyer_name: string | null
  buyer_email: string | null
  buyer_phone: string | null
  created_at: string
}

interface ItemRow {
  id: string
  order_id: string
  product_id: string | null
  name_snapshot: string
  unit_price_minor: number
  quantity: number
  currency: string
}

const db = { orders: [] as OrderRow[], items: [] as ItemRow[] }

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('select id, status, subtotal_minor, currency, payment_id, buyer_name, buyer_email, buyer_phone, created_at, updated_at')) {
    const [userId] = vals as [string]
    return db.orders
      .filter((o) => o.clerk_user_id === userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((o) => ({ ...o, subtotal_minor: String(o.subtotal_minor), updated_at: o.created_at }))
  }
  if (text.includes('select oi.id, oi.order_id, oi.product_id, oi.name_snapshot, oi.unit_price_minor, oi.quantity, oi.currency')) {
    const [userId] = vals as [string]
    const ownedOrderIds = new Set(db.orders.filter((o) => o.clerk_user_id === userId).map((o) => o.id))
    return db.items.filter((it) => ownedOrderIds.has(it.order_id)).map((it) => ({ ...it, unit_price_minor: String(it.unit_price_minor) }))
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

let currentUser: string | null = 'user_A'
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./index')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string) {
  return { method, query: {}, body: {}, headers: {} } as any
}

beforeEach(() => {
  db.orders = []
  db.items = []
  currentUser = 'user_A'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('auth', () => {
  it('401s when there is no authenticated Clerk user', async () => {
    currentUser = null
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(401)
  })
})

describe('fail-closed config', () => {
  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(501)
  })
})

describe('method', () => {
  it('405s on POST — no order-creation endpoint exists in this slice', async () => {
    const r = res()
    await handler(req('POST'), r)
    expect(r.statusCode).toBe(405)
  })
})

describe('GET', () => {
  it('returns only the caller\'s orders, newest first, each with its items', async () => {
    db.orders.push(
      { id: 'ord_1', clerk_user_id: 'user_A', status: 'pending', subtotal_minor: 5000, currency: 'AED', payment_id: null, buyer_name: 'Sara', buyer_email: null, buyer_phone: null, created_at: '2026-01-01T00:00:00Z' },
      { id: 'ord_2', clerk_user_id: 'user_A', status: 'pending', subtotal_minor: 3000, currency: 'AED', payment_id: null, buyer_name: 'Amal', buyer_email: null, buyer_phone: null, created_at: '2026-01-02T00:00:00Z' },
      { id: 'ord_other', clerk_user_id: 'user_B', status: 'pending', subtotal_minor: 9000, currency: 'AED', payment_id: null, buyer_name: null, buyer_email: null, buyer_phone: null, created_at: '2026-01-03T00:00:00Z' },
    )
    db.items.push(
      { id: 'it_1', order_id: 'ord_1', product_id: 'prod_1', name_snapshot: 'Oud Tote', unit_price_minor: 5000, quantity: 1, currency: 'AED' },
      { id: 'it_2', order_id: 'ord_other', product_id: 'prod_x', name_snapshot: 'Not mine', unit_price_minor: 9000, quantity: 1, currency: 'AED' },
    )

    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    const orders = (r.body as any).orders

    expect(orders.map((o: any) => o.id)).toEqual(['ord_2', 'ord_1']) // newest first, and no ord_other
    const ord1 = orders.find((o: any) => o.id === 'ord_1')
    expect(ord1.subtotalMinor).toBe(5000) // real number despite the bigint-string wire format
    expect(ord1.items).toEqual([expect.objectContaining({ id: 'it_1', nameSnapshot: 'Oud Tote', unitPriceMinor: 5000, quantity: 1 })])
    const ord2 = orders.find((o: any) => o.id === 'ord_2')
    expect(ord2.items).toEqual([])
  })
})
