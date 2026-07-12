import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import type { FunnelRow } from '../_lib/mapping'

/**
 * POST /api/published/lead — capture a lead on a published funnel. Public, no auth
 * (mirrors the old Supabase `capture_lead` SECURITY DEFINER RPC): resolves the
 * funnel's owner server-side so the client never needs write access to `funnels`.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const body = (req.body ?? {}) as { slug?: string; name?: string; phone?: string; email?: string; message?: string; source?: string }
  if (!body.slug || !body.name || !body.phone) return sendJson(res, 400, { error: 'slug, name, phone are required.' })

  const rows = (await sql`
    select id, clerk_user_id from autoleadss.funnels where slug = ${body.slug} and status = 'published'
  `) as unknown as (Pick<FunnelRow, 'id'> & { clerk_user_id: string })[]
  const funnel = rows[0]
  if (!funnel) return sendJson(res, 404, { error: `Funnel not found or not published: ${body.slug}` })

  const leadId = `l_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
  await sql`
    insert into autoleadss.leads (id, funnel_id, clerk_user_id, name, phone, email, message, source, status)
    values (${leadId}, ${funnel.id}, ${funnel.clerk_user_id}, ${body.name}, ${body.phone}, ${body.email ?? null}, ${body.message ?? null}, ${body.source ?? 'page'}, 'new')
  `
  return sendJson(res, 201, { ok: true })
}
