import { describe, expect, it, vi, beforeEach } from 'vitest'

const state: { rows: unknown[][]; queries: string[] } = { rows: [], queries: [] }
let currentUser: string | null = 'user_1'

vi.mock('../_lib/db', () => ({
  getSql: () => (async (s: TemplateStringsArray) => { state.queries.push(s.join('?')); return state.rows.shift() ?? [] }),
}))
vi.mock('../_lib/auth', () => ({ requireClerkUser: async () => currentUser }))

const { default: handler } = await import('./settings')

function res() {
  const r: any = { statusCode: 0, body: undefined }
  r.status = (c: number) => { r.statusCode = c; return r }
  r.json = (b: unknown) => { r.body = b; return r }
  r.setHeader = () => {}
  return r
}

function req(method: string, body?: unknown) {
  return { method, query: {}, body: body ?? {}, headers: {} } as any
}

beforeEach(() => {
  state.rows = []
  state.queries = []
  currentUser = 'user_1'
  process.env.DATABASE_URL = 'postgresql://user:pass@ep-test.neon.tech/dbname'
})

describe('GET /api/agency/settings', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(401)
    expect(state.queries).toHaveLength(0)
  })

  it('501s without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(501)
  })

  it('returns null when the caller never saved settings', async () => {
    state.rows = [[]] // the existing-row select
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).settings).toBeNull()
  })

  it("returns the caller's own settings, scoped by clerk_user_id", async () => {
    state.rows = [[{ brand_name: 'Acme Agency', accent: '#FF5C2A', logo_url: 'https://cdn.example.com/logo.png', hide_badge: true }]]
    const r = res()
    await handler(req('GET'), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).settings).toEqual({ brandName: 'Acme Agency', accent: '#FF5C2A', logoUrl: 'https://cdn.example.com/logo.png', hideBadge: true })
    expect(state.queries[0]).toContain('clerk_user_id')
  })
})

describe('PUT /api/agency/settings — ownership isolation', () => {
  it('401s without a Clerk session', async () => {
    currentUser = null
    const r = res()
    await handler(req('PUT', { brandName: 'X' }), r)
    expect(r.statusCode).toBe(401)
  })

  it('scopes both the read and the write to the caller (clerk_user_id in every statement)', async () => {
    state.rows = [[], []] // existing-row select, then the upsert
    const r = res()
    await handler(req('PUT', { brandName: 'My Agency', accent: '#2563EB', hideBadge: true }), r)
    expect(r.statusCode).toBe(200)
    for (const q of state.queries) expect(q).toContain('clerk_user_id')
  })
})

describe('PUT /api/agency/settings — validation (defect class SEC1: logoUrl is rendered on public pages)', () => {
  it('rejects an accent that is not a valid hex colour', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('PUT', { accent: 'red' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a short (3-digit) hex accent', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('PUT', { accent: '#FFF' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a javascript: logo URL', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('PUT', { logoUrl: "javascript:alert('xss')" }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a data: logo URL', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('PUT', { logoUrl: 'data:text/html,<script>alert(1)</script>' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('rejects a plain http:// (non-https) logo URL', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('PUT', { logoUrl: 'http://example.com/logo.png' }), r)
    expect(r.statusCode).toBe(400)
  })

  it('accepts a real https:// logo URL', async () => {
    state.rows = [[], []]
    const r = res()
    await handler(req('PUT', { logoUrl: 'https://cdn.example.com/logo.png' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).settings.logoUrl).toBe('https://cdn.example.com/logo.png')
  })

  it('rejects an oversized brand name', async () => {
    state.rows = [[]]
    const r = res()
    await handler(req('PUT', { brandName: 'x'.repeat(81) }), r)
    expect(r.statusCode).toBe(400)
  })

  it('accepts a valid brand name at the boundary (80 characters)', async () => {
    state.rows = [[], []]
    const r = res()
    await handler(req('PUT', { brandName: 'x'.repeat(80) }), r)
    expect(r.statusCode).toBe(200)
  })

  it('treats an empty-string brandName/logoUrl as clearing the field, not an error', async () => {
    state.rows = [[{ brand_name: 'Old Name', accent: null, logo_url: 'https://old.example.com/logo.png', hide_badge: false }], []]
    const r = res()
    await handler(req('PUT', { brandName: '', logoUrl: '' }), r)
    expect(r.statusCode).toBe(200)
    expect((r.body as any).settings.brandName).toBeUndefined()
    expect((r.body as any).settings.logoUrl).toBeUndefined()
  })

  it('only overwrites fields present in the body — a partial patch leaves the rest untouched', async () => {
    state.rows = [[{ brand_name: 'Kept Name', accent: '#FF5C2A', logo_url: 'https://kept.example.com/logo.png', hide_badge: true }], []]
    const r = res()
    await handler(req('PUT', { hideBadge: false }), r)
    expect(r.statusCode).toBe(200)
    const settings = (r.body as any).settings
    expect(settings.brandName).toBe('Kept Name')
    expect(settings.logoUrl).toBe('https://kept.example.com/logo.png')
    expect(settings.hideBadge).toBe(false)
  })
})
