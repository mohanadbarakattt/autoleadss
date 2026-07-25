import type { RemoteAuth } from './api'
import { authedRequest } from './api'
import type { Domain } from '../types'

export type { Domain }

/** Real Neon-backed custom domains (Phase 4c) — see api/domains/*. Same
 * throws-on-failure discipline as db/products.ts; the caller decides what to
 * do with a failure (Editor.tsx's DomainPanel surfaces it inline). */

export async function listDomains(auth: RemoteAuth, funnelId: string): Promise<Domain[]> {
  const { domains } = await authedRequest<{ domains: Domain[] }>(auth, '/api/domains')
  return domains.filter((d) => d.funnelId === funnelId)
}

export async function addDomain(auth: RemoteAuth, funnelId: string, hostname: string): Promise<Domain> {
  const { domain } = await authedRequest<{ domain: Domain }>(auth, '/api/domains', {
    method: 'POST',
    body: JSON.stringify({ funnelId, hostname }),
  })
  return domain
}

export async function deleteDomain(auth: RemoteAuth, id: string): Promise<void> {
  await authedRequest(auth, `/api/domains/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export type VerifyReason = 'nxdomain' | 'no_record' | 'mismatch' | 'lookup_failed'

/** Triggers a real DNS TXT lookup server-side (api/domains/verify.ts) —
 * never a local simulation. `reason` is only present when `verified` is
 * false, and distinguishes why (see api/domains/verify.ts's doc comment). */
export async function verifyDomain(auth: RemoteAuth, id: string): Promise<{ verified: boolean; reason?: VerifyReason }> {
  return authedRequest(auth, '/api/domains/verify', { method: 'POST', body: JSON.stringify({ id }) })
}
