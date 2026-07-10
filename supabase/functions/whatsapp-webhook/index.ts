// AutoLeadss — WhatsApp Cloud API webhook (Deno / Supabase Edge Function).
// GET  = Meta verification (matches the per-connection verify_token).
// POST = inbound messages → run the funnel's bot flow → reply via the tenant's
//        own Cloud API token (BYO WABA) → capture lead + log the conversation.
//
// Deploy PUBLIC (Meta sends no apikey):  supabase functions deploy whatsapp-webhook --no-verify-jwt
// Secrets:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (service role bypasses RLS — trusted server).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GRAPH = 'https://graph.facebook.com/v20.0'
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

const GREETINGS = ['hi', 'hello', 'hey', 'start', 'مرحبا', 'مرحباً', 'السلام', 'اهلا', 'أهلا', 'ازيك', 'عايز', 'عاوز']

function botReply(chatbot: any, text: string): string {
  const q = (text || '').toLowerCase()
  const flow: { trigger: string; response: string }[] = chatbot?.flow ?? []
  const hit = flow.find((f) => f.trigger && q.includes(String(f.trigger).toLowerCase()))
  if (hit) return hit.response
  if (GREETINGS.some((g) => q.includes(g))) return chatbot?.greeting ?? 'Hi! 👋'
  return chatbot?.bookingMessage ?? chatbot?.greeting ?? 'Thanks — a team member will reach out shortly.'
}

async function sendText(phoneNumberId: string, token: string, to: string, body: string) {
  await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  })
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // --- Verification handshake ---
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token) {
      const { data } = await admin.from('whatsapp_connections').select('id').eq('verify_token', token).limit(1)
      if (data && data.length) return new Response(challenge ?? '', { status: 200 })
    }
    return new Response('forbidden', { status: 403 })
  }

  if (req.method !== 'POST') return new Response('ok')

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return new Response('ok') // always 200 to Meta
  }

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {}
        const phoneNumberId = value.metadata?.phone_number_id
        const messages = value.messages ?? []
        if (!phoneNumberId || !messages.length) continue

        // Resolve tenant + funnel from the receiving number.
        const { data: conns } = await admin
          .from('whatsapp_connections')
          .select('id,owner_id,funnel_id,access_token')
          .eq('phone_number_id', phoneNumberId)
          .limit(1)
        const conn = conns?.[0]
        if (!conn) continue
        const { data: funnels } = await admin.from('funnels').select('spec').eq('id', conn.funnel_id).limit(1)
        const chatbot = (funnels?.[0]?.spec ?? {}).chatbot ?? {}
        const profileName = value.contacts?.[0]?.profile?.name ?? null

        for (const m of messages) {
          if (m.type !== 'text') continue
          const from = m.from
          const inbound = m.text?.body ?? ''

          await admin.from('whatsapp_messages').insert({
            owner_id: conn.owner_id, funnel_id: conn.funnel_id, wa_id: from, profile_name: profileName, direction: 'in', body: inbound,
          })

          // Capture lead once per contact.
          const { data: existing } = await admin
            .from('leads')
            .select('id')
            .eq('funnel_id', conn.funnel_id)
            .eq('phone', from)
            .limit(1)
          if (!existing?.length) {
            await admin.from('leads').insert({
              funnel_id: conn.funnel_id, owner_id: conn.owner_id, name: profileName ?? 'WhatsApp lead', phone: from, source: 'whatsapp', status: 'new',
            })
          }

          const reply = botReply(chatbot, inbound)
          await sendText(phoneNumberId, conn.access_token, from, reply)
          await admin.from('whatsapp_messages').insert({
            owner_id: conn.owner_id, funnel_id: conn.funnel_id, wa_id: from, profile_name: profileName, direction: 'out', body: reply,
          })
        }
      }
    }
  } catch (e) {
    console.error('[whatsapp-webhook]', e)
  }

  return new Response('ok', { status: 200 })
})
