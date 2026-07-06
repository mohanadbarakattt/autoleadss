// AutoLeadss — real AI funnel generation (streaming).
// Deno / Supabase Edge Function. Streams newline-delimited JSON progress events,
// then a final { type: "done", spec } event. Requires the ANTHROPIC_API_KEY secret:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Optional model overrides: ANTHROPIC_MODEL_FUNNEL / _ADSOCIAL / _CHATBOT.
// If the key is missing it emits { type: "error", reason: "no-key" } so the client
// gracefully falls back to the on-device template generator (site keeps working).

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Multi-model router (matches lib/ai/model-router.json). Current-generation Claude IDs.
const MODELS = {
  funnel: Deno.env.get('ANTHROPIC_MODEL_FUNNEL') ?? 'claude-sonnet-5',
  adsocial: Deno.env.get('ANTHROPIC_MODEL_ADSOCIAL') ?? 'claude-sonnet-5',
  chatbot: Deno.env.get('ANTHROPIC_MODEL_CHATBOT') ?? 'claude-haiku-4-5-20251001',
}

const KEY = Deno.env.get('ANTHROPIC_API_KEY')

interface WizardInput {
  industry: string
  businessName: string
  language: 'en' | 'ar'
  region: string
  goal: string
  tone: string
  audience?: string
}

async function claude(model: string, system: string, user: string, maxTokens: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.content ?? []).map((c: { text?: string }) => c.text ?? '').join('')
}

function parseJSON<T>(text: string): T {
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s < 0 || e < 0) throw new Error('no json')
  return JSON.parse(text.slice(s, e + 1)) as T
}

// FunnelSpec skeleton (mirrors src/saas/types.ts) used to shape model output.
const PAGE_SHAPE = `{
  "hero": { "eyebrow": "", "headline": "", "subhead": "", "ctaPrimary": "", "ctaSecondary": "", "badges": ["","",""] },
  "stats": [{ "value": "", "label": "" }],
  "features": [{ "title": "", "body": "", "icon": "Zap" }],
  "testimonials": [{ "quote": "", "name": "", "role": "" }],
  "faq": [{ "q": "", "a": "" }],
  "finalCta": { "headline": "", "sub": "", "cta": "" },
  "leadForm": { "title": "", "fields": ["","",""], "button": "" }
}`
const ICONS = 'Zap, Target, TrendingUp, MessageCircle, Clock, Shield, Star, Users, Rocket, CheckCircle, Phone, Calendar, Sparkles, BarChart, Globe, Heart'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  let input: WizardInput
  try {
    input = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (o: unknown) => controller.enqueue(enc.encode(JSON.stringify(o) + '\n'))
      const ar = input.language === 'ar'
      const step = (en: string, arr: string) => send({ type: 'step', label: ar ? arr : en })

      if (!KEY) {
        send({ type: 'error', reason: 'no-key' })
        controller.close()
        return
      }

      const lang = ar ? 'Arabic (natural Modern Standard Arabic for the MENA market)' : 'English'
      const brief = `Business: ${input.businessName} | Industry: ${input.industry} | Goal: ${input.goal} | Tone: ${input.tone} | Region: ${input.region}${input.audience ? ` | Audience: ${input.audience}` : ''}`

      try {
        step('Analyzing brand brief', 'تحليل ملخّص العلامة')

        // 1 — Landing page blueprint (funnel_copy → Sonnet/Fable)
        step('Assembling landing page blueprint', 'تجميع مخطّط صفحة الهبوط')
        const page = parseJSON(
          await claude(
            MODELS.funnel,
            `You are AutoLeadss's funnel generator. Write high-converting, natural sales-funnel LANDING PAGE copy in ${lang}. Icons must be from: ${ICONS}. Output ONLY a JSON object — no prose, no markdown fences.`,
            `${brief}\nReturn a landing page as JSON exactly matching this shape (4-6 features, 3 stats, 3 testimonials with realistic local names, 5 faq):\n${PAGE_SHAPE}`,
            3000,
          ),
        )

        // 2 — Ads + social creatives (ad_social_copy → Sonnet)
        step('Writing ad & social creatives', 'كتابة الإعلانات والسوشيال')
        const adsSocial = parseJSON<{ ads: unknown[]; social: unknown[] }>(
          await claude(
            MODELS.adsocial,
            `You write paid ads and social posts for MENA businesses in ${lang}. Output ONLY JSON.`,
            `${brief}\nReturn JSON: {"ads":[{"platform":"google|meta|tiktok","headline":"","description":"","cta":""}] (4 items), "social":[{"platform":"","caption":"","hashtags":["","",""]}] (6 items)}`,
            2000,
          ),
        )

        // 3 — WhatsApp automation (chatbot_reply → Haiku)
        step('Building WhatsApp automation', 'بناء أتمتة واتساب')
        const chatbot = parseJSON(
          await claude(
            MODELS.chatbot,
            `You design a WhatsApp sales chatbot flow for a MENA business in ${lang}, WhatsApp tone. Output ONLY JSON.`,
            `${brief}\nReturn JSON: {"greeting":"","qualifyingQuestions":["","",""],"flow":[{"trigger":"","response":""}] (5 items),"bookingMessage":""}`,
            1500,
          ),
        )

        step('Finishing touches', 'اللمسات الأخيرة')
        send({
          type: 'done',
          engine: 'ai',
          spec: {
            industry: input.industry,
            language: input.language,
            businessName: input.businessName,
            page,
            ads: adsSocial.ads,
            social: adsSocial.social,
            chatbot,
          },
        })
      } catch (e) {
        send({ type: 'error', reason: String(e) })
      }
      controller.close()
    },
  })

  return new Response(stream, { headers: { ...cors, 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' } })
})
