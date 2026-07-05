import type { FunnelSpec, WizardInput } from '../types'
import { TEMPLATES } from '../content/templates'

/** Deep-clone a spec and replace every occurrence of `from` with `to` across all strings. */
function rebrand<T>(node: T, from: string, to: string): T {
  if (typeof node === 'string') {
    return (from && to ? node.split(from).join(to) : node) as unknown as T
  }
  if (Array.isArray(node)) return node.map((n) => rebrand(n, from, to)) as unknown as T
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node)) out[k] = rebrand(v, from, to)
    return out as T
  }
  return node
}

export function pickTemplate(industry: string, language: string): FunnelSpec {
  return (
    TEMPLATES[`${industry}.${language}`] ??
    TEMPLATES[`services.${language}`] ??
    TEMPLATES[`real-estate.${language}`] ??
    TEMPLATES['real-estate.en']
  )
}

/** Personalize a template for a specific business (the demo-mode / fallback generator). */
export function generateFromTemplate(input: WizardInput): FunnelSpec {
  const base = pickTemplate(input.industry, input.language)
  const spec = rebrand(base, base.businessName, input.businessName || base.businessName)
  spec.businessName = input.businessName || base.businessName
  spec.industry = input.industry
  spec.language = input.language

  // Light goal-aware CTA tuning so the funnel reflects the chosen objective.
  const goalCta: Record<string, { en: string; ar: string }> = {
    bookings: { en: 'Book now', ar: 'احجز الآن' },
    sales: { en: 'Shop now', ar: 'تسوّق الآن' },
    calls: { en: 'Message us', ar: 'راسلنا' },
    leads: { en: input.language === 'ar' ? 'اطلب عرضاً' : 'Get a quote', ar: 'اطلب عرضاً' },
  }
  const g = goalCta[input.goal]
  if (g) {
    spec.page.hero.ctaPrimary = input.language === 'ar' ? g.ar : g.en
    spec.page.finalCta.cta = spec.page.hero.ctaPrimary
  }
  return spec
}

/** System + user prompt for the real-AI path (used when ANTHROPIC_API_KEY is set). */
export function buildGenerationPrompt(input: WizardInput): { system: string; user: string } {
  const example = pickTemplate(input.industry, input.language)
  const system = `You are AutoLeadss's funnel generator. You write high-converting, natural, market-appropriate sales-funnel copy for businesses in Egypt and the Gulf. When the language is "ar", write natural Modern Standard Arabic suited to the Gulf/Egyptian market. Output ONLY a JSON object exactly matching the provided schema — no prose, no markdown fences.`
  const user = `Generate a complete funnel spec.
Business: ${input.businessName}
Industry: ${input.industry}
Language: ${input.language}
Region: ${input.region}
Primary goal: ${input.goal}
Tone: ${input.tone}
${input.audience ? `Audience: ${input.audience}` : ''}

Match this JSON shape exactly (same keys, same nesting), but with fresh, tailored content:
${JSON.stringify(example)}`
  return { system, user }
}
