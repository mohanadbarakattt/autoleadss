import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgencySettings, SubAccount } from '../types'

export async function getAgencySettings(sb: SupabaseClient): Promise<AgencySettings | null> {
  const { data, error } = await sb.from('agency_settings').select('*').limit(1)
  if (error) throw new Error(error.message)
  const r = data?.[0]
  return r ? { brandName: r.brand_name ?? undefined, accent: r.accent ?? undefined, logoUrl: r.logo_url ?? undefined, hideBadge: !!r.hide_badge } : null
}

export async function saveAgencySettingsRemote(sb: SupabaseClient, ownerId: string, s: AgencySettings): Promise<void> {
  const { error } = await sb.from('agency_settings').upsert(
    { owner_id: ownerId, brand_name: s.brandName ?? null, accent: s.accent ?? null, logo_url: s.logoUrl ?? null, hide_badge: s.hideBadge, updated_at: new Date().toISOString() },
    { onConflict: 'owner_id' },
  )
  if (error) throw new Error(error.message)
}

export async function listSubAccounts(sb: SupabaseClient): Promise<SubAccount[]> {
  const { data, error } = await sb.from('sub_accounts').select('*').order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name, contactEmail: r.contact_email ?? undefined, createdAt: Date.parse(r.created_at) || Date.now() }))
}

export async function createSubAccountRemote(sb: SupabaseClient, sa: SubAccount): Promise<void> {
  const { error } = await sb.from('sub_accounts').insert({ id: sa.id, name: sa.name, contact_email: sa.contactEmail ?? null })
  if (error) throw new Error(error.message)
}

export async function deleteSubAccountRemote(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from('sub_accounts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
