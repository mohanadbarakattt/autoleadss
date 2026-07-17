import { getDb } from '../store'
import { buildDemoAdSet, mergeAdResult } from './generate'
import type { AdPlatform } from './specs'
import type { AdSuiteInput, PlatformAdResult } from './types'

export interface AdGenResult {
  result: PlatformAdResult
  engine: 'ai' | 'demo'
  /** Server's aiAction cap backstop (api/ad-suite.ts) refused this call (HTTP 429) —
   * the demo sample is still returned so the step always completes. */
  capExceeded?: boolean
  /** True when api/ad-suite.ts already incremented the usage counter for this call —
   * mirrors ai/generateLive.ts's usageRecorded so the caller skips a redundant
   * client-side /api/usage POST. */
  usageRecorded?: boolean
}

/**
 * One request per platform, proxied through `/api/ad-suite` (server-side MBAI
 * Model Gateway call — the SPA never holds MBAI_GATEWAY_KEY). Falls back to the
 * keyless demo sample (built from the user's actual inputs) on any failure — no
 * signed-in remote session, no Clerk token, gateway not configured (503), a
 * non-2xx response, an unparseable body, or AI output that doesn't validate —
 * so the Ad Suite always completes, same guarantee as the funnel wizard's
 * generateFunnel in ai/generateLive.ts.
 */
export async function generateAdsForPlatform(input: AdSuiteInput, platform: AdPlatform): Promise<AdGenResult> {
  const remote = getDb()
  if (!remote) return { result: buildDemoAdSet(platform, input), engine: 'demo' }

  const token = await remote.getToken()
  if (!token) return { result: buildDemoAdSet(platform, input), engine: 'demo' }

  let res: Response
  try {
    res = await fetch('/api/ad-suite', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({
        platform,
        businessName: input.businessName,
        industry: input.industry,
        language: input.language,
        tone: input.tone,
        description: input.description,
        plan: input.plan,
      }),
    })
  } catch {
    return { result: buildDemoAdSet(platform, input), engine: 'demo' }
  }
  if (res.status === 429) return { result: buildDemoAdSet(platform, input), engine: 'demo', capExceeded: true }
  if (!res.ok) return { result: buildDemoAdSet(platform, input), engine: 'demo' }

  let ai: unknown
  let usageRecorded = false
  try {
    const data = (await res.json()) as { text?: string; usageRecorded?: boolean }
    if (data.text) ai = JSON.parse(data.text)
    usageRecorded = data.usageRecorded === true
  } catch {
    return { result: buildDemoAdSet(platform, input), engine: 'demo' }
  }

  const merged = mergeAdResult(platform, input, ai)
  if (!merged) return { result: buildDemoAdSet(platform, input), engine: 'demo' }
  return { result: merged, engine: 'ai', usageRecorded }
}
