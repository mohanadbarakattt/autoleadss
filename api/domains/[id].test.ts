import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/domains/[id].ts tests — DELETE ownership isolation. */

interface DomainRow {
  id: string
  clerk_user_id: string
  hostname: string
}

const db = { domains: [] as DomainRow[] }

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('delete from autoleadss.domains')) {
    const [id, userId] = vals as [string, string]
    db.domains = db.domains.filter((d) => !(d.id === id && d.clerk_user_id === userId))
    return []
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

let currentUser: string | null = 'user_A'
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./[id]')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, id: string) {
  return { method, query: { id }, body: {}, headers: {} } as any
}

beforeEach(() => {
  db.domains = [
    { id: 'dom_a', clerk_user_id: 'user_A', hostname: 'a.example.com' },
    { id: 'dom_b', clerk_user_id: 'user_B', hostname: 'b.example.com' },
  ]
  currentUser = 'user_A'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('auth', () => {
  it('401s when there is no authenticated Clerk user', async () => {
    currentUser = null
    const r = res()
    await handler(req('DELETE', 'dom_a'), r)
    expect(r.statusCode).toBe(401)
  })
})

describe('fail-closed config', () => {
  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('DELETE', 'dom_a'), r)
    expect(r.statusCode).toBe(501)
  })
})

describe('DELETE', () => {
  it("deletes the caller's own domain", async () => {
    const r = res()
    await handler(req('DELETE', 'dom_a'), r)
    expect(r.statusCode).toBe(200)
    expect(db.domains.find((d) => d.id === 'dom_a')).toBeUndefined()
  })

  it("user A cannot delete user B's domain — the row is untouched", async () => {
    const r = res()
    await handler(req('DELETE', 'dom_b'), r)
    expect(r.statusCode).toBe(200) // 0 rows affected, same no-existence-check template as products/[id].ts
    expect(db.domains.find((d) => d.id === 'dom_b')).toBeDefined()
  })
})
