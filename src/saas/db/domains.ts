import type { SupabaseClient } from '@supabase/supabase-js'

export interface Domain {
  id: string
  funnelId: string
  hostname: string
  verified: boolean
}

function fromRow(r: any): Domain {
  return { id: r.id, funnelId: r.funnel_id, hostname: r.hostname, verified: r.verified }
}

export async function listDomains(sb: SupabaseClient, funnelId: string): Promise<Domain[]> {
  const { data, error } = await sb.from('domains').select('*').eq('funnel_id', funnelId).order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(fromRow)
}

export async function addDomain(sb: SupabaseClient, funnelId: string, hostname: string): Promise<void> {
  const clean = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const { error } = await sb.from('domains').insert({ funnel_id: funnelId, hostname: clean })
  if (error) throw new Error(error.message)
}

export async function deleteDomain(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from('domains').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
