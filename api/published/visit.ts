import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'

/** POST /api/published/visit — record a visit on a published funnel. Public, no auth. */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const body = (req.body ?? {}) as { slug?: string }
  if (!body.slug) return sendJson(res, 400, { error: 'slug is required.' })

  await sql`update autoleadss.funnels set visits = visits + 1 where slug = ${body.slug} and status = 'published'`
  return sendJson(res, 200, { ok: true })
}
