/**
 * WhatsApp-AI / AI-action usage counters, backed by the shared Neon Postgres
 * project via `api/usage` (see `api/db/migrations/0002_usage_counters.sql`) —
 * same pattern as db/api.ts's funnels/leads. Unlike domains.ts/whatsapp.ts, this
 * one is real: it's the actual cost-control mechanism behind entitlements.ts's
 * `whatsappCap`/`aiActionCap`, so it doesn't stay demo-only.
 */
import type { RemoteAuth } from './api'
import { authedRequest } from './api'

export interface UsagePeriod {
  period: string
  whatsapp: number
  aiAction: number
}

export type UsageMetric = 'whatsapp' | 'aiAction'

export async function fetchUsage(auth: RemoteAuth): Promise<UsagePeriod> {
  return authedRequest<UsagePeriod>(auth, '/api/usage')
}

export async function incrementUsage(auth: RemoteAuth, metric: UsageMetric, by = 1): Promise<UsagePeriod> {
  return authedRequest<UsagePeriod>(auth, '/api/usage', { method: 'POST', body: JSON.stringify({ metric, by }) })
}
