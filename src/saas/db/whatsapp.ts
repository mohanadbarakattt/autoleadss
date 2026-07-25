/**
 * WhatsApp connection + shared-inbox client.
 *
 * Backed by `api/whatsapp/*` against the Neon tables
 * (`autoleadss.whatsapp_connections` / `whatsapp_messages`) — the Supabase
 * implementation dropped in the Phase 2 migration, now rebuilt.
 *
 * The access token never comes back from the server: `GET /api/whatsapp/connection`
 * selects only non-secret columns, so nothing here can leak it to the browser.
 */
import { authedRequest, type RemoteAuth } from './api'

export interface WhatsAppConnection {
  id?: string
  funnelId: string
  phoneNumberId: string
  wabaId?: string
  /** Write-only. Never returned by the API — expect '' on read. */
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

export interface Message {
  id: string
  waFrom: string
  body: string
  direction: 'in' | 'out'
  at: number
}

interface ConnectionRow {
  id: string
  funnel_id: string
  phone_number_id: string
  waba_id: string | null
  display_phone: string | null
  status: string
}

export async function getConnectionForFunnel(auth: RemoteAuth, funnelId: string): Promise<WhatsAppConnection | null> {
  const { connection } = await authedRequest<{ connection: ConnectionRow | null }>(
    auth,
    `/api/whatsapp/connection?funnelId=${encodeURIComponent(funnelId)}`,
  )
  if (!connection) return null
  return {
    id: connection.id,
    funnelId: connection.funnel_id,
    phoneNumberId: connection.phone_number_id,
    wabaId: connection.waba_id ?? undefined,
    displayPhone: connection.display_phone ?? undefined,
    status: connection.status,
    accessToken: '', // never sent to the browser
    verifyToken: '',
  }
}

export async function saveConnection(auth: RemoteAuth, c: WhatsAppConnection): Promise<void> {
  await authedRequest(auth, '/api/whatsapp/connection', {
    method: 'POST',
    body: JSON.stringify({
      funnelId: c.funnelId,
      phoneNumberId: c.phoneNumberId,
      wabaId: c.wabaId,
      displayPhone: c.displayPhone,
      accessToken: c.accessToken,
      verifyToken: c.verifyToken,
    }),
  })
}

interface ConversationRow {
  wa_from: string
  body: string
  direction: 'in' | 'out'
  created_at: string
}

export async function listConversations(auth: RemoteAuth, connectionId: string, limit = 100): Promise<Conversation[]> {
  const { conversations } = await authedRequest<{ conversations: ConversationRow[] }>(
    auth,
    `/api/whatsapp/connection?conversations=${encodeURIComponent(connectionId)}`,
  )
  return conversations.slice(0, limit).map((r) => ({
    waId: r.wa_from,
    lastBody: r.body,
    lastDirection: r.direction,
    at: new Date(r.created_at).getTime(),
  }))
}

/** Sends a reply from the shared inbox. Operator-driven by default — see
 * api/whatsapp/send.ts for why automatic sending is gated. */
export async function sendReply(auth: RemoteAuth, connectionId: string, to: string, text: string): Promise<void> {
  await authedRequest(auth, '/api/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ connectionId, to, text }),
  })
}

interface MessageRow {
  id: string
  wa_from: string
  body: string
  direction: 'in' | 'out'
  created_at: string
}

/** The full thread with one contact — the inbox's thread view, oldest first.
 * Powers /app/whatsapp (Phase 5c); `listConversations` above stays the list
 * view (latest message per contact only). */
export async function listMessages(auth: RemoteAuth, connectionId: string, contact: string): Promise<Message[]> {
  const { messages } = await authedRequest<{ messages: MessageRow[] }>(
    auth,
    `/api/whatsapp/connection?messages=${encodeURIComponent(connectionId)}&contact=${encodeURIComponent(contact)}`,
  )
  return messages.map((r) => ({ id: r.id, waFrom: r.wa_from, body: r.body, direction: r.direction, at: new Date(r.created_at).getTime() }))
}
