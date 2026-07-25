import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * Narrow test coverage — api/funnels/[id].ts had no dedicated test file
 * before Phase 6. This file covers only what Phase 6 added: patching
 * `subAccountId` (assign, clear, and ownership validation). Pre-existing
 * patch/delete behavior for the other fields is out of scope here.
 */

const state: { rows: unknown[][]; queries: string[] } = { rows: [], queries: [] }
let currentUser: string | null = 'user_1'

vi.mock('../_lib/db', () => ({
  getSql: () => Object.assign(
    async (s: TemplateStringsArray) => { state.queries.push(s.join('?')); return state.rows.shift() ?? [] },
    { query: async (text: string) => { state.queries.push(text); return state.rows.shift() ?? [] } },
  ),
}))
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./[id]')

function res() {
  const r: any = { statusCode: 0, body: undefined }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, body?: unknown, id = 'f_1') {
  return { method, query: { id }, body: body ?? {}, headers: {} } as any
}

beforeEach(() => {
  state.rows = []
  state.queries = []
  currentUser = 'user_1'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('PATCH /api/funnels/:id — subAccountId', () => {
  it('assigns a subAccountId that belongs to the caller', async () => {
    state.rows = [[{ x: 1 }], []] // ownership check finds a row, then the update
    const r = res()
    await handler(req('PATCH', { subAccountId: 'sa_mine' }), r)
    expect(r.statusCode).toBe(200)
    expect(state.queries[0]).toContain('autoleadss.sub_accounts')
    expect(state.queries[0]).toContain('clerk_user_id')
  })

  it('rejects a subAccountId that does not belong to the caller', async () => {
    state.rows = [[]] // ownership check finds nothing
    const r = res()
    await handler(req('PATCH', { subAccountId: 'not-mine' }), r)
    expect(r.statusCode).toBe(400)
    // Only the ownership-check query ran — never an update.
    expect(state.queries).toHaveLength(1)
  })

  it('clears the assignment with subAccountId: null — no ownership check needed for a clear', async () => {
    state.rows = [[]] // the update
    const r = res()
    await handler(req('PATCH', { subAccountId: null }), r)
    expect(r.statusCode).toBe(200)
    expect(state.queries).toHaveLength(1)
    expect(state.queries[0]).toContain('sub_account_id')
  })

  it('leaves subAccountId untouched when omitted from the patch', async () => {
    state.rows = [[]] // the update (name only)
    const r = res()
    await handler(req('PATCH', { name: 'Renamed' }), r)
    expect(r.statusCode).toBe(200)
    expect(state.queries[0]).not.toContain('sub_account_id')
  })
})
