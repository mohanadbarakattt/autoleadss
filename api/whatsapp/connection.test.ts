import { describe, expect, it, vi, beforeEach } from 'vitest'

const state: { rows: unknown[][]; queries: string[] } = { rows: [], queries: [] }
let currentUser: string | null = 'user_1'

vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray) => { state.queries.push(s.join('?')); return state.rows.shift() ?? [] }),
}))
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./connection')

function res() {
  const r: any = { statusCode: 0, body: undefined }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

beforeEach(() => {
  state.rows = []
  state.queries = []
  currentUser = 'user_1'
})

describe('GET /api/whatsapp/connection', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler({ method: 'GET', query: { funnelId: 'f1' } } as any, r)
    expect(r.statusCode).toBe(401)
    expect(state.queries).toHaveLength(0)
  })

  it('400s when neither funnelId, conversations, nor messages is given', async () => {
    const r = res()
    await handler({ method: 'GET', query: {} } as any, r)
    expect(r.statusCode).toBe(400)
  })

  it('returns the connection for a funnel, scoped to the caller, with no secret columns in the query', async () => {
    state.rows = [[{ id: 'wac_1', funnel_id: 'f1', phone_number_id: 'PN1', waba_id: null, display_phone: null, status: 'connected' }]]
    const r = res()
    await handler({ method: 'GET', query: { funnelId: 'f1' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).connection.id).toBe('wac_1')
    expect(state.queries[0]).toContain('clerk_user_id')
    expect(state.queries[0]).not.toContain('access_token')
    expect(state.queries[0]).not.toContain('verify_token')
  })

  it('conversations: returns the latest message per contact, scoped to the caller, no secret columns', async () => {
    state.rows = [[{ wa_from: '+201000000001', body: 'hi', direction: 'in', created_at: '2026-01-01T00:00:00Z' }]]
    const r = res()
    await handler({ method: 'GET', query: { conversations: 'conn1' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).conversations).toHaveLength(1)
    expect(state.queries[0]).toContain('clerk_user_id')
    expect(state.queries[0]).not.toContain('access_token')
  })

  it('conversations: never returns another workspace\'s conversations (scoped query yields nothing)', async () => {
    state.rows = [[]] // the clerk_user_id-scoped query found no rows for this caller
    const r = res()
    await handler({ method: 'GET', query: { conversations: 'someone-elses-connection' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).conversations).toEqual([])
  })

  it('messages: 400s without a contact', async () => {
    const r = res()
    await handler({ method: 'GET', query: { messages: 'conn1' } } as any, r)
    expect(r.statusCode).toBe(400)
    expect(state.queries).toHaveLength(0)
  })

  it('messages: returns the full thread with one contact, oldest first, scoped to the caller, no secret columns', async () => {
    state.rows = [[
      { id: 'wam_1', wa_from: '+201000000001', body: 'Hi there', direction: 'in', created_at: '2026-01-01T00:00:00Z' },
      { id: 'wam_2', wa_from: '+201000000001', body: 'Hello, how can I help?', direction: 'out', created_at: '2026-01-01T00:05:00Z' },
    ]]
    const r = res()
    await handler({ method: 'GET', query: { messages: 'conn1', contact: '+201000000001' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).messages).toHaveLength(2)
    expect(state.queries[0]).toContain('clerk_user_id')
    expect(state.queries[0]).toContain('wa_from')
    expect(state.queries[0]).not.toContain('access_token')
    expect(state.queries[0]).not.toContain('verify_token')
  })

  it('messages: never returns another workspace\'s messages (scoped query yields nothing)', async () => {
    state.rows = [[]]
    const r = res()
    await handler({ method: 'GET', query: { messages: 'someone-elses-connection', contact: '+201000000001' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).messages).toEqual([])
  })
})

describe('POST /api/whatsapp/connection', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler({ method: 'POST', query: {}, body: {} } as any, r)
    expect(r.statusCode).toBe(401)
  })

  it('saves a connection for the caller and never echoes the access token back', async () => {
    state.rows = [[]] // the insert/upsert statement
    const r = res()
    await handler({
      method: 'POST',
      query: {},
      body: { funnelId: 'f1', phoneNumberId: 'PN1', accessToken: 'secret-token', verifyToken: 'vt1' },
    } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).id).toBeTruthy()
    expect(JSON.stringify(r.body)).not.toContain('secret-token')
  })
})
