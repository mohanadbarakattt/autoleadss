import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/domains/index.ts tests — same fake-SQL-harness style as
 * api/products/index.test.ts. */

interface FunnelRow {
  id: string
  clerk_user_id: string
}

interface DomainRow {
  id: string
  clerk_user_id: string
  funnel_id: string
  hostname: string
  verified: boolean
  verification_token: string
  created_at: string
  verified_at: string | null
}

const db = { funnels: [] as FunnelRow[], domains: [] as DomainRow[], seq: 0 }

function nextTimestamp(): string {
  db.seq += 1
  return new Date(2026, 0, 1, 0, 0, db.seq).toISOString()
}

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')

  if (text.includes('select id from autoleadss.funnels')) {
    const [id, userId] = vals as [string, string]
    return db.funnels.filter((f) => f.id === id && f.clerk_user_id === userId)
  }
  if (text.includes('select id from autoleadss.domains where hostname')) {
    const [hostname] = vals as [string]
    return db.domains.filter((d) => d.hostname === hostname)
  }
  if (text.includes('select id, funnel_id, hostname, verified, verification_token, created_at, verified_at')) {
    const [userId] = vals as [string]
    return db.domains
      .filter((d) => d.clerk_user_id === userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }
  if (text.includes('insert into autoleadss.domains')) {
    const [id, clerkUserId, funnelId, hostname, verificationToken] = vals as [string, string, string, string, string]
    db.domains.push({
      id,
      clerk_user_id: clerkUserId,
      funnel_id: funnelId,
      hostname,
      verified: false,
      verification_token: verificationToken,
      created_at: nextTimestamp(),
      verified_at: null,
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
  db.funnels = [{ id: 'site_a', clerk_user_id: 'user_A' }, { id: 'site_b', clerk_user_id: 'user_B' }]
  db.domains = []
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

describe('POST — add a domain', () => {
  it('creates a domain, generates a token, and returns the record to create', async () => {
    const r = res()
    await handler(req('POST', { funnelId: 'site_a', hostname: 'Shop.YourBrand.com' }), r)
    expect(r.statusCode).toBe(201)
    const created = (r.body as any).domain
    expect(created.hostname).toBe('shop.yourbrand.com') // lowercased
    expect(created.verified).toBe(false)
    expect(typeof created.verificationToken).toBe('string')
    expect(created.verificationToken.length).toBeGreaterThan(10)
  })

  it('rejects a missing funnelId', async () => {
    const r = res()
    await handler(req('POST', { hostname: 'shop.yourbrand.com' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.domains).toHaveLength(0)
  })

  it('404s when the funnel does not belong to the caller', async () => {
    const r = res()
    await handler(req('POST', { funnelId: 'site_b', hostname: 'shop.yourbrand.com' }), r)
    expect(r.statusCode).toBe(404)
    expect(db.domains).toHaveLength(0)
  })

  it('rejects an invalid hostname', async () => {
    const r = res()
    await handler(req('POST', { funnelId: 'site_a', hostname: 'not a hostname' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.domains).toHaveLength(0)
  })

  it('rejects our own apex domain', async () => {
    const r = res()
    await handler(req('POST', { funnelId: 'site_a', hostname: 'autoleadss.com' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.domains).toHaveLength(0)
  })

  it("rejects another merchant's free subdomain", async () => {
    const r = res()
    await handler(req('POST', { funnelId: 'site_a', hostname: 'someone-else.autoleadss.site' }), r)
    expect(r.statusCode).toBe(400)
    expect(db.domains).toHaveLength(0)
  })

  it('rejects a duplicate hostname (already claimed by any merchant)', async () => {
    await handler(req('POST', { funnelId: 'site_a', hostname: 'shop.yourbrand.com' }), res())
    const r = res()
    await handler(req('POST', { funnelId: 'site_a', hostname: 'shop.yourbrand.com' }), r)
    expect(r.statusCode).toBe(409)
    expect(db.domains).toHaveLength(1)
  })
})

describe('GET — list + ownership isolation', () => {
  it("user A never sees user B's domains", async () => {
    await handler(req('POST', { funnelId: 'site_a', hostname: 'a.example.com' }), res())
    currentUser = 'user_B'
    await handler(req('POST', { funnelId: 'site_b', hostname: 'b.example.com' }), res())

    currentUser = 'user_A'
    const r = res()
    await handler(req('GET'), r)
    const hostnames = (r.body as any).domains.map((d: any) => d.hostname)
    expect(hostnames).toEqual(['a.example.com'])
  })
})
