import type { FunnelSpec, WizardInput } from '../types'
import { generateFromTemplate } from './generate'
import { getDb } from '../store'

interface AiHeroCopy {
  eyebrow?: string
  headline?: string
  subhead?: string
  ctaPrimary?: string
}

interface LiveResult {
  spec: FunnelSpec | null
  /** True when `/api/ai-generate` refused the call with its server-side AI-action
   * cap backstop (HTTP 429) — `generateFunnel` still falls back to the free
   * template below, but the wizard uses this to show the same upgrade prompt its
   * own client-side gate would have. */
  capExceeded?: boolean
  /** True when `/api/ai-generate` already incremented `autoleadss.usage_counters`
   * for this call (its server-side cap backstop ran) — `generateFunnel` forwards
   * this so the wizard can skip its own redundant `/api/usage` POST and avoid
   * double-counting a single successful generation. */
  usageRecorded?: boolean
}

/**
 * Optional AI-copy path, proxied through `/api/ai-generate` (which in turn talks to
 * the shared MBAI Model Gateway server-side — the SPA never holds
 * MBAI_GATEWAY_KEY; see ~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md).
 *
 * Returns a null `spec` — same as always — whenever there's no signed-in remote
 * session, no Clerk token, the gateway isn't configured (503), or anything about
 * the call fails. That keeps the demo-mode / no-key experience byte-for-byte
 * identical to before this was added: `generateFunnel` below falls back to the
 * template generator exactly as it did when this always returned `null`.
 */
export async function generateLive(input: WizardInput, _onStep: (label: string) => void): Promise<LiveResult> {
  const remote = getDb()
  if (!remote) return { spec: null }

  const token = await remote.getToken()
  if (!token) return { spec: null }

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
        plan: input.plan,
      }),
    })
  } catch {
    return { spec: null }
  }
  if (res.status === 429) return { spec: null, capExceeded: true }
  if (!res.ok) return { spec: null }

  let copy: AiHeroCopy | null = null
  let usageRecorded = false
  try {
    const data = (await res.json()) as { text?: string; usageRecorded?: boolean }
    if (data.text) copy = JSON.parse(data.text) as AiHeroCopy
    usageRecorded = data.usageRecorded === true
  } catch {
    return { spec: null }
  }
  if (!copy || !copy.headline) return { spec: null }

  const spec = generateFromTemplate(input)
  spec.page.hero = {
    ...spec.page.hero,
    eyebrow: copy.eyebrow || spec.page.hero.eyebrow,
    headline: copy.headline,
    subhead: copy.subhead || spec.page.hero.subhead,
    ctaPrimary: copy.ctaPrimary || spec.page.hero.ctaPrimary,
  }
  spec.page.finalCta = { ...spec.page.finalCta, cta: spec.page.hero.ctaPrimary }
  return { spec, usageRecorded }
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
): Promise<{ spec: FunnelSpec; engine: 'ai' | 'template'; capExceeded?: boolean; usageRecorded?: boolean }> {
  const live = await generateLive(input, onStep)
  if (live.spec) return { spec: live.spec, engine: 'ai', usageRecorded: live.usageRecorded }

  for (const s of fallbackSteps) {
    onStep(s)
    await new Promise((r) => setTimeout(r, 480))
  }
  return { spec: generateFromTemplate(input), engine: 'template', capExceeded: live.capExceeded }
}
