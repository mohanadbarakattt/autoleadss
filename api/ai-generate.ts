import { requireClerkUser } from './_lib/auth'
import { getSql } from './_lib/db'
import { incrementUsageCounter } from './_lib/usage'
import { methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from './_lib/http'
import { entitlementFor } from '../src/saas/entitlements'
import type { PlanId } from '../src/saas/types'

const KNOWN_PLANS: readonly PlanId[] = ['starter', 'growth', 'pro', 'dwy', 'whitelabel']

interface AiGenerateBody {
  businessName?: string
  industry?: string
  language?: string
  goal?: string
  tone?: string
  plan?: string
}

/**
 * POST /api/ai-generate — optional AI-copy path for the wizard, proxied through the
 * shared MBAI Model Gateway (~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md). The
 * SPA never holds MBAI_GATEWAY_KEY; this function is the only thing that talks to
 * the gateway, using server-only env vars.
 *
 * Requires a valid Clerk session token, same as the other api/ functions. When
 * MBAI_GATEWAY_URL / MBAI_GATEWAY_KEY aren't both set, responds 503 so the wizard
 * falls back to its existing template-only generation — that fallback path must
 * stay byte-for-byte identical to today's demo experience.
 *
 * Also enforces the AI-action cap server-side once the Neon usage backend is live
 * (see the "AI-action cap backstop" block below) — this is the real enforcement
 * point, not just the wizard's client-side gate.
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

  const body = (req.body ?? {}) as AiGenerateBody
  const businessName = typeof body.businessName === 'string' ? body.businessName.slice(0, 200) : ''
  const industry = typeof body.industry === 'string' ? body.industry.slice(0, 100) : ''
  const language = body.language === 'ar' ? 'ar' : 'en'
  const goal = typeof body.goal === 'string' ? body.goal.slice(0, 100) : ''
  const tone = typeof body.tone === 'string' ? body.tone.slice(0, 100) : ''

  if (!businessName || !industry) {
    return sendJson(res, 400, { error: 'businessName and industry are required.' })
  }

  // --- Server-side AI-action cap backstop (the actual enforcement point) -------
  // The wizard's client-side gate (src/saas/pages/Wizard.tsx's `aiActionGate`) is
  // only a UX nicety — anyone who calls this endpoint directly bypasses it
  // entirely. When the Neon usage backend is live, every call increments the same
  // `autoleadss.usage_counters` row the client reads (api/usage), atomically, and
  // a hard cap being exceeded is refused here with a 429 before the (costly)
  // gateway call is ever made. In demo mode (no DATABASE_URL) this block is a
  // no-op and the client-only metering in src/saas/billing/usage.ts is the sole
  // gate, exactly as before this backstop existed.
  //
  // The plan itself is still reported by the authenticated caller (honor system —
  // same trust level as the rest of this app's billing: Pricing.tsx's "upgrade"
  // flow already lets a signed-in user set their own plan for free, since real
  // checkout isn't wired yet; see billing/checkout.ts's `billingEnabled`). An
  // unrecognized/missing plan falls back to Growth's cap rather than "uncapped".
  const sql = getSql()
  if (sql) {
    const plan: PlanId = KNOWN_PLANS.includes(body.plan as PlanId) ? (body.plan as PlanId) : 'growth'
    const cap = entitlementFor(plan).aiActionCap
    if (cap) {
      const usage = await incrementUsageCounter(sql, userId, 'aiAction')
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

  const system =
    'You are AutoLeadss\'s funnel copywriter. Write high-converting, natural, market-appropriate landing-page hero copy for businesses in Egypt and the Gulf. When the language is "ar", write natural Modern Standard Arabic suited to the Gulf/Egyptian market. Respond with ONLY a JSON object of the exact shape {"eyebrow": string, "headline": string, "subhead": string, "ctaPrimary": string} — no prose, no markdown fences.'
  const user = `Business: ${businessName}\nIndustry: ${industry}\nLanguage: ${language}\nPrimary goal: ${goal || 'leads'}\nTone: ${tone || 'bold'}`

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
        model: 'mbai-franco',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 400,
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

  return sendJson(res, 200, { text })
}
