/**
 * WhatsApp connection + shared-inbox persistence were Supabase-backed
 * (`whatsapp_connections` / `whatsapp_messages` tables) before the Phase 2 migration
 * to the shared Neon backend. They were NOT carried over — Phase 2's scope is
 * funnels/leads/publish only (see docs/SETUP.md and
 * ~/projects/mbai-ecosystem/docs/SHARED-DB-DESIGN.md) — so this module is a stub
 * kept only so Connect.tsx still compiles against the same shape. `remoteEnabled`
 * (src/saas/config.ts) is hardcoded `false` for this feature, so these functions are
 * never actually called; if that ever changes, implement them against new
 * `autoleadss.whatsapp_connections` / `autoleadss.whatsapp_messages` tables +
 * `api/whatsapp/*` functions first.
 */
import type { RemoteAuth } from './api'

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

export interface Conversation {
  waId: string
  name?: string
  lastBody: string
  lastDirection: 'in' | 'out'
  at: number
}

function notMigrated(): never {
  throw new Error('WhatsApp remote persistence is not available yet (not migrated to the Neon backend in Phase 2).')
}

export async function getConnectionForFunnel(_auth: RemoteAuth, _funnelId: string): Promise<WhatsAppConnection | null> {
  return null
}

export async function saveConnection(_auth: RemoteAuth, _c: WhatsAppConnection): Promise<void> {
  notMigrated()
}

export async function listConversations(_auth: RemoteAuth, _funnelId: string, _limit = 100): Promise<Conversation[]> {
  return []
}
