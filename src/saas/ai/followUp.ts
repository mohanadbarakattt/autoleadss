import type { Funnel, Lead } from '../types'
import { getDb } from '../store'
import { generateFollowUpRemote } from '../db/api'

export interface FollowUpInput {
  businessName: string
  industry: string
  language: 'en' | 'ar'
  /** The funnel's core value prop — what the business is actually offering the lead. */
  offer: string
  leadName: string
  leadMessage?: string
}

/**
 * Shared prompt builder — used both by the client (to know what it's asking for)
 * and by `api/leads/follow-up.ts` (the only place that actually holds the gateway
 * key). Kept in sync with `buildGenerationPrompt`'s style in `./generate.ts`.
 */
export function buildFollowUpPrompt(input: FollowUpInput): { system: string; user: string } {
  const system = `You are AutoLeadss's instant lead-reply writer. Given a business and a lead who just submitted an inquiry, write ONE short WhatsApp message the business owner can send right away. Write in warm, natural Egyptian colloquial Arabic (the "Franco" register — casual spoken Egyptian Arabic, not formal MSA), even if the business's own funnel language is English. Greet the lead by name, reference what they asked about, and invite them to continue the conversation — no hard sales pitch, no emojis overload (at most one), no markdown. Output ONLY the message text, nothing else.`
  const user = `Business: ${input.businessName} (${input.industry})
What the business offers: ${input.offer}
Lead's name: ${input.leadName}
${input.leadMessage ? `What the lead said: ${input.leadMessage}` : 'The lead didn’t leave a message — they just submitted their info.'}

Write the WhatsApp reply now.`
  return { system, user }
}

/** Keyless template fallback — used whenever the gateway isn't configured/reachable,
 * so "Instant reply" always produces something, demo mode included. */
export function templateFollowUp(input: FollowUpInput): string {
  const firstName = input.leadName.trim().split(/\s+/)[0] || input.leadName
  if (input.language === 'ar') {
    return `أهلاً ${firstName} 🙏، شكراً لتواصلك مع ${input.businessName}!\nشفت طلبك${input.leadMessage ? ` بخصوص "${input.leadMessage}"` : ''} وحابب أساعدك بخصوص ${input.offer}.\nتحب أكلمك دلوقتي ولا أبعتلك التفاصيل هنا؟`
  }
  return `Hi ${firstName}, thanks for reaching out to ${input.businessName}!\nGot your request${input.leadMessage ? ` about "${input.leadMessage}"` : ''} — happy to help with ${input.offer}.\nWant me to call you now, or should I send the details here?`
}

export function followUpInputFor(funnel: Funnel, lead: Lead): FollowUpInput {
  return {
    businessName: funnel.name,
    industry: funnel.industry,
    language: funnel.language,
    offer: funnel.spec.page.hero.headline,
    leadName: lead.name,
    leadMessage: lead.message,
  }
}

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
