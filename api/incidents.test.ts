import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './incidents'
import type { VercelApiRequest, VercelApiResponse } from './_lib/http'

function makeRes() {
  const res: Partial<VercelApiResponse> & { statusCode?: number; body?: unknown; headers: Record<string, string> } = {
    headers: {},
  }
  res.status = vi.fn((code: number) => {
    res.statusCode = code
    return res as VercelApiResponse
  })
  res.json = vi.fn((body: unknown) => {
    res.body = body
    return res as VercelApiResponse
  })
  res.setHeader = vi.fn((name: string, value: string) => {
    res.headers[name] = value
    return res as unknown as ReturnType<VercelApiResponse['setHeader']>
  })
  return res as VercelApiResponse & { statusCode?: number; body?: unknown; headers: Record<string, string> }
}

function makeReq(overrides: Partial<VercelApiRequest> = {}): VercelApiRequest {
  return {
    method: 'POST',
    query: {},
    body: {},
    cookies: {},
    ...overrides,
  } as VercelApiRequest
}

describe('POST /api/incidents', () => {
  beforeEach(() => {
    process.env.MBAI_GATEWAY_URL = 'https://gateway.example.test'
    process.env.MBAI_GATEWAY_KEY = 'test-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.MBAI_GATEWAY_URL
    delete process.env.MBAI_GATEWAY_KEY
  })

  it('rejects a kind not in the allowlist with 400 and does not call fetch', async () => {
    const req = makeReq({ body: { kind: 'NOT-A-REAL-KIND', message: 'oops' } })
    const res = makeRes()

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('accepts a valid kind and returns 202', async () => {
    const req = makeReq({ body: { kind: 'LEAD-DROP', message: 'lead lost' } })
    const res = makeRes()

    await handler(req, res)

    expect(res.statusCode).toBe(202)
    expect(res.body).toEqual({ recorded: true })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('replaces an over-long context with { truncated: true }', async () => {
    const req = makeReq({
      body: { kind: 'LEAD-DROP', message: 'lead lost', context: { blob: 'x'.repeat(3000) } },
    })
    const res = makeRes()

    await handler(req, res)

    expect(res.statusCode).toBe(202)
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>
    const [, init] = fetchMock.mock.calls[0]
    const sentBody = JSON.parse(init.body as string)
    expect(sentBody.context).toEqual({ truncated: true })
  })

  it('rejects a non-POST method', async () => {
    const req = makeReq({ method: 'GET' })
    const res = makeRes()

    await handler(req, res)

    expect(res.statusCode).toBe(405)
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
