import { getSql } from '../_lib/db'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { toSafeInt } from '../_lib/money'
import type { PublicProduct } from '../../src/saas/types'

interface ProductRow {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price_minor: string // bigint over the wire — always route through toSafeInt()
  currency: string
  stock: number
}

/**
 * GET /api/published/products?slug=… — public catalogue for a storefront.
 * Public, no auth: resolves the published site's owner server-side (same
 * pattern as api/published/lead.ts), then returns only that owner's
 * `status='active'` products, and only DISPLAY-SAFE fields — no
 * `clerk_user_id`, no raw `stock` (just a computed `inStock`). Draft/archived
 * products never appear here, and never a product belonging to any other
 * merchant.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const slug = queryParam(req, 'slug')
  if (!slug) return sendJson(res, 400, { error: 'slug is required.' })

  const siteRows = (await sql`
    select clerk_user_id from autoleadss.funnels where slug = ${slug} and status = 'published'
  `) as unknown as { clerk_user_id: string }[]
  const site = siteRows[0]
  if (!site) return sendJson(res, 404, { error: `Store not found or not published: ${slug}` })

  const rows = (await sql`
    select id, name, description, image_url, price_minor, currency, stock
    from autoleadss.products
    where clerk_user_id = ${site.clerk_user_id} and status = 'active'
    order by created_at desc
  `) as unknown as ProductRow[]

  const products: PublicProduct[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    imageUrl: r.image_url ?? undefined,
    priceMinor: toSafeInt(r.price_minor, 'price_minor'),
    currency: r.currency,
    inStock: r.stock > 0,
  }))
  return sendJson(res, 200, { products })
}
