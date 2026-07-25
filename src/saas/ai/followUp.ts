import type { Funnel, Lead } from '../types'
import { getDb } from '../store'
import { generateFollowUpRemote } from '../db/api'
import { followUpInputFor, templateFollowUp } from './followUpPrompt'

export type { FollowUpInput } from './followUpPrompt'
export { buildFollowUpPrompt, templateFollowUp, followUpInputFor } from './followUpPrompt'

/** Tries the real AI path (through `/api/leads/follow-up`, gateway-backed); falls
 * back to the local template on any failure — no remote session, gateway not
 * configured, network error, or an empty response. Mirrors `generateLive.ts`'s
 * fallback shape so a signed-out/demo user always gets a usable draft. */
export async function generateFollowUp(funnel: Funnel, lead: Lead): Promise<string> {
  const input = followUpInputFor(funnel, lead)
  const remote = getDb()
  if (remote) {
    try {
      const text = await generateFollowUpRemote(remote, input)
      if (text) return text
    } catch {
      /* fall through to the template */
    }
  }
  return templateFollowUp(input)
}
