import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { funnelFromRow, type FunnelRow, type LeadRow } from '../_lib/mapping'
import type { Funnel } from '../../src/saas/types'

/** GET /api/funnels — list the caller's funnels (with leads). POST — create one. */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const funnelRows = (await sql`
      select id, name, slug, industry, language, status, accent, spec, visits, visits_by_day, created_at, updated_at
      from autoleadss.funnels
      where clerk_user_id = ${userId}
      order by created_at desc
    `) as unknown as FunnelRow[]

    const leadRows = (await sql`
      select id, funnel_id, name, phone, email, message, source, status, created_at
      from autoleadss.leads
      where clerk_user_id = ${userId}
    `) as unknown as LeadRow[]

    const leadsByFunnel = new Map<string, LeadRow[]>()
    for (const l of leadRows) {
      const list = leadsByFunnel.get(l.funnel_id) ?? []
      list.push(l)
      leadsByFunnel.set(l.funnel_id, list)
    }

    const funnels: Funnel[] = funnelRows.map((r) => funnelFromRow(r, leadsByFunnel.get(r.id) ?? []))
    return sendJson(res, 200, { funnels })
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<Funnel> | undefined
    if (!body?.id || !body.name || !body.slug || !body.industry || !body.language) {
      return sendJson(res, 400, { error: 'id, name, slug, industry, language are required.' })
    }
    await sql`
      insert into autoleadss.funnels (id, clerk_user_id, name, slug, industry, language, status, accent, spec, visits, visits_by_day)
      values (
        ${body.id}, ${userId}, ${body.name}, ${body.slug}, ${body.industry}, ${body.language},
        ${body.status ?? 'draft'}, ${body.accent ?? null}, ${JSON.stringify(body.spec ?? {})}, ${body.visits ?? 0},
        ${JSON.stringify(body.visitsByDay ?? {})}
      )
    `
    if (body.leads?.length) {
      for (const lead of body.leads) {
        await sql`
          insert into autoleadss.leads (id, funnel_id, clerk_user_id, name, phone, email, message, source, status)
          values (${lead.id}, ${body.id}, ${userId}, ${lead.name ?? null}, ${lead.phone ?? null}, ${lead.email ?? null}, ${lead.message ?? null}, ${lead.source}, ${lead.status})
        `
      }
    }
    return sendJson(res, 201, { ok: true })
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
