import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * Narrow test coverage — api/funnels/index.ts had no dedicated test file
 * before Phase 6, and its pre-existing create/list behavior is out of scope
 * here. This file covers only what Phase 6 added: `sub_account_id`
 * round-tripping through create+list, and ownership validation on create
 * (a caller must not be able to attach their funnel to another agency's
 * sub-account — see api/_lib/agency.ts's `subAccountBelongsToCaller`).
 */

const state: { rows: unknown[][]; queries: string[] } = { rows: [], queries: [] }
let currentUser: string | null = 'user_1'

vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray) => { state.queries.push(s.join('?')); return state.rows.shift() ?? [] }),
}))
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./index')

function res() {
  const r: any = { statusCode: 0, body: undefined }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, body?: unknown) {
  return { method, query: {}, body: body ?? {}, headers: {} } as any
}

function baseFunnel(over: Record<string, unknown> = {}) {
  return { id: 'f_1', name: 'Test Site', slug: 'test-site', industry: 'services', language: 'en', ...over }
}

beforeEach(() => {
  state.rows = []
  state.queries = []
  currentUser = 'user_1'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('GET /api/funnels — sub_account_id round-trips through the list query', () => {
  it('includes sub_account_id in the SELECT and maps it to subAccountId', async () => {
    state.rows = [
      [{ id: 'f_1', name: 'Site', slug: 'site', industry: 'services', language: 'en', status: 'published', accent: '#FF5C2A', spec: {}, visits: 0, visits_by_day: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', sub_account_id: 'sa_1' }],
      [], // leads query
    ]
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).funnels[0].subAccountId).toBe('sa_1')
    expect(state.queries[0]).toContain('sub_account_id')
  })
})

describe('POST /api/funnels — subAccountId ownership validation', () => {
  it('creates a funnel with no subAccountId (unassigned) without any ownership check', async () => {
    state.rows = [[]] // the insert
    const r = res()
    await handler(req('POST', baseFunnel()), r)
    expect(r.statusCode).toBe(201)
  })

  it('creates a funnel with a subAccountId that belongs to the caller', async () => {
    state.rows = [[{ x: 1 }], []] // ownership check finds a row, then the insert
    const r = res()
    await handler(req('POST', baseFunnel({ subAccountId: 'sa_mine' })), r)
    expect(r.statusCode).toBe(201)
    expect(state.queries[0]).toContain('autoleadss.sub_accounts')
    expect(state.queries[0]).toContain('clerk_user_id')
  })

  it('rejects a subAccountId that does not belong to the caller — never attaches to another agency\'s bucket', async () => {
    state.rows = [[]] // ownership check finds nothing
    const r = res()
    await handler(req('POST', baseFunnel({ subAccountId: 'someone-elses-sub-account' })), r)
    expect(r.statusCode).toBe(400)
    // Only the ownership-check query ran — never an insert.
    expect(state.queries).toHaveLength(1)
  })
})
