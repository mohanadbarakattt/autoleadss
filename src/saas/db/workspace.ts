import type { SupabaseClient } from '@supabase/supabase-js'
import type { Workspace } from '../types'

function fromRow(r: any): Workspace {
  return { id: r.id, name: r.name, region: r.region, plan: r.plan, createdAt: Date.parse(r.created_at) || Date.now() }
}

/** The user's workspace row (RLS-scoped), creating it on first sign-in. Plan lives here so billing can flip it. */
export async function getOrCreateWorkspace(sb: SupabaseClient, defaults: Workspace): Promise<Workspace> {
  const { data } = await sb.from('workspaces').select('*').limit(1)
  if (data?.[0]) return fromRow(data[0])
  await sb.from('workspaces').insert({ name: defaults.name, region: defaults.region, plan: defaults.plan })
  const { data: d2 } = await sb.from('workspaces').select('*').limit(1)
  return d2?.[0] ? fromRow(d2[0]) : defaults
}

export async function updateWorkspaceRemote(sb: SupabaseClient, id: string, patch: Partial<Pick<Workspace, 'plan' | 'region' | 'name'>>): Promise<void> {
  const { error } = await sb.from('workspaces').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}
