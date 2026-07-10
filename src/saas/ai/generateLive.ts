import type { FunnelSpec, WizardInput } from '../types'
import { generateFromTemplate } from './generate'

/**
 * Real streaming AI generation was wired to a Supabase Edge Function
 * (`generate-funnel`) before the Phase 2 migration to the shared Neon backend. That
 * edge function depended on the Supabase project being removed in this phase (see
 * docs/SETUP.md), so it's gone too, and this always returns `null` (template-only)
 * for now. Wiring generation to the shared MBAI Model Gateway (`MBAI_GATEWAY_URL` /
 * `MBAI_GATEWAY_KEY` — see ~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md) is a
 * reasonable follow-up but is out of scope for this phase (funnels/leads/publish
 * persistence only).
 */
export async function generateLive(_input: WizardInput, _onStep: (label: string) => void): Promise<FunnelSpec | null> {
  return null
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
