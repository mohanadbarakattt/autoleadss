import type { NeonQueryFunction } from '@neondatabase/serverless'

export type UsageMetric = 'whatsapp' | 'aiAction'

export interface UsageCounts {
  period: string
  whatsapp: number
  aiAction: number
}

interface UsageRow {
  whatsapp_count: number
  ai_action_count: number
}

export function currentPeriod(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * Atomically increments one `autoleadss.usage_counters` column for
 * (clerk_user_id, period) and returns the resulting counts for both metrics — the
 * single `insert ... on conflict ... do update` this table's counters go through,
 * shared by `api/usage` (client-reported WhatsApp-AI/AI-action usage) and
 * `api/ai-generate` (the server-side AI-action cap backstop) so there is exactly
 * one increment statement for this table, not one per caller.
 */
export async function incrementUsageCounter(
  sql: NeonQueryFunction<false, false>,
  clerkUserId: string,
  metric: UsageMetric,
  by = 1,
): Promise<UsageCounts> {
  const period = currentPeriod()
  const rows =
    metric === 'whatsapp'
      ? ((await sql`
          insert into autoleadss.usage_counters (clerk_user_id, period, whatsapp_count)
          values (${clerkUserId}, ${period}, ${by})
          on conflict (clerk_user_id, period)
          do update set whatsapp_count = autoleadss.usage_counters.whatsapp_count + ${by}, updated_at = now()
          returning whatsapp_count, ai_action_count
        `) as unknown as UsageRow[])
      : ((await sql`
          insert into autoleadss.usage_counters (clerk_user_id, period, ai_action_count)
          values (${clerkUserId}, ${period}, ${by})
          on conflict (clerk_user_id, period)
          do update set ai_action_count = autoleadss.usage_counters.ai_action_count + ${by}, updated_at = now()
          returning whatsapp_count, ai_action_count
        `) as unknown as UsageRow[])
  const row = rows[0]
  return { period, whatsapp: row?.whatsapp_count ?? 0, aiAction: row?.ai_action_count ?? 0 }
}
