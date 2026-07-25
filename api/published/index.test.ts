import { describe, expect, it, vi, beforeEach } from 'vitest'

/** api/published/index.ts tests — slug lookup (existing) + host lookup (Phase
 * 4c). The important case: an unverified domain must NEVER resolve publicly. */

interface FunnelRow {
  id: string
  name: string
  slug: string
  industry: string
  language: string
  status: string
  accent: string | null
  spec: unknown
  visits: number
  visits_by_day: Record<string, number> | null
  created_at: string
  updated_at: string
}

interface DomainRow {
  funnel_id: string
  hostname: string
  verified: boolean
}

const db = { funnels: [] as FunnelRow[], domains: [] as DomainRow[] }

function seedFunnel(over: Partial<FunnelRow> & { id: string; slug: string }): FunnelRow {
  const row: FunnelRow = {
    name: 'Test Site',
    industry: 'ecommerce',
    language: 'en',
    status: 'published',
    accent: '#000000',
    spec: { mode: 'sell' },
    visits: 0,
    visits_by_day: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...over,
  }
  db.funnels.push(row)
  return row
}

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('where slug = ')) {
    const [slug] = vals as [string]
    return db.funnels.filter((f) => f.slug === slug && f.status === 'published')
  }
  if (text.includes('select funnel_id from autoleadss.domains')) {
    const [hostname] = vals as [string]
    return db.domains.filter((d) => d.hostname === hostname && d.verified).map((d) => ({ funnel_id: d.funnel_id }))
  }
  if (text.includes('where id = ') && text.includes('from autoleadss.funnels')) {
    const [id] = vals as [string]
    return db.funnels.filter((f) => f.id === id && f.status === 'published')
  }
  throw new Error(`fake db: unmocked query shape: ${text}`)
}

vi.mock('../_lib/db', () => ({ getSql: () => fakeSql }))

const { default: handler } = await import('./index')

function res() {
  const r: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.send = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(query: Record<string, string>) {
  return { method: 'GET', query, body: {}, headers: {} } as any
}

beforeEach(() => {
  db.funnels = []
  db.domains = []
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('method + input guards', () => {
  it('405s on non-GET', async () => {
    const r = res()
    await handler({ ...req({}), method: 'POST' }, r)
    expect(r.statusCode).toBe(405)
  })

  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect(r.statusCode).toBe(501)
  })

  it('400s when neither slug nor host is provided', async () => {
    const r = res()
    await handler(req({}), r)
    expect(r.statusCode).toBe(400)
  })
})

describe('slug lookup (unchanged)', () => {
  it('resolves a published funnel by slug', async () => {
    seedFunnel({ id: 'site_1', slug: 'noor' })
    const r = res()
    await handler(req({ slug: 'noor' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).funnel.slug).toBe('noor')
  })

  it('returns null for a slug with no published funnel', async () => {
    const r = res()
    await handler(req({ slug: 'nope' }), r)
    expect((r.body as any).funnel).toBeNull()
  })
})

describe('host lookup — the important case: unverified never resolves', () => {
  it('resolves the funnel when the domain IS verified', async () => {
    seedFunnel({ id: 'site_1', slug: 'noor' })
    db.domains.push({ funnel_id: 'site_1', hostname: 'shop.yourbrand.com', verified: true })

    const r = res()
    await handler(req({ host: 'shop.yourbrand.com' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).funnel.slug).toBe('noor')
  })

  it('returns funnel: null for an UNVERIFIED domain — it must never serve content', async () => {
    seedFunnel({ id: 'site_1', slug: 'noor' })
    db.domains.push({ funnel_id: 'site_1', hostname: 'shop.yourbrand.com', verified: false })

    const r = res()
    await handler(req({ host: 'shop.yourbrand.com' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).funnel).toBeNull()
  })

  it('returns funnel: null for a host with no domain row at all', async () => {
    const r = res()
    await handler(req({ host: 'nobody-registered-this.com' }), r)
    expect((r.body as any).funnel).toBeNull()
  })

  it('is case-insensitive on the incoming host', async () => {
    seedFunnel({ id: 'site_1', slug: 'noor' })
    db.domains.push({ funnel_id: 'site_1', hostname: 'shop.yourbrand.com', verified: true })

    const r = res()
    await handler(req({ host: 'Shop.YourBrand.COM' }), r)
    expect((r.body as any).funnel.slug).toBe('noor')
  })

  it('does not resolve a verified domain whose funnel is no longer published', async () => {
    seedFunnel({ id: 'site_1', slug: 'noor', status: 'draft' })
    db.domains.push({ funnel_id: 'site_1', hostname: 'shop.yourbrand.com', verified: true })

    const r = res()
    await handler(req({ host: 'shop.yourbrand.com' }), r)
    expect((r.body as any).funnel).toBeNull()
  })
})
