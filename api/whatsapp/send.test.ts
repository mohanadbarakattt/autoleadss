import { describe, expect, it, vi, beforeEach } from 'vitest'

const state: { rows: unknown[][]; queries: string[] } = { rows: [], queries: [] }
vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray) => { state.queries.push(s.join('?')); return state.rows.shift() ?? [] }),
}))
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => 'user_1' }))

const { default: handler } = await import('./send')

function res() {
  const r: any = { statusCode: 0, body: undefined }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}
const CONN = { id: 'conn1', phone_number_id: 'PN1', access_token: '' }

beforeEach(() => {
  state.rows = []; state.queries = []
  delete process.env.WHATSAPP_AUTO_REPLY
  delete process.env.WHATSAPP_ACCESS_TOKEN
})

describe('outbound send', () => {
  it('BLOCKS an automatic send unless the owner explicitly enabled it', async () => {
    // Outbound messages to real customers are irreversible; an agent must not
    // decide to send one on its own.
    const r = res()
    await handler({ method: 'POST', body: { connectionId: 'conn1', to: '+201', text: 'hi', auto: true } } as any, r)
    expect(r.statusCode).toBe(403)
    expect((r.body as any).error).toBe('auto_reply_disabled')
    expect(state.queries).toHaveLength(0)
  })

  it('allows an automatic send once WHATSAPP_AUTO_REPLY=on', async () => {
    process.env.WHATSAPP_AUTO_REPLY = 'on'
    state.rows = [[CONN], [{ ok: 1 }], []]
    const r = res()
    await handler({ method: 'POST', body: { connectionId: 'conn1', to: '+201', text: 'hi', auto: true } } as any, r)
    expect(r.statusCode).toBe(200)
  })

  it('refuses to send outside the 24h window instead of letting Meta reject it', async () => {
    state.rows = [[CONN], []] // connection found, window closed
    const r = res()
    await handler({ method: 'POST', body: { connectionId: 'conn1', to: '+201', text: 'hi' } } as any, r)
    expect(r.statusCode).toBe(409)
    expect((r.body as any).error).toBe('service_window_closed')
  })

  it('never sends from another workspace\'s number', async () => {
    state.rows = [[]] // ownership query returns nothing
    const r = res()
    await handler({ method: 'POST', body: { connectionId: 'someone-elses', to: '+201', text: 'hi' } } as any, r)
    expect(r.statusCode).toBe(404)
  })

  it('works keyless in demo mode without calling Meta', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    state.rows = [[CONN], [{ ok: 1 }], []]
    const r = res()
    await handler({ method: 'POST', body: { connectionId: 'conn1', to: '+201', text: 'hi' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).live).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('does NOT record the message when the provider rejects it', async () => {
    // Recording a send the customer never received would make the inbox lie.
    process.env.WHATSAPP_ACCESS_TOKEN = 'tok'
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 400 }) as never)
    state.rows = [[CONN], [{ ok: 1 }]]
    const r = res()
    await handler({ method: 'POST', body: { connectionId: 'conn1', to: '+201', text: 'hi' } } as any, r)
    expect(r.statusCode).toBe(502)
    expect(state.queries.some((q) => q.includes('insert into autoleadss.whatsapp_messages'))).toBe(false)
    vi.restoreAllMocks(); spy.mockRestore()
  })
})
