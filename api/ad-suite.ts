import { requireClerkUser } from './_lib/auth'
import { getSql } from './_lib/db'
import { incrementUsageCounter } from './_lib/usage'
import { methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from './_lib/http'
import { entitlementFor } from '../src/saas/entitlements'
import { buildAdPrompt } from '../src/saas/ads/generate'
import { AD_PLATFORMS, type AdPlatform } from '../src/saas/ads/specs'
import type { AdSuiteInput } from '../src/saas/ads/types'
import type { Industry, PlanId, Tone } from '../src/saas/types'

const KNOWN_PLANS: readonly PlanId[] = ['starter', 'growth', 'pro', 'dwy', 'whitelabel']

interface AdSuiteBody {
  platform?: string
  businessName?: string
  industry?: string
  language?: string
  tone?: string
  description?: string
  plan?: string
}

/**
 * POST /api/ad-suite — one call per selected platform for the Ad Suite wizard
 * (/app/ads), proxied through the shared MBAI Model Gateway. Mirrors
 * api/ai-generate.ts's structure, auth, and usage-cap handling exactly (see that
 * file's header comment for the full rationale) — the SPA never holds
 * MBAI_GATEWAY_KEY, and when MBAI_GATEWAY_URL / MBAI_GATEWAY_KEY aren't both set
 * this responds 503 so the client falls back to its keyless demo sample
 * (src/saas/ads/generateLive.ts), built from the caller's actual inputs.
 *
 * The 200 response's `usageRecorded` mirrors ai-generate.ts's: true whenever this
 * call already incremented `autoleadss.usage_counters`, so the client
 * (useCapGate('aiAction').record) skips its own redundant /api/usage POST.
 */
export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const userId = await requireClerkUser(req)
  if (!userId) return sendJson(res, 401, { error: 'Missing or invalid Clerk session token.' })

  const gatewayUrl = process.env.MBAI_GATEWAY_URL
  const gatewayKey = process.env.MBAI_GATEWAY_KEY
  if (!gatewayUrl || !gatewayKey) {
    return sendJson(res, 503, { error: 'gateway not configured' })
  }

  const body = (req.body ?? {}) as AdSuiteBody
  const platform = AD_PLATFORMS.includes(body.platform as AdPlatform) ? (body.platform as AdPlatform) : null
  const businessName = typeof body.businessName === 'string' ? body.businessName.slice(0, 200) : ''
  const industry = typeof body.industry === 'string' ? body.industry.slice(0, 100) : ''
  const language = body.language === 'ar' ? 'ar' : 'en'
  const tone = typeof body.tone === 'string' ? body.tone.slice(0, 100) : 'bold'
  const description = typeof body.description === 'string' ? body.description.slice(0, 500) : undefined

  if (!platform || !businessName || !industry) {
    return sendJson(res, 400, { error: 'platform, businessName and industry are required.' })
  }

  // --- Server-side AI-action cap backstop — identical to api/ai-generate.ts ---
  const sql = getSql()
  let usageRecorded = false
  if (sql) {
    const plan: PlanId = KNOWN_PLANS.includes(body.plan as PlanId) ? (body.plan as PlanId) : 'growth'
    const cap = entitlementFor(plan).aiActionCap
    // Always meter, cap only where a limit exists — see the same note in
    // api/ai-generate.ts. Plans with a null cap were recording nothing, so
    // their AI spend was invisible rather than just uncapped.
    const usage = await incrementUsageCounter(sql, userId, 'aiAction')
    usageRecorded = true
    if (cap) {
      if (cap.type === 'hard' && usage.aiAction > cap.limit) {
        return sendJson(res, 429, {
          error: 'ai_action_cap_exceeded',
          message: `This month's AI-action limit (${cap.limit}) has been reached.`,
          period: usage.period,
          used: usage.aiAction,
          limit: cap.limit,
        })
      }
    }
  }

  const input: AdSuiteInput = {
    businessName,
    industry: industry as Industry,
    language,
    tone: tone as Tone,
    accent: '#000000',
    description,
  }
  const { system, user } = buildAdPrompt(platform, input)

  let upstream: Response
  try {
    upstream = await fetch(`${gatewayUrl}/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gatewayKey}`,
        'x-mbai-user': userId,
      },
      body: JSON.stringify({
        // Semantic alias — the gateway picks the model (see its routing.ts).
        // Ad copy is the complex-text lane.
        model: 'mbai-smart',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })
  } catch (e) {
    return sendJson(res, 502, { error: `Gateway request failed: ${e instanceof Error ? e.message : 'unknown error'}` })
  }

  if (!upstream.ok) {
    return sendJson(res, 502, { error: `Gateway returned HTTP ${upstream.status}.` })
  }

  let text: string | undefined
  try {
    const data = (await upstream.json()) as { text?: string; content?: string; message?: { content?: string } }
    text = data.text ?? data.content ?? data.message?.content
  } catch {
    return sendJson(res, 502, { error: 'Gateway returned an unparseable response.' })
  }

  if (!text) return sendJson(res, 502, { error: 'Gateway returned no content.' })

  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')

  return sendJson(res, 200, { text: cleaned, usageRecorded })
}
