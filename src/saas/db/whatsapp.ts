import type { SupabaseClient } from '@supabase/supabase-js'

export interface WhatsAppConnection {
  id?: string
  funnelId: string
  phoneNumberId: string
  wabaId?: string
  accessToken: string
  verifyToken: string
  displayPhone?: string
  status?: string
}

function toRow(c: WhatsAppConnection) {
  return {
    funnel_id: c.funnelId,
    phone_number_id: c.phoneNumberId,
    waba_id: c.wabaId ?? null,
    access_token: c.accessToken,
    verify_token: c.verifyToken,
    display_phone: c.displayPhone ?? null,
    status: c.status ?? 'connected',
    updated_at: new Date().toISOString(),
  }
}

function fromRow(r: any): WhatsAppConnection {
  return {
    id: r.id,
    funnelId: r.funnel_id,
    phoneNumberId: r.phone_number_id,
    wabaId: r.waba_id ?? undefined,
    accessToken: r.access_token,
    verifyToken: r.verify_token,
    displayPhone: r.display_phone ?? undefined,
    status: r.status,
  }
}

export async function getConnectionForFunnel(sb: SupabaseClient, funnelId: string): Promise<WhatsAppConnection | null> {
  const { data, error } = await sb.from('whatsapp_connections').select('*').eq('funnel_id', funnelId).limit(1)
  if (error) throw new Error(error.message)
  return data?.[0] ? fromRow(data[0]) : null
}

/** Upsert a connection keyed by phone_number_id (one number → one funnel). */
export async function saveConnection(sb: SupabaseClient, c: WhatsAppConnection): Promise<void> {
  const { error } = await sb.from('whatsapp_connections').upsert(toRow(c), { onConflict: 'phone_number_id' })
  if (error) throw new Error(error.message)
}

export async function deleteConnection(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from('whatsapp_connections').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export interface Conversation {
  waId: string
  name?: string
  lastBody: string
  lastDirection: 'in' | 'out'
  at: number
}

/** Latest message per contact for a funnel (a lite shared inbox). */
export async function listConversations(sb: SupabaseClient, funnelId: string, limit = 100): Promise<Conversation[]> {
  const { data, error } = await sb
    .from('whatsapp_messages')
    .select('wa_id,profile_name,body,direction,created_at')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  const seen = new Map<string, Conversation>()
  for (const r of data ?? []) {
    if (seen.has(r.wa_id)) continue
    seen.set(r.wa_id, { waId: r.wa_id, name: r.profile_name ?? undefined, lastBody: r.body ?? '', lastDirection: r.direction, at: Date.parse(r.created_at) || 0 })
  }
  return [...seen.values()]
}
