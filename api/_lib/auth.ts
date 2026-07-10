import { verifyToken } from '@clerk/backend'
import type { VercelApiRequest } from './http'

/**
 * Verifies the Clerk session token attached to an authenticated request and
 * returns the Clerk user id (`sub`), or `null` if there's no token, no
 * CLERK_SECRET_KEY configured, or verification fails. Functions that require auth
 * must treat `null` as "refuse" (401) — never fall back to an unauthenticated path
 * server-side; the *client* is what falls back to localStorage when this happens.
 */
export async function requireClerkUser(req: VercelApiRequest): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) return null

  const header = req.headers.authorization
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null
  if (!token) return null

  try {
    // The top-level `@clerk/backend` export is the "legacy return" form: it
    // resolves with the verified payload directly and throws on failure
    // (unlike the lower-level `tokens/verify` `{ data, errors }` form).
    const payload = await verifyToken(token, { secretKey })
    return payload.sub ?? null
  } catch {
    return null
  }
}
