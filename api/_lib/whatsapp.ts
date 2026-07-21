import type { NeonQueryFunction } from '@neondatabase/serverless'

/**
 * WhatsApp Business conversation rules.
 *
 * Meta bills per CONVERSATION, not per message, and the category is set by who
 * opens it. A customer-initiated message opens a 24-hour SERVICE window during
 * which replies are free (historically) and charged as one conversation.
 *
 * This matters for money, not just correctness: metering per message would
 * over-charge our own customers several times over for a single exchange.
 *
 * ⚠ Two 2026 policy changes to watch (see mbai-ecosystem/docs/EGYPT-ECONOMICS.md):
 *   1. Meta is withdrawing the free 24h service window, so these become billable.
 *   2. AI-answered messages may fall under Business Agent token pricing instead
 *      of the per-conversation rate — a different cost shape entirely, and this
 *      feature is exactly that shape.
 * The window logic below stays correct either way; only the RATE changes.
 */
export const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000

export type Sql = NeonQueryFunction<false, false>

/**
 * Is there an open service window for this customer?
 *
 * True when they messaged us within the last 24h, which means a reply is part
 * of the SAME conversation and must not be metered again.
 */
export async function hasOpenServiceWindow(
  sql: Sql,
  connectionId: string,
  waFrom: string,
  now: Date = new Date(),
): Promise<boolean> {
  const cutoff = new Date(now.getTime() - SERVICE_WINDOW_MS)
  const rows = (await sql`
    select 1 from autoleadss.whatsapp_messages
    where connection_id = ${connectionId}
      and wa_from = ${waFrom}
      and direction = 'in'
      and created_at > ${cutoff.toISOString()}
    limit 1
  `) as unknown as unknown[]
  return rows.length > 0
}

/**
 * Should this inbound message open a NEW billable conversation?
 *
 * Only when no window is already open. Returns the decision so the caller can
 * meter exactly once per conversation rather than once per message.
 */
export async function opensNewConversation(
  sql: Sql,
  connectionId: string,
  waFrom: string,
  now: Date = new Date(),
): Promise<boolean> {
  return !(await hasOpenServiceWindow(sql, connectionId, waFrom, now))
}
