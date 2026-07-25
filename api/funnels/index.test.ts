import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * Narrow test coverage — api/funnels/index.ts had no dedicated test file
 * before Phase 6, and its pre-existing create/list behavior is out of scope
 * here. This file covers only what Phase 6 added: `sub_account_id`
 * round-tripping through create+list, and ownership validation on create
 * (a caller must not be able to attach their funnel to another agency's
 * sub-account — see api/_lib/agency.ts's `subAccountBelongsToCaller`).
 */

const state: { rows: unknown[][]; queries: string[]; values: unknown[][] } = { rows: [], queries: [], values: [] }
let currentUser: string | null = 'user_1'

vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray, ...vals: unknown[]) => { state.queries.push(s.join('?')); state.values.push(vals); return state.rows.shift() ?? [] }),
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
  state.values = []
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

// The write-side half of the SEC1 stored-XSS fix — sanitizeFunnelSpec itself
// is unit-tested in api/_lib/funnelSpec.test.ts; this proves POST (create),
// not just PATCH, routes a caller-supplied spec through it. A caller hitting
// this endpoint directly (not through the Editor's create-then-patch flow)
// must not be able to smuggle a bad ctaHref through on create.
describe('POST /api/funnels — spec sanitization on write (SEC1)', () => {
  it('strips a javascript: ctaHref before persisting on create', async () => {
    state.rows = [[]] // the insert
    const r = res()
    await handler(req('POST', baseFunnel({ spec: { page: { thankYou: { headline: 'Thanks', body: 'Body', ctaHref: 'javascript:alert(1)' } } } })), r)
    expect(r.statusCode).toBe(201)
    const persistedSpec = JSON.parse(state.values[0].find((v) => typeof v === 'string' && v.includes('"page"')) as string)
    expect(persistedSpec.page.thankYou.ctaHref).toBeUndefined()
  })

  it('keeps a valid https ctaHref on create', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('POST', baseFunnel({ spec: { page: { thankYou: { headline: 'Thanks', body: 'Body', ctaHref: 'https://example.com/book' } } } })), r)
    expect(r.statusCode).toBe(201)
    const persistedSpec = JSON.parse(state.values[0].find((v) => typeof v === 'string' && v.includes('"page"')) as string)
    expect(persistedSpec.page.thankYou.ctaHref).toBe('https://example.com/book')
  })
})
