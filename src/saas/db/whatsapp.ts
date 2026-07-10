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
