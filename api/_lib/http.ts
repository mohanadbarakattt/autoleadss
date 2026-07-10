import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Minimal local stand-ins for `@vercel/node`'s `VercelRequest`/`VercelResponse`.
 * We deliberately don't depend on the `@vercel/node` package (it pulls in a full
 * bundler toolchain just for two type aliases) — Vercel's Node.js runtime augments
 * every incoming request with `.query` / `.body` / `.cookies` regardless of which
 * types package (if any) the function imports, so this is safe.
 */
export interface VercelApiRequest extends IncomingMessage {
  query: Record<string, string | string[]>
  body: unknown
  cookies: Record<string, string>
}

export interface VercelApiResponse extends ServerResponse {
  status(code: number): VercelApiResponse
  json(body: unknown): VercelApiResponse
  send(body: unknown): VercelApiResponse
}

export function sendJson(res: VercelApiResponse, status: number, body: unknown): void {
  res.status(status).json(body)
}

export function methodNotAllowed(res: VercelApiResponse, allow: string[]): void {
  res.setHeader('Allow', allow.join(', '))
  sendJson(res, 405, { error: `Method not allowed. Use ${allow.join(', ')}.` })
}

/** True when DATABASE_URL isn't configured — every handler should 501 in that case. */
export function backendNotConfigured(res: VercelApiResponse): boolean {
  if (!process.env.DATABASE_URL) {
    sendJson(res, 501, { error: 'Neon backend not configured (DATABASE_URL unset). The client falls back to localStorage.' })
    return true
  }
  return false
}

function singleParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export function queryParam(req: VercelApiRequest, name: string): string | undefined {
  return singleParam(req.query[name])
}
