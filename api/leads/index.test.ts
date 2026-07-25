import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/leads/index.ts tests — cross-site lead list. Same fake-SQL-harness style
 * as api/orders/index.test.ts, except this endpoint uses `sql.query(text, params)`
 * (not the tagged template) to build an optional status/funnelId where clause, so
 * the fake here mocks `.query` and infers which filters were applied from the
 * query text — mirroring how the real handler decides which params to append. */

interface LeadRow {
  id: string
  funnel_id: string
  clerk_user_id: string
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  source: string
  status: string
  created_at: string
}

interface FunnelRow {
  id: string
  name: string
}

const db = { leads: [] as LeadRow[], funnels: [] as FunnelRow[] }

async function fakeQuery(text: string, params: unknown[] = []) {
  if (!text.includes('from autoleadss.leads l')) throw new Error(`fake db: unmocked query shape: ${text}`)

  let i = 0
  const userId = params[i++] as string
  const status = text.includes('l.status = $') ? (params[i++] as string) : undefined
  const funnelId = text.includes('l.funnel_id = $') ? (params[i++] as string) : undefined
  const limit = params[i++] as number
  const offset = params[i++] as number

  let rows = db.leads.filter((l) => l.clerk_user_id === userId)
  if (status !== undefined) rows = rows.filter((l) => l.status === status)
  if (funnelId !== undefined) rows = rows.filter((l) => l.funnel_id === funnelId)
  rows = rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(offset, offset + limit)

  return rows.map((l) => ({ ...l, funnel_name: db.funnels.find((f) => f.id === l.funnel_id)?.name ?? '' }))
}

vi.mock('../_lib/db', () => ({ getSql: () => ({ query: fakeQuery }) }))

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

function req(method: string, query: Record<string, string> = {}) {
  return { method, query, body: {}, headers: {} } as any
}

beforeEach(() => {
  db.leads = []
  db.funnels = [
    { id: 'f_1', name: 'Marina Realty' },
    { id: 'f_2', name: 'Sunset Salon' },
  ]
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
  it('405s on POST', async () => {
    const r = res()
    await handler(req('POST'), r)
    expect(r.statusCode).toBe(405)
  })
})

describe('GET', () => {
  it("returns only the caller's leads, newest first, each carrying its funnel's id + name", async () => {
    db.leads.push(
      { id: 'l_1', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'Sara', phone: '+971500000001', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-01T00:00:00Z' },
      { id: 'l_2', funnel_id: 'f_2', clerk_user_id: 'user_A', name: 'Amal', phone: '+971500000002', email: null, message: null, source: 'whatsapp', status: 'won', created_at: '2026-01-02T00:00:00Z' },
      { id: 'l_other', funnel_id: 'f_1', clerk_user_id: 'user_B', name: 'Not mine', phone: '+971500000003', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-03T00:00:00Z' },
    )

    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    const leads = (r.body as any).leads

    expect(leads.map((l: any) => l.id)).toEqual(['l_2', 'l_1']) // newest first, and no l_other
    expect(leads[0]).toMatchObject({ id: 'l_2', funnelId: 'f_2', funnelName: 'Sunset Salon' })
    expect(leads[1]).toMatchObject({ id: 'l_1', funnelId: 'f_1', funnelName: 'Marina Realty' })
  })

  it('filters by status', async () => {
    db.leads.push(
      { id: 'l_1', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'Sara', phone: '1', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-01T00:00:00Z' },
      { id: 'l_2', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'Amal', phone: '2', email: null, message: null, source: 'page', status: 'won', created_at: '2026-01-02T00:00:00Z' },
    )
    const r = res()
    await handler(req('GET', { status: 'won' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).leads.map((l: any) => l.id)).toEqual(['l_2'])
  })

  it('rejects an invalid status', async () => {
    const r = res()
    await handler(req('GET', { status: 'bogus' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('filters by funnelId', async () => {
    db.leads.push(
      { id: 'l_1', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'Sara', phone: '1', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-01T00:00:00Z' },
      { id: 'l_2', funnel_id: 'f_2', clerk_user_id: 'user_A', name: 'Amal', phone: '2', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-02T00:00:00Z' },
    )
    const r = res()
    await handler(req('GET', { funnelId: 'f_2' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).leads.map((l: any) => l.id)).toEqual(['l_2'])
  })

  it('supports limit + offset pagination', async () => {
    db.leads.push(
      { id: 'l_1', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'A', phone: '1', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-01T00:00:00Z' },
      { id: 'l_2', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'B', phone: '2', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-02T00:00:00Z' },
      { id: 'l_3', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'C', phone: '3', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-03T00:00:00Z' },
    )
    const r = res()
    await handler(req('GET', { limit: '1', offset: '1' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).leads.map((l: any) => l.id)).toEqual(['l_2']) // 2nd-newest
  })
})

describe('limit/offset validation', () => {
  it('rejects a non-integer limit', async () => {
    const r = res()
    await handler(req('GET', { limit: 'abc' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a negative limit', async () => {
    const r = res()
    await handler(req('GET', { limit: '-5' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a zero limit', async () => {
    const r = res()
    await handler(req('GET', { limit: '0' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a limit above the hard server-side max (a caller must not be able to request 10 million rows)', async () => {
    const r = res()
    await handler(req('GET', { limit: '10000000' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('accepts a limit at the hard max', async () => {
    const r = res()
    await handler(req('GET', { limit: '200' }), r)
    expect(r.statusCode).toBe(200)
  })

  it('rejects a non-integer offset', async () => {
    const r = res()
    await handler(req('GET', { offset: 'abc' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a negative offset', async () => {
    const r = res()
    await handler(req('GET', { offset: '-1' }), r)
    expect(r.statusCode).toBe(400)
  })
})

describe('cross-user isolation', () => {
  it("user A never sees user B's leads via any filter combination", async () => {
    db.leads.push(
      { id: 'l_a', funnel_id: 'f_1', clerk_user_id: 'user_A', name: 'A', phone: '1', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-01T00:00:00Z' },
      { id: 'l_b', funnel_id: 'f_1', clerk_user_id: 'user_B', name: 'B', phone: '2', email: null, message: null, source: 'page', status: 'new', created_at: '2026-01-02T00:00:00Z' },
    )
    currentUser = 'user_B'
    const asB = res()
    await handler(req('GET'), asB)
    expect((asB.body as any).leads.map((l: any) => l.id)).toEqual(['l_b'])

    currentUser = 'user_A'
    const asA = res()
    await handler(req('GET', { status: 'new' }), asA)
    expect((asA.body as any).leads.map((l: any) => l.id)).toEqual(['l_a'])
  })
})
