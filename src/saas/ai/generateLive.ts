import type { FunnelSpec, WizardInput } from '../types'
import { generateFromTemplate } from './generate'

/**
 * Streams a real AI-generated funnel from the `generate-funnel` Supabase Edge Function,
 * reporting granular backend milestones via `onStep`. Returns the FunnelSpec, or `null`
 * if the function is unavailable / not configured (caller falls back to the template engine).
 */
export async function generateLive(input: WizardInput, onStep: (label: string) => void): Promise<FunnelSpec | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  if (!url || !key) return null

  let res: Response
  try {
    res = await fetch(`${url}/functions/v1/generate-funnel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}`, apikey: key },
      body: JSON.stringify(input),
    })
  } catch {
    return null
  }
  if (!res.ok || !res.body) return null

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let spec: FunnelSpec | null = null
  let errored = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line) continue
      let evt: { type: string; label?: string; spec?: FunnelSpec }
      try {
        evt = JSON.parse(line)
      } catch {
        continue
      }
      if (evt.type === 'step' && evt.label) onStep(evt.label)
      else if (evt.type === 'done' && evt.spec) spec = evt.spec
      else if (evt.type === 'error') errored = true
    }
  }

  if (errored || !spec) return null
  return spec
}

/**
 * The one call the wizard makes. Tries real streaming AI; on any failure, streams the
 * simulated steps and returns a personalized template funnel so the flow always completes.
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
