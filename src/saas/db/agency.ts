import type { RemoteAuth } from './api'
import { authedRequest } from './api'
import type { AgencySettings, SubAccount } from '../types'

/** Phase 6 remote data-access — white-label branding + client sub-accounts.
 * Same shape as db/products.ts (throws on any failure; store.ts's
 * `syncRemote` decides what happens next — see its doc comment). */

export async function getAgencySettingsRemote(auth: RemoteAuth): Promise<AgencySettings | null> {
  const { settings } = await authedRequest<{ settings: AgencySettings | null }>(auth, '/api/agency/settings')
  return settings
}

export async function saveAgencySettingsRemote(auth: RemoteAuth, patch: Partial<AgencySettings>): Promise<void> {
  await authedRequest(auth, '/api/agency/settings', { method: 'PUT', body: JSON.stringify(patch) })
}

export async function listSubAccountsRemote(auth: RemoteAuth): Promise<SubAccount[]> {
  const { subAccounts } = await authedRequest<{ subAccounts: SubAccount[] }>(auth, '/api/agency/sub-accounts')
  return subAccounts
}

export async function createSubAccountRemote(auth: RemoteAuth, sa: SubAccount): Promise<void> {
  await authedRequest(auth, '/api/agency/sub-accounts', { method: 'POST', body: JSON.stringify(sa) })
}

export async function deleteSubAccountRemote(auth: RemoteAuth, id: string): Promise<void> {
  await authedRequest(auth, `/api/agency/sub-accounts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}
