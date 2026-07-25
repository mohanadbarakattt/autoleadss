import { describe, expect, it, vi, beforeEach } from 'vitest'

const state: { rows: unknown[][]; queries: string[] } = { rows: [], queries: [] }
let currentUser: string | null = 'user_1'

vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray) => { state.queries.push(s.join('?')); return state.rows.shift() ?? [] }),
}))
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./sub-accounts')

function res() {
  const r: any = { statusCode: 0, body: undefined }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, opts: { query?: Record<string, string>; body?: unknown } = {}) {
  return { method, query: opts.query ?? {}, body: opts.body ?? {}, headers: {} } as any
}

beforeEach(() => {
  state.rows = []
  state.queries = []
  currentUser = 'user_1'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('GET /api/agency/sub-accounts', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(401)
    expect(state.queries).toHaveLength(0)
  })

  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(501)
  })

  it("lists the caller's own sub-accounts, scoped by clerk_user_id, oldest first", async () => {
    state.rows = [[
      { id: 'sa_1', name: 'Client One', contact_email: 'one@example.com', created_at: '2026-01-01T00:00:00Z' },
      { id: 'sa_2', name: 'Client Two', contact_email: null, created_at: '2026-01-02T00:00:00Z' },
    ]]
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).subAccounts).toHaveLength(2)
    expect((r.body as any).subAccounts[0]).toEqual({ id: 'sa_1', name: 'Client One', contactEmail: 'one@example.com', createdAt: Date.parse('2026-01-01T00:00:00Z') })
    expect(state.queries[0]).toContain('clerk_user_id')
    expect(state.queries[0]).toContain('order by created_at asc')
  })

  it('never returns another caller\'s sub-accounts (scoped query yields nothing)', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('GET'), r)
    expect((r.body as any).subAccounts).toEqual([])
  })
})

describe('POST /api/agency/sub-accounts', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler(req('POST', { body: { id: 'sa_x', name: 'X' } }), r)
    expect(r.statusCode).toBe(401)
  })

  it('400s when id or name is missing', async () => {
    const r = res()
    await handler(req('POST', { body: { id: 'sa_1' } }), r)
    expect(r.statusCode).toBe(400)
    expect(state.queries).toHaveLength(0)
  })

  it('400s when name is only whitespace', async () => {
    const r = res()
    await handler(req('POST', { body: { id: 'sa_1', name: '   ' } }), r)
    expect(r.statusCode).toBe(400)
  })

  it('400s on an oversized name', async () => {
    const r = res()
    await handler(req('POST', { body: { id: 'sa_1', name: 'x'.repeat(121) } }), r)
    expect(r.statusCode).toBe(400)
  })

  it('creates a sub-account scoped to the caller and echoes the id', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('POST', { body: { id: 'sa_new', name: 'New Client', contactEmail: 'new@example.com' } }), r)
    expect(r.statusCode).toBe(201)
    expect((r.body as any).id).toBe('sa_new')
    expect(state.queries[0]).toContain('clerk_user_id')
  })
})

describe('DELETE /api/agency/sub-accounts — the sites-are-never-orphaned guarantee', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler(req('DELETE', { query: { id: 'sa_1' } }), r)
    expect(r.statusCode).toBe(401)
  })

  it('400s without an id', async () => {
    const r = res()
    await handler(req('DELETE'), r)
    expect(r.statusCode).toBe(400)
  })

  it('deletes only the caller\'s own sub-account row — the DB\'s `on delete set null` FK (migration 0008_agency.sql) reassigns any of its funnels to unassigned automatically, never deleting them', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('DELETE', { query: { id: 'sa_1' } }), r)
    expect(r.statusCode).toBe(200)
    expect(state.queries[0]).toContain('delete from autoleadss.sub_accounts')
    expect(state.queries[0]).toContain('clerk_user_id')
    // Never a delete/update against autoleadss.funnels — the FK does that reconciliation, not this handler.
    expect(state.queries.some((q) => q.includes('autoleadss.funnels'))).toBe(false)
  })
})

it('405s on an unsupported method', async () => {
  const r = res()
  await handler(req('PATCH'), r)
  expect(r.statusCode).toBe(405)
})
