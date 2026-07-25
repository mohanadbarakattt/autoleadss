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
  /** Not selected by the real query — used only by this mock to simulate the
   * left join onto agency_settings below (see `withBrand`). */
  clerk_user_id?: string
}

interface AgencySettingsRow {
  clerk_user_id: string
  brand_name: string | null
  logo_url: string | null
  hide_badge: boolean
}

interface DomainRow {
  funnel_id: string
  hostname: string
  verified: boolean
}

const db = { funnels: [] as FunnelRow[], domains: [] as DomainRow[], agency: [] as AgencySettingsRow[] }

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

function seedAgencySettings(over: Partial<AgencySettingsRow> & { clerk_user_id: string }): AgencySettingsRow {
  const row: AgencySettingsRow = { brand_name: null, logo_url: null, hide_badge: false, ...over }
  db.agency.push(row)
  return row
}

/** Simulates the `left join autoleadss.agency_settings a on a.clerk_user_id =
 * f.clerk_user_id` api/published/index.ts performs — this fake driver doesn't
 * run real SQL, so the join is reproduced here against `db.agency`. */
function withBrand(f: FunnelRow) {
  const a = db.agency.find((x) => x.clerk_user_id === f.clerk_user_id)
  return { ...f, brand_name: a?.brand_name ?? null, logo_url: a?.logo_url ?? null, hide_badge: a?.hide_badge ?? false }
}

async function fakeSql(strings: TemplateStringsArray, ...vals: unknown[]) {
  const text = strings.join('?')
  if (text.includes('where f.slug = ')) {
    const [slug] = vals as [string]
    return db.funnels.filter((f) => f.slug === slug && f.status === 'published').map(withBrand)
  }
  if (text.includes('select funnel_id from autoleadss.domains')) {
    const [hostname] = vals as [string]
    return db.domains.filter((d) => d.hostname === hostname && d.verified).map((d) => ({ funnel_id: d.funnel_id }))
  }
  if (text.includes('where f.id = ') && text.includes('from autoleadss.funnels')) {
    const [id] = vals as [string]
    return db.funnels.filter((f) => f.id === id && f.status === 'published').map(withBrand)
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
  db.agency = []
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

describe('Phase 6 — server-side white-label branding (the headline fix)', () => {
  it('THE HEADLINE FIX: a published funnel carries the OWNER\'s branding, resolved entirely server-side — nothing here depends on any visitor/browser state', async () => {
    // No localStorage, no visitor session, no client-side agency state exists
    // anywhere in this test — the payload has to come from the join alone.
    seedFunnel({ id: 'site_brand_1', slug: 'brandshop', clerk_user_id: 'owner_1' })
    seedAgencySettings({ clerk_user_id: 'owner_1', brand_name: 'Acme Agency', logo_url: 'https://cdn.example.com/logo.png', hide_badge: true })

    const r = res()
    await handler(req({ slug: 'brandshop' }), r)
    expect(r.statusCode).toBe(200)
    const funnel = (r.body as any).funnel
    expect(funnel.brand).toEqual({ brandName: 'Acme Agency', logoUrl: 'https://cdn.example.com/logo.png', hideBadge: true })
  })

  it('never leaks clerk_user_id (or any other owner identifier) into the brand payload', async () => {
    seedFunnel({ id: 'site_brand_2', slug: 'noleak', clerk_user_id: 'owner_2_secret_id' })
    seedAgencySettings({ clerk_user_id: 'owner_2_secret_id', brand_name: 'Should Not Leak Corp' })

    const r = res()
    await handler(req({ slug: 'noleak' }), r)
    const body = r.body as any
    expect(body.funnel.brand.clerk_user_id).toBeUndefined()
    expect(JSON.stringify(body)).not.toContain('owner_2_secret_id')
  })

  it('defaults to hideBadge: false and no brand name/logo when the owner never configured agency settings', async () => {
    seedFunnel({ id: 'site_brand_3', slug: 'nobrand', clerk_user_id: 'owner_3' })

    const r = res()
    await handler(req({ slug: 'nobrand' }), r)
    const funnel = (r.body as any).funnel
    expect(funnel.brand).toEqual({ brandName: undefined, logoUrl: undefined, hideBadge: false })
  })

  it('hides the badge when the owner explicitly set hideBadge: true', async () => {
    seedFunnel({ id: 'site_brand_4', slug: 'hidden-badge', clerk_user_id: 'owner_4' })
    seedAgencySettings({ clerk_user_id: 'owner_4', hide_badge: true })

    const r = res()
    await handler(req({ slug: 'hidden-badge' }), r)
    expect((r.body as any).funnel.brand.hideBadge).toBe(true)
  })

  it('shows the badge when the owner explicitly set hideBadge: false, even with a brand name set', async () => {
    seedFunnel({ id: 'site_brand_5', slug: 'shown-badge', clerk_user_id: 'owner_5' })
    seedAgencySettings({ clerk_user_id: 'owner_5', brand_name: 'Shown Badge Co', hide_badge: false })

    const r = res()
    await handler(req({ slug: 'shown-badge' }), r)
    expect((r.body as any).funnel.brand).toEqual({ brandName: 'Shown Badge Co', logoUrl: undefined, hideBadge: false })
  })

  it('resolves the same owner branding via the custom-domain host lookup path', async () => {
    seedFunnel({ id: 'site_brand_6', slug: 'hostbrand', clerk_user_id: 'owner_6' })
    seedAgencySettings({ clerk_user_id: 'owner_6', brand_name: 'Host Path Agency', hide_badge: true })
    db.domains.push({ funnel_id: 'site_brand_6', hostname: 'shop.hostbrand.com', verified: true })

    const r = res()
    await handler(req({ host: 'shop.hostbrand.com' }), r)
    expect((r.body as any).funnel.brand).toEqual({ brandName: 'Host Path Agency', logoUrl: undefined, hideBadge: true })
  })

  it('never mixes up branding between two different owners\' funnels', async () => {
    seedFunnel({ id: 'site_brand_7', slug: 'shop-a', clerk_user_id: 'owner_a' })
    seedFunnel({ id: 'site_brand_8', slug: 'shop-b', clerk_user_id: 'owner_b' })
    seedAgencySettings({ clerk_user_id: 'owner_a', brand_name: 'Owner A Brand' })
    seedAgencySettings({ clerk_user_id: 'owner_b', brand_name: 'Owner B Brand' })

    const rA = res()
    await handler(req({ slug: 'shop-a' }), rA)
    expect((rA.body as any).funnel.brand.brandName).toBe('Owner A Brand')

    const rB = res()
    await handler(req({ slug: 'shop-b' }), rB)
    expect((rB.body as any).funnel.brand.brandName).toBe('Owner B Brand')
  })
})
