import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/products/index.ts tests. Same fake-SQL-harness style as
 * api/payments/connections.test.ts: mock `../_lib/db` and `../_lib/auth` so
 * each test controls which Clerk user is "logged in", and a tiny in-memory
 * table stands in for Postgres. price_minor is returned as a STRING on every
 * read — same bigint-over-the-wire behavior the real Neon driver has (see
 * api/_lib/money.ts) — so a regression back to trusting it as a number would
 * fail here too. */

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
  created_at: string
  updated_at: string
}

const db = { rows: [] as Row[], seq: 0 }

function nextTimestamp(): string {
  db.seq += 1
  return new Date(2026, 0, 1, 0, 0, db.seq).toISOString()
}

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('select id, name, description, image_url, price_minor, currency, stock, status, created_at, updated_at')) {
    const [userId] = vals as [string]
    return db.rows
      .filter((r) => r.clerk_user_id === userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((r) => ({ ...r, price_minor: String(r.price_minor) }))
  }
  if (text.includes('insert into autoleadss.products')) {
    const [id, userId, name, description, imageUrl, priceMinor, currency, stock, status] = vals as [
      string, string, string, string | null, string | null, number, string, number, string,
    ]
    db.rows.push({
      id,
      clerk_user_id: userId,
      name,
      description,
      image_url: imageUrl,
      price_minor: priceMinor,
      currency,
      stock,
      status,
      created_at: nextTimestamp(),
      updated_at: nextTimestamp(),
    })
    return []
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

function req(method: string, body: unknown = {}) {
  return { method, query: {}, body, headers: {} } as any
}

beforeEach(() => {
  db.rows = []
  db.seq = 0
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

describe('create + list', () => {
  it('creates a product and lists it back with priceMinor as a real number (despite the bigint-string wire format) and an uppercased currency', async () => {
    const create = res()
    await handler(req('POST', { id: 'prod_1', name: 'Oud Tote', priceMinor: 240050, currency: 'aed', stock: 5 }), create)
    expect(create.statusCode).toBe(201)

    const list = res()
    await handler(req('GET'), list)
    expect(list.statusCode).toBe(200)
    expect((list.body as any).products).toEqual([
      expect.objectContaining({ id: 'prod_1', name: 'Oud Tote', priceMinor: 240050, currency: 'AED', stock: 5, status: 'draft' }),
    ])
  })

  it('defaults stock to 0 and status to draft when omitted', async () => {
    await handler(req('POST', { id: 'prod_2', name: 'Minimal', priceMinor: 100, currency: 'USD' }), res())
    const list = res()
    await handler(req('GET'), list)
    expect((list.body as any).products[0]).toMatchObject({ stock: 0, status: 'draft' })
  })
})

describe('write validation', () => {
  it('rejects a non-integer priceMinor', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: 'Bad', priceMinor: 10.5, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.rows).toHaveLength(0)
  })

  it('rejects a zero priceMinor', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: 'Bad', priceMinor: 0, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a negative priceMinor', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: 'Bad', priceMinor: -500, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a currency that is not a 3-letter code', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: 'Bad', priceMinor: 100, currency: 'AE' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects negative stock', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: 'Bad', priceMinor: 100, currency: 'AED', stock: -1 }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a javascript: imageUrl (SEC1 — rendered as a public <img src> / og:image)', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: 'Bad', priceMinor: 100, currency: 'AED', imageUrl: 'javascript:alert(1)' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.rows).toHaveLength(0)
  })

  it('accepts a valid https imageUrl', async () => {
    const create = res()
    await handler(req('POST', { id: 'prod_ok', name: 'Good', priceMinor: 100, currency: 'AED', imageUrl: 'https://example.com/tote.jpg' }), create)
    expect(create.statusCode).toBe(201)
    const list = res()
    await handler(req('GET'), list)
    expect((list.body as any).products[0]).toMatchObject({ imageUrl: 'https://example.com/tote.jpg' })
  })

  it('rejects an empty/whitespace-only name', async () => {
    const r = res()
    await handler(req('POST', { id: 'prod_bad', name: '   ', priceMinor: 100, currency: 'AED' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.rows).toHaveLength(0)
  })
})

describe('cross-user isolation', () => {
  it("user A never sees user B's products in the list", async () => {
    currentUser = 'user_B'
    await handler(req('POST', { id: 'prod_b', name: "B's product", priceMinor: 100, currency: 'AED' }), res())

    currentUser = 'user_A'
    const list = res()
    await handler(req('GET'), list)
    expect((list.body as any).products).toEqual([])
  })
})
