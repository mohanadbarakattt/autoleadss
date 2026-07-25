import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { productFromRow, isValidPriceMinor, isValidStock, normalizeCurrency, type ProductRow } from '../_lib/mapping'
import { isValidHttpsUrl } from '../../src/saas/lib/agencyBrand'
import type { Product } from '../../src/saas/types'

const STATUSES: Product['status'][] = ['draft', 'active', 'archived']

/** GET /api/products — list the caller's products. POST — create one. */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const rows = (await sql`
      select id, name, description, image_url, price_minor, currency, stock, status, created_at, updated_at
      from autoleadss.products
      where clerk_user_id = ${userId}
      order by created_at desc
    `) as unknown as ProductRow[]
    return sendJson(res, 200, { products: rows.map(productFromRow) })
  }

  if (req.method === 'POST') {
    const body = req.body as (Partial<Product> & { id?: string }) | undefined
    if (!body?.id || !body.name?.trim()) return sendJson(res, 400, { error: 'id and name are required.' })
    if (!isValidPriceMinor(body.priceMinor)) return sendJson(res, 400, { error: 'priceMinor must be a positive integer.' })
    const currency = normalizeCurrency(body.currency)
    if (!currency) return sendJson(res, 400, { error: 'currency must be a 3-letter ISO code.' })
    const stock = body.stock ?? 0
    if (!isValidStock(stock)) return sendJson(res, 400, { error: 'stock must be a non-negative integer.' })
    // Rendered as a public <img src> and og:image on the storefront (see
    // StorefrontRenderer.tsx, Published.tsx) — same defect class as agency
    // logoUrl (SEC1), same validator.
    if (body.imageUrl && !isValidHttpsUrl(body.imageUrl)) return sendJson(res, 400, { error: 'imageUrl must be an https:// URL.' })
    const status = body.status && STATUSES.includes(body.status) ? body.status : 'draft'

    await sql`
      insert into autoleadss.products (id, clerk_user_id, name, description, image_url, price_minor, currency, stock, status)
      values (
        ${body.id}, ${userId}, ${body.name.trim()}, ${body.description ?? null}, ${body.imageUrl ?? null},
        ${body.priceMinor}, ${currency}, ${stock}, ${status}
      )
    `
    return sendJson(res, 201, { ok: true })
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}
