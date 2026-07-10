import type { FunnelSpec, WizardInput } from '../types'
import { generateFromTemplate } from './generate'
import { getDb } from '../store'

interface AiHeroCopy {
  eyebrow?: string
  headline?: string
  subhead?: string
  ctaPrimary?: string
}

/**
 * Optional AI-copy path, proxied through `/api/ai-generate` (which in turn talks to
 * the shared MBAI Model Gateway server-side — the SPA never holds
 * MBAI_GATEWAY_KEY; see ~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md).
 *
 * Returns `null` — same as always — whenever there's no signed-in remote session,
 * no Clerk token, the gateway isn't configured (503), or anything about the call
 * fails. That keeps the demo-mode / no-key experience byte-for-byte identical to
 * before this was added: `generateFunnel` below falls back to the template
 * generator exactly as it did when this always returned `null`.
 */
export async function generateLive(input: WizardInput, _onStep: (label: string) => void): Promise<FunnelSpec | null> {
  const remote = getDb()
  if (!remote) return null

  const token = await remote.getToken()
  if (!token) return null

  let res: Response
  try {
    res = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({
        businessName: input.businessName,
        industry: input.industry,
        language: input.language,
        goal: input.goal,
        tone: input.tone,
      }),
    })
  } catch {
    return null
  }
  if (!res.ok) return null

  let copy: AiHeroCopy | null = null
  try {
    const data = (await res.json()) as { text?: string }
    if (data.text) copy = JSON.parse(data.text) as AiHeroCopy
  } catch {
    return null
  }
  if (!copy || !copy.headline) return null

  const spec = generateFromTemplate(input)
  spec.page.hero = {
    ...spec.page.hero,
    eyebrow: copy.eyebrow || spec.page.hero.eyebrow,
    headline: copy.headline,
    subhead: copy.subhead || spec.page.hero.subhead,
    ctaPrimary: copy.ctaPrimary || spec.page.hero.ctaPrimary,
  }
  spec.page.finalCta = { ...spec.page.finalCta, cta: spec.page.hero.ctaPrimary }
  return spec
}

/**
 * The one call the wizard makes. Tries real streaming AI; on any failure (or, for
 * now, always), streams the simulated steps and returns a personalized template
 * funnel so the flow always completes.
 */
export async function generateFunnel(
  input: WizardInput,
  onStep: (label: string) => void,
  fallbackSteps: string[],
): Promise<{ spec: FunnelSpec; engine: 'ai' | 'template' }> {
  const live = await generateLive(input, onStep)
  if (live) return { spec: live, engine: 'ai' }

  for (const s of fallbackSteps) {
    onStep(s)
    await new Promise((r) => setTimeout(r, 480))
  }
  return { spec: generateFromTemplate(input), engine: 'template' }
}
