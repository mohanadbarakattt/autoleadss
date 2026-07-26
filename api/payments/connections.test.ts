import { describe, expect, it, vi, beforeEach } from 'vitest'
import { randomBytes } from 'node:crypto'

/** api/payments/connections.ts tests. Mocks `../_lib/db` (same style as the
 * webhook tests) and `../_lib/auth`'s requireClerkUser so each test controls
 * which Clerk user id is "logged in". Real AES-256-GCM encryption runs
 * (PAYMENTS_ENCRYPTION_KEY is set to a real key), so a GET response is
 * checked against the actual encrypted value to prove it's never returned. */

interface Row {
  id: string
  clerk_user_id: string
  gateway: string
  credentials_encrypted: string
  credentials_hint: string | null
  status: string
}

const db = { rows: [] as Row[] }

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('select gateway, credentials_hint, status')) {
    const [userId] = vals as [string]
    return db.rows.filter((r) => r.clerk_user_id === userId).map((r) => ({ gateway: r.gateway, credentials_hint: r.credentials_hint, status: r.status }))
  }
  if (text.includes('insert into autoleadss.payment_connections')) {
    const [id, userId, gateway, encrypted, hint] = vals as [string, string, string, string, string | null]
    const existing = db.rows.find((r) => r.clerk_user_id === userId && r.gateway === gateway)
    if (existing) {
      existing.credentials_encrypted = encrypted
      existing.credentials_hint = hint
      existing.status = 'connected'
    } else {
      db.rows.push({ id, clerk_user_id: userId, gateway, credentials_encrypted: encrypted, credentials_hint: hint, status: 'connected' })
    }
    return []
  }
  if (text.includes('delete from autoleadss.payment_connections')) {
    const [userId, gateway] = vals as [string, string]
    db.rows = db.rows.filter((r) => !(r.clerk_user_id === userId && r.gateway === gateway))
    return []
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

let currentUser: string | null = 'user_A'
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./connections')
const KEY = randomBytes(32).toString('base64')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

beforeEach(() => {
  process.env.PAYMENTS_FAKE_ADAPTER = '1' // the only gateway with an adapter to connect
  db.rows = []
  currentUser = 'user_A'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
  process.env.PAYMENTS_ENCRYPTION_KEY = KEY
})

describe('auth', () => {
  it('401s when there is no authenticated Clerk user', async () => {
    currentUser = null
    const r = res()
    await handler({ method: 'GET', query: {}, body: {}, headers: {} } as any, r)
    expect(r.statusCode).toBe(401)
  })
})

describe('fail-closed config', () => {
  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler({ method: 'GET', query: {}, body: {}, headers: {} } as any, r)
    expect(r.statusCode).toBe(501)
  })

  it('501s without PAYMENTS_ENCRYPTION_KEY', async () => {
    delete process.env.PAYMENTS_ENCRYPTION_KEY
    const r = res()
    await handler({ method: 'GET', query: {}, body: {}, headers: {} } as any, r)
    expect(r.statusCode).toBe(501)
  })
})

describe('GET never returns the encrypted credentials', () => {
  it('the response contains gateway/status/hint but never credentials_encrypted or the secret value', async () => {
    const connect = res()
    await handler({ method: 'POST', query: {}, body: { gateway: 'fake', credentials: 'sk_live_top_secret', credentialsHint: '••1234' }, headers: {} } as any, connect)
    expect(connect.statusCode).toBe(201)
    expect(db.rows[0].credentials_encrypted).not.toContain('sk_live_top_secret') // sanity: it really is encrypted at rest

    const get = res()
    await handler({ method: 'GET', query: {}, body: {}, headers: {} } as any, get)
    expect(get.statusCode).toBe(200)
    const serialized = JSON.stringify(get.body)
    expect(serialized).not.toContain('credentials_encrypted')
    expect(serialized).not.toContain('sk_live_top_secret')
    expect(get.body).toEqual({ connections: [{ gateway: 'fake', credentials_hint: '••1234', status: 'connected' }] })
  })
})

describe('cross-user isolation', () => {
  it("user A cannot see or delete user B's connection", async () => {
    currentUser = 'user_B'
    const connectB = res()
    await handler({ method: 'POST', query: {}, body: { gateway: 'fake', credentials: 'sk_live_b_secret' }, headers: {} } as any, connectB)
    expect(connectB.statusCode).toBe(201)

    currentUser = 'user_A'
    const getA = res()
    await handler({ method: 'GET', query: {}, body: {}, headers: {} } as any, getA)
    expect((getA.body as any).connections).toEqual([]) // A sees nothing of B's

    const deleteA = res()
    await handler({ method: 'DELETE', query: {}, body: { gateway: 'fake' }, headers: {} } as any, deleteA)
    expect(deleteA.statusCode).toBe(200)

    expect(db.rows.some((r) => r.clerk_user_id === 'user_B' && r.gateway === 'fake')).toBe(true) // B's row survives A's delete
  })
})

describe('gateway validation', () => {
  it('rejects an unknown gateway id on connect', async () => {
    const r = res()
    await handler({ method: 'POST', query: {}, body: { gateway: 'not-a-real-gateway', credentials: 'x' }, headers: {} } as any, r)
    expect(r.statusCode).toBe(400)
    expect(db.rows).toHaveLength(0)
  })
})

describe('unimplemented gateways cannot be "connected"', () => {
  it('refuses a gateway with no adapter, and stores nothing', async () => {
    // Every real gateway is implemented:false until Phase 3b ships its adapter.
    // Connecting one used to return 201 + status 'connected' while checkout
    // still refused with payments_not_connected — a merchant looking at a
    // connected gateway that could never take a payment, and live credentials
    // stored for a capability that does not exist.
    const before = db.rows.length
    const r = res()
    await handler({ method: 'POST', query: {}, body: { gateway: 'tap', credentials: 'sk_live_real_secret' }, headers: {} } as any, r)
    expect(r.statusCode).toBe(400)
    expect((r.body as any).error).toBe('gateway_not_available')
    expect(db.rows.length).toBe(before) // credentials NOT persisted
  })
})
