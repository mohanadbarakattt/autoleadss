import { requireClerkUser } from '../_lib/auth'
import { methodNotAllowed, sendJson, type VercelApiRequest, type VercelApiResponse } from '../_lib/http'
import { buildFollowUpPrompt, templateFollowUp, type FollowUpInput } from '../../src/saas/ai/followUp'

/**
 * POST /api/leads/follow-up — drafts a WhatsApp instant-reply message for a
 * captured lead via the shared MBAI Model Gateway (model "mbai-franco"), same
 * proxy pattern as `api/ai-generate.ts`. Requires a valid Clerk session token —
 * the SPA never holds MBAI_GATEWAY_KEY.
 *
 * Responds 503 when MBAI_GATEWAY_URL / MBAI_GATEWAY_KEY aren't both set, so the
 * client (`src/saas/ai/followUp.ts`'s `generateFollowUp`) falls back to its
 * keyless template — that fallback must stay usable in demo mode.
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

  const body = (req.body ?? {}) as Partial<FollowUpInput>
  if (!body.businessName || !body.leadName || !body.offer) {
    return sendJson(res, 400, { error: 'businessName, leadName, and offer are required.' })
  }
  const input: FollowUpInput = {
    businessName: body.businessName.slice(0, 200),
    industry: (body.industry ?? '').slice(0, 100),
    language: body.language === 'ar' ? 'ar' : 'en',
    offer: body.offer.slice(0, 300),
    leadName: body.leadName.slice(0, 100),
    leadMessage: typeof body.leadMessage === 'string' ? body.leadMessage.slice(0, 500) : undefined,
  }

  const { system, user } = buildFollowUpPrompt(input)

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
        temperature: 0.8,
        max_tokens: 300,
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

  const cleaned = text?.trim().replace(/^```\s*/, '').replace(/```\s*$/, '').replace(/^"|"$/g, '')
  return sendJson(res, 200, { text: cleaned || templateFollowUp(input) })
}
