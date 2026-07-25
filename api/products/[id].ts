import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, queryParam, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { isValidPriceMinor, isValidStock, normalizeCurrency } from '../_lib/mapping'
import { isValidHttpsUrl } from '../../src/saas/lib/agencyBrand'
import type { Product } from '../../src/saas/types'

const STATUSES: Product['status'][] = ['draft', 'active', 'archived']

/**
 * PATCH /api/products/:id — update.
 * DELETE /api/products/:id — delete, UNLESS the product appears on any of the
 * caller's order_items, in which case it's archived instead (accounting
 * history must survive a merchant deleting a sold product — see the
 * order_items comment in migration 0005_sell.sql). Returns which happened.
 * Both owner-scoped.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const id = queryParam(req, 'id')
  if (!id) return sendJson(res, 400, { error: 'Missing product id.' })

  if (req.method === 'DELETE') {
    // Scoped to the caller's own products via the join, so probing another
    // user's product id can never reveal whether it's referenced on an order —
    // it just falls through to a delete that (owner-scoped below) affects 0 rows.
    const referenced = (await sql`
      select 1 from autoleadss.order_items oi
      join autoleadss.products p on p.id = oi.product_id
      where oi.product_id = ${id} and p.clerk_user_id = ${userId}
      limit 1
    `) as unknown as unknown[]

    if (referenced.length) {
      await sql`update autoleadss.products set status = 'archived', updated_at = now() where id = ${id} and clerk_user_id = ${userId}`
      return sendJson(res, 200, { ok: true, action: 'archived' })
    }
    await sql`delete from autoleadss.products where id = ${id} and clerk_user_id = ${userId}`
    return sendJson(res, 200, { ok: true, action: 'deleted' })
  }

  if (req.method === 'PATCH') {
    // Never rewrite the PK or the owner; whitelist columns explicitly.
    const patch = (req.body ?? {}) as Partial<Product>
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    function col(name: string, value: unknown) {
      fields.push(`${name} = $${i++}`)
      values.push(value)
    }

    if (patch.name !== undefined) {
      if (!patch.name.trim()) return sendJson(res, 400, { error: 'name cannot be empty.' })
      col('name', patch.name.trim())
    }
    if (patch.description !== undefined) col('description', patch.description ?? null)
    if (patch.imageUrl !== undefined) {
      if (patch.imageUrl && !isValidHttpsUrl(patch.imageUrl)) return sendJson(res, 400, { error: 'imageUrl must be an https:// URL.' })
      col('image_url', patch.imageUrl ?? null)
    }
    if (patch.priceMinor !== undefined) {
      if (!isValidPriceMinor(patch.priceMinor)) return sendJson(res, 400, { error: 'priceMinor must be a positive integer.' })
      col('price_minor', patch.priceMinor)
    }
    if (patch.currency !== undefined) {
      const currency = normalizeCurrency(patch.currency)
      if (!currency) return sendJson(res, 400, { error: 'currency must be a 3-letter ISO code.' })
      col('currency', currency)
    }
    if (patch.stock !== undefined) {
      if (!isValidStock(patch.stock)) return sendJson(res, 400, { error: 'stock must be a non-negative integer.' })
      col('stock', patch.stock)
    }
    if (patch.status !== undefined) {
      if (!STATUSES.includes(patch.status)) return sendJson(res, 400, { error: 'invalid status.' })
      col('status', patch.status)
    }
    col('updated_at', new Date().toISOString())

    if (!fields.length) return sendJson(res, 400, { error: 'No updatable fields in body.' })

    values.push(id, userId)
    const idPlaceholder = `$${i++}`
    const ownerPlaceholder = `$${i++}`
    await sql.query(
      `update autoleadss.products set ${fields.join(', ')} where id = ${idPlaceholder} and clerk_user_id = ${ownerPlaceholder}`,
      values,
    )
    return sendJson(res, 200, { ok: true })
  }

  return methodNotAllowed(res, ['PATCH', 'DELETE'])
}
