import type { NeonQueryFunction } from '@neondatabase/serverless'
import { getGatewayInfo } from './registry'

/**
 * The owner's connected + actually-`implemented` gateway id, if any — the
 * exact predicate api/published/order.ts enforces (409 `payments_not_connected`
 * when none). Shared with api/published/products.ts's display-safe
 * `acceptsPayments` hint so the two can never disagree: the hint is computed
 * from this same query, not a re-derived approximation.
 */
export async function connectedImplementedGateway(
  sql: NeonQueryFunction<false, false>,
  ownerId: string,
): Promise<string | undefined> {
  const rows = (await sql`
    select gateway from autoleadss.payment_connections where clerk_user_id = ${ownerId} and status = 'connected'
  `) as unknown as { gateway: string }[]
  return rows.find((c) => getGatewayInfo(c.gateway)?.implemented)?.gateway
}
