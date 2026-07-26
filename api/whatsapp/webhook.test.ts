import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'

const SECRET = 'test-app-secret'
const state: { rows: unknown[][]; queries: string[]; throwAt: number | null } = { rows: [], queries: [], throwAt: null }

vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray) => {
    state.queries.push(s.join('?'))
    if (state.throwAt !== null && state.queries.length > state.throwAt) throw new Error('db down')
    return state.rows.shift() ?? []
  }),
}))

const { default: handler } = await import('./webhook')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = (k: string, v: string) => { r.headers[k] = v }
  return r
}
const sign = (body: string) => 'sha256=' + createHmac('sha256', SECRET).update(body).digest('hex')

function inbound(msgId: string, from = '+201000000001') {
  return JSON.stringify({
    entry: [{ changes: [{ value: {
      metadata: { phone_number_id: 'PN1' },
      messages: [{ from, id: msgId, type: 'text', text: { body: 'ezayak' } }],
    } }] }],
  })
}

beforeEach(() => {
  state.rows = []; state.queries = []; state.throwAt = null
  process.env.WHATSAPP_APP_SECRET = SECRET
  process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me'
})

describe('GET verification handshake', () => {
  it('echoes the raw challenge on a correct token', async () => {
    const r = res()
    await handler({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': '12345' } } as any, r)
    expect(r.statusCode).toBe(200)
    expect(r.body).toBe('12345') // raw, not JSON — Meta requires it
  })

  it('rejects a wrong token', async () => {
    const r = res()
    await handler({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'nope', 'hub.challenge': 'x' } } as any, r)
    expect(r.statusCode).toBe(403)
  })
})

describe('POST security', () => {
  it('REJECTS an unsigned payload — anyone could otherwise inject messages', async () => {
    const r = res()
    await handler({ method: 'POST', body: inbound('m1'), headers: {} } as any, r)
    expect(r.statusCode).toBe(403)
    expect(state.queries).toHaveLength(0) // never touched the database
  })

  it('rejects a payload signed with the wrong secret', async () => {
    const bad = 'sha256=' + createHmac('sha256', 'wrong').update(inbound('m1')).digest('hex')
    const r = res()
    await handler({ method: 'POST', body: inbound('m1'), headers: { 'x-hub-signature-256': bad } } as any, r)
    expect(r.statusCode).toBe(403)
  })
})

describe('POST inbound handling', () => {
  it('stores a message and meters ONE conversation for a new window', async () => {
    const body = inbound('m1')
    state.rows = [
      [{ id: 'conn1', clerk_user_id: 'user_1' }], // connection lookup
      [],                                          // no open window -> new conversation
      [{ id: 'wam_m1' }],                          // insert returned a row
      [],                                          // usage counter upsert
    ]
    const r = res()
    await handler({ method: 'POST', body, headers: { 'x-hub-signature-256': sign(body) } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).stored).toBe(1)
    expect(state.queries.some((q) => q.includes('usage_counters'))).toBe(true)
  })

  it('does NOT re-meter when a redelivered message is deduped', async () => {
    // Meta retries anything non-2xx. Without this, one retry = one phantom
    // billable conversation (defect class C3, double-counting).
    const body = inbound('m1')
    state.rows = [
      [{ id: 'conn1', clerk_user_id: 'user_1' }],
      [],
      [],   // ON CONFLICT DO NOTHING returned nothing = already stored
    ]
    const r = res()
    await handler({ method: 'POST', body, headers: { 'x-hub-signature-256': sign(body) } } as any, r)
    expect((r.body as any).stored).toBe(0)
    expect(state.queries.some((q) => q.includes('usage_counters'))).toBe(false)
  })

  it('does NOT meter a reply inside an open 24h window', async () => {
    const body = inbound('m2')
    state.rows = [
      [{ id: 'conn1', clerk_user_id: 'user_1' }],
      [{ ok: 1 }],          // window IS open
      [{ id: 'wam_m2' }],   // stored
    ]
    const r = res()
    await handler({ method: 'POST', body, headers: { 'x-hub-signature-256': sign(body) } } as any, r)
    expect((r.body as any).stored).toBe(1)
    expect(state.queries.some((q) => q.includes('usage_counters'))).toBe(false)
  })

  it('returns 500 so Meta RETRIES when storage fails — never 200-and-lose', async () => {
    const body = inbound('m3')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    state.rows = [[{ id: 'conn1', clerk_user_id: 'user_1' }]]
    state.throwAt = 1 // connection lookup succeeds, the next query blows up
    const r = res()
    await handler({ method: 'POST', body, headers: { 'x-hub-signature-256': sign(body) } } as any, r)
    expect(r.statusCode).toBe(500)
    spy.mockRestore()
  })

  it('acknowledges an unknown phone number without storing anything', async () => {
    const body = inbound('m4')
    state.rows = [[]] // no connection for this phone_number_id
    const r = res()
    await handler({ method: 'POST', body, headers: { 'x-hub-signature-256': sign(body) } } as any, r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).stored).toBe(0)
  })
})

/**
 * PRODUCTION SHAPE. Every other test in this file assigns `req.body` a string,
 * which is exactly why the raw-body bug survived: with `bodyParser: false` the
 * real runtime never sets `req.body`, so the handler used to hash the literal
 * string "{}" and reject every genuine message with a non-retryable 403.
 * These tests hand the handler a STREAM, like Vercel does.
 */
describe('raw body from a stream (the shape production actually sends)', () => {
  function streamReq(body: string, headers: Record<string, string>) {
    return {
      method: 'POST',
      headers,
      // No `body` property at all — same as the real runtime with bodyParser off.
      async *[Symbol.asyncIterator]() {
        // Split across chunks: a single-chunk stream would hide a concat bug.
        yield Buffer.from(body.slice(0, 10))
        yield Buffer.from(body.slice(10))
      },
    } as any
  }

  it('verifies a correctly-signed streamed body and stores the message', async () => {
    const body = inbound('stream-1')
    state.rows = [[{ id: 'conn1', clerk_user_id: 'user_1' }], [], []]
    const r = res()
    await handler(streamReq(body, { 'x-hub-signature-256': sign(body) }), r)
    expect(r.statusCode).toBe(200)
  })

  it('rejects a streamed body whose signature does not match', async () => {
    const body = inbound('stream-2')
    const r = res()
    await handler(streamReq(body, { 'x-hub-signature-256': sign('a different payload') }), r)
    expect(r.statusCode).toBe(403)
  })

  it('does not hash "{}" when the body is a stream (the actual shipped bug)', async () => {
    const body = inbound('stream-3')
    const r = res()
    // Signing the literal "{}" is what the old implementation effectively hashed.
    await handler(streamReq(body, { 'x-hub-signature-256': sign('{}') }), r)
    expect(r.statusCode).toBe(403)
  })
})
