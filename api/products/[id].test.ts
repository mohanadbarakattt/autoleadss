import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/products/[id].ts tests — PATCH/DELETE ownership isolation and the
 * delete-archives-if-referenced rule. `sql.query(text, values)` (used by the
 * PATCH whitelist-column path, same pattern as api/funnels/[id].ts) has no
 * existing fake-harness precedent in this repo, so this file's fakeSql
 * exposes a `.query` method that parses the `col = $N` / `id = $N` shapes the
 * route actually generates — generic enough to track the real interpolation
 * without hardcoding which columns a given test patches. */

interface Row {
  id: string
  clerk_user_id: string
  name: string
  description: string | null
  image_url: string | null
  price_minor: number
  currency: string
  stock: number
  status: string
  updated_at: string
}

interface OrderItemRow {
  id: string
  product_id: string
}

const db = { products: [] as Row[], orderItems: [] as OrderItemRow[] }

function seedProduct(over: Partial<Row> & { id: string; clerk_user_id: string }): Row {
  const row: Row = {
    name: 'Product',
    description: null,
    image_url: null,
    price_minor: 1000,
    currency: 'AED',
    stock: 3,
    status: 'active',
    updated_at: new Date().toISOString(),
    ...over,
  }
  db.products.push(row)
  return row
}

async function taggedSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')

  if (text.includes('select 1 from autoleadss.order_items oi')) {
    const [productId, userId] = vals as [string, string]
    const owns = db.products.some((p) => p.id === productId && p.clerk_user_id === userId)
    const referenced = owns && db.orderItems.some((oi) => oi.product_id === productId)
    return referenced ? [{ '?column?': 1 }] : []
  }
  if (text.includes("update autoleadss.products set status = 'archived'")) {
    const [id, userId] = vals as [string, string]
    const row = db.products.find((p) => p.id === id && p.clerk_user_id === userId)
    if (row) row.status = 'archived'
    return []
  }
  if (text.includes('delete from autoleadss.products')) {
    const [id, userId] = vals as [string, string]
    db.products = db.products.filter((p) => !(p.id === id && p.clerk_user_id === userId))
    return []
  }
  throw new Error(`fake db: unmocked tagged-template shape: ${text}`)
}

/** Parses `update autoleadss.products set col1 = $1, col2 = $2 where id = $3
 * and clerk_user_id = $4` against the positional `values` array — mirrors
 * exactly what api/products/[id].ts's PATCH handler builds. */
async function fakeQuery(text: string, values: unknown[]) {
  if (!text.startsWith('update autoleadss.products set ')) throw new Error(`fake db: unmocked .query shape: ${text}`)
  const setClause = text.slice('update autoleadss.products set '.length, text.indexOf(' where'))
  const whereClause = text.slice(text.indexOf(' where'))
  const at = (placeholder: string) => values[Number(placeholder.slice(1)) - 1]

  const idPh = /id = (\$\d+)/.exec(whereClause)![1]
  const ownerPh = /clerk_user_id = (\$\d+)/.exec(whereClause)![1]
  const row = db.products.find((p) => p.id === at(idPh) && p.clerk_user_id === at(ownerPh))
  if (!row) return []

  for (const assignment of setClause.split(', ')) {
    const [rawCol, placeholder] = assignment.split(' = ')
    const col = rawCol.trim() as keyof Row
    ;(row as any)[col] = at(placeholder.trim())
  }
  return []
}

const fakeSql = Object.assign(taggedSql, { query: fakeQuery })
vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

let currentUser: string | null = 'user_A'
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./[id]')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, id: string, body: unknown = {}) {
  return { method, query: { id }, body, headers: {} } as any
}

beforeEach(() => {
  db.products = []
  db.orderItems = []
  currentUser = 'user_A'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
  seedProduct({ id: 'prod_a', clerk_user_id: 'user_A' })
  seedProduct({ id: 'prod_b', clerk_user_id: 'user_B' })
})

describe('auth', () => {
  it('401s when there is no authenticated Clerk user', async () => {
    currentUser = null
    const r = res()
    await handler(req('PATCH', 'prod_a', { name: 'x' }), r)
    expect(r.statusCode).toBe(401)
  })
})

describe('fail-closed config', () => {
  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('PATCH', 'prod_a', { name: 'x' }), r)
    expect(r.statusCode).toBe(501)
  })
})

describe('PATCH', () => {
  it('updates whitelisted fields for the owner', async () => {
    const r = res()
    await handler(req('PATCH', 'prod_a', { name: 'New name', priceMinor: 5000, currency: 'usd', stock: 9, status: 'active' }), r)
    expect(r.statusCode).toBe(200)
    const row = db.products.find((p) => p.id === 'prod_a')!
    expect(row).toMatchObject({ name: 'New name', price_minor: 5000, currency: 'USD', stock: 9, status: 'active' })
  })

  it("user A cannot PATCH user B's product — the row is untouched", async () => {
    const r = res()
    await handler(req('PATCH', 'prod_b', { name: 'Hijacked' }), r)
    expect(r.statusCode).toBe(200) // matches the funnels/[id].ts template: no existence check, 0 rows affected
    expect(db.products.find((p) => p.id === 'prod_b')!.name).toBe('Product')
  })

  it('rejects an empty name', async () => {
    const r = res()
    await handler(req('PATCH', 'prod_a', { name: '   ' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a non-integer priceMinor', async () => {
    const r = res()
    await handler(req('PATCH', 'prod_a', { priceMinor: 10.5 }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects an invalid currency', async () => {
    const r = res()
    await handler(req('PATCH', 'prod_a', { currency: 'A1' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects negative stock', async () => {
    const r = res()
    await handler(req('PATCH', 'prod_a', { stock: -1 }), r)
    expect(r.statusCode).toBe(400)
  })
})

describe('DELETE', () => {
  it('hard-deletes a product with no order history', async () => {
    const r = res()
    await handler(req('DELETE', 'prod_a'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).action).toBe('deleted')
    expect(db.products.find((p) => p.id === 'prod_a')).toBeUndefined()
  })

  it('archives instead of deleting when the product is referenced by an order_item', async () => {
    db.orderItems.push({ id: 'oi_1', product_id: 'prod_a' })
    const r = res()
    await handler(req('DELETE', 'prod_a'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).action).toBe('archived')
    expect(db.products.find((p) => p.id === 'prod_a')?.status).toBe('archived')
  })

  it("user A cannot DELETE user B's product", async () => {
    const r = res()
    await handler(req('DELETE', 'prod_b'), r)
    expect(r.statusCode).toBe(200) // 0 rows affected, same no-existence-check template as PATCH
    expect(db.products.find((p) => p.id === 'prod_b')).toBeDefined()
  })

  it("probing another user's referenced product id leaks nothing: it just falls through to a 0-row delete, never archives someone else's product", async () => {
    db.orderItems.push({ id: 'oi_2', product_id: 'prod_b' }) // prod_b belongs to user_B and IS referenced
    const r = res()
    await handler(req('DELETE', 'prod_b'), r) // still logged in as user_A
    expect(r.statusCode).toBe(200)
    expect((r.body as any).action).toBe('deleted') // not "archived" — the join is owner-scoped
    expect(db.products.find((p) => p.id === 'prod_b')?.status).not.toBe('archived') // B's row untouched
  })
})
