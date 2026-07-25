import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * api/domains/verify.ts tests. `node:dns/promises` is mocked — never hits a
 * real network — so each test controls exactly what the DNS lookup returns
 * (or throws), including the specific error codes real Node dns.resolveTxt
 * uses to distinguish "no such domain" (ENOTFOUND) from "domain resolves but
 * no TXT records" (ENODATA).
 */

let resolveTxtImpl: (name: string) => Promise<string[][]>

vi.mock('node:dns/promises', () => {
  const mod = { resolveTxt: (name: string) => resolveTxtImpl(name) }
  return { ...mod, default: mod }
})

interface DomainRow {
  id: string
  clerk_user_id: string
  hostname: string
  verification_token: string
  verified: boolean
  verified_at: string | null
}

const db = { domains: [] as DomainRow[] }

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('select hostname, verification_token from autoleadss.domains')) {
    const [id, userId] = vals as [string, string]
    return db.domains.filter((d) => d.id === id && d.clerk_user_id === userId).map((d) => ({ hostname: d.hostname, verification_token: d.verification_token }))
  }
  if (text.includes('update autoleadss.domains set verified = true')) {
    const [id, userId] = vals as [string, string]
    const row = db.domains.find((d) => d.id === id && d.clerk_user_id === userId)
    if (row) {
      row.verified = true
      row.verified_at = new Date().toISOString()
    }
    return []
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

let currentUser: string | null = 'user_A'
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./verify')

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

function dnsError(code: string) {
  const err = new Error(code) as NodeJS.ErrnoException
  err.code = code
  return err
}

beforeEach(() => {
  db.domains = [{ id: 'dom_a', clerk_user_id: 'user_A', hostname: 'shop.yourbrand.com', verification_token: 'tok_123', verified: false, verified_at: null }]
  currentUser = 'user_A'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
  resolveTxtImpl = async () => {
    throw new Error('resolveTxt not stubbed for this test')
  }
})

describe('method + config guards', () => {
  it('405s on non-POST', async () => {
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(405)
  })

  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.statusCode).toBe(501)
  })

  it('401s when there is no authenticated Clerk user', async () => {
    currentUser = null
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.statusCode).toBe(401)
  })

  it('400s when id is missing', async () => {
    const r = res()
    await handler(req('POST', {}), r)
    expect(r.statusCode).toBe(400)
  })
})

describe('ownership', () => {
  it("404s when the domain does not belong to the caller", async () => {
    currentUser = 'user_B'
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.statusCode).toBe(404)
  })

  it('404s for an unknown domain id', async () => {
    const r = res()
    await handler(req('POST', { id: 'dom_nope' }), r)
    expect(r.statusCode).toBe(404)
  })
})

describe('DNS failure reasons — distinguishable, never verified', () => {
  it('reports nxdomain when the hostname has no DNS presence at all (ENOTFOUND)', async () => {
    resolveTxtImpl = async () => {
      throw dnsError('ENOTFOUND')
    }
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.statusCode).toBe(200)
    expect(r.body).toEqual({ verified: false, reason: 'nxdomain' })
    expect(db.domains[0].verified).toBe(false)
  })

  it('reports no_record when the domain resolves but has no TXT records (ENODATA)', async () => {
    resolveTxtImpl = async () => {
      throw dnsError('ENODATA')
    }
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.body).toEqual({ verified: false, reason: 'no_record' })
  })

  it('reports no_record when resolveTxt resolves with an empty array', async () => {
    resolveTxtImpl = async () => []
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.body).toEqual({ verified: false, reason: 'no_record' })
  })

  it('reports lookup_failed for any other DNS error, never claiming no_record for a real failure', async () => {
    resolveTxtImpl = async () => {
      throw dnsError('ETIMEOUT')
    }
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.body).toEqual({ verified: false, reason: 'lookup_failed' })
  })

  it('reports mismatch when a TXT record exists but does not match the stored token', async () => {
    resolveTxtImpl = async () => [['some-other-value']]
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.body).toEqual({ verified: false, reason: 'mismatch' })
    expect(db.domains[0].verified).toBe(false)
  })
})

describe('genuine match', () => {
  it('verifies and stamps verified_at when the TXT value matches exactly', async () => {
    resolveTxtImpl = async (name) => {
      expect(name).toBe('_autoleadss.shop.yourbrand.com')
      return [['tok_123']]
    }
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.statusCode).toBe(200)
    expect(r.body).toEqual({ verified: true })
    expect(db.domains[0].verified).toBe(true)
    expect(db.domains[0].verified_at).not.toBeNull()
  })

  it('matches a token split across multiple TXT chunks (real DNS TXT chunking)', async () => {
    resolveTxtImpl = async () => [['tok_', '123']]
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.body).toEqual({ verified: true })
  })

  it('matches when one of several TXT records at that name matches', async () => {
    resolveTxtImpl = async () => [['unrelated=1'], ['tok_123']]
    const r = res()
    await handler(req('POST', { id: 'dom_a' }), r)
    expect(r.body).toEqual({ verified: true })
  })
})
