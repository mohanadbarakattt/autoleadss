/**
 * Custom domains were Supabase-backed (`domains` table + RLS) before the Phase 2
 * migration to the shared Neon backend. They were NOT carried over — Phase 2's
 * scope is funnels/leads/publish only (see docs/SETUP.md and
 * ~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md) — so this module is a stub
 * kept only so Editor.tsx's DomainPanel still compiles against the same shape.
 * `remoteEnabled` (src/saas/config.ts) is hardcoded `false` for this feature, so
 * these functions are never actually called; if that ever changes, implement them
 * against a new `autoleadss.domains` table + `api/domains/*` functions first.
 */
import type { RemoteAuth } from './api'

export interface Domain {
  id: string
  funnelId: string
  hostname: string
  verified: boolean
}

function notMigrated(): never {
  throw new Error('Custom domains are not available yet (not migrated to the Neon backend in Phase 2).')
}

export async function listDomains(_auth: RemoteAuth, _funnelId: string): Promise<Domain[]> {
  return []
}

export async function addDomain(_auth: RemoteAuth, _funnelId: string, _hostname: string): Promise<void> {
  notMigrated()
}

export async function deleteDomain(_auth: RemoteAuth, _id: string): Promise<void> {
  notMigrated()
}
