import { getSql } from '../_lib/db'
import { requireClerkUser } from '../_lib/auth'
import { backendNotConfigured, methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { orderFromRow, type OrderRow, type OrderItemRow } from '../_lib/mapping'

/**
 * GET /api/orders — the caller's (merchant's) orders, newest first, with items.
 *
 * Deliberately no order-creation endpoint here — that's Phase 4b's checkout.
 * An order may only ever be recorded here by that future checkout flow, and
 * status only ever flips to 'paid' via the Phase 3a payments webhook — never
 * from this route.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (backendNotConfigured(res)) return
  const sql = getSql()
  if (!sql) return sendJson(res, 501, { error: 'Neon backend not configured.' })

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  if (req.method === 'GET') {
    const orderRows = (await sql`
      select id, status, subtotal_minor, currency, payment_id, buyer_name, buyer_email, buyer_phone, created_at, updated_at
      from autoleadss.orders
      where clerk_user_id = ${userId}
      order by created_at desc
    `) as unknown as OrderRow[]

    const itemRows = (await sql`
      select oi.id, oi.order_id, oi.product_id, oi.name_snapshot, oi.unit_price_minor, oi.quantity, oi.currency
      from autoleadss.order_items oi
      join autoleadss.orders o on o.id = oi.order_id
      where o.clerk_user_id = ${userId}
    `) as unknown as OrderItemRow[]

    const itemsByOrder = new Map<string, OrderItemRow[]>()
    for (const item of itemRows) {
      const list = itemsByOrder.get(item.order_id) ?? []
      list.push(item)
      itemsByOrder.set(item.order_id, list)
    }

    const orders = orderRows.map((r) => orderFromRow(r, itemsByOrder.get(r.id) ?? []))
    return sendJson(res, 200, { orders })
  }

  return methodNotAllowed(res, ['GET'])
}
