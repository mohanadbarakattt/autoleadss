import { createHmac, timingSafeEqual } from 'node:crypto'
import type { GatewayAdapter, PaymentStatus, WebhookEvent } from './types'

/**
 * Test-only fake gateway adapter (see registry.ts — registers only when
 * PAYMENTS_FAKE_ADAPTER=1). Its wire format is our own invention, not modeled
 * on any real gateway: HMAC-SHA256 over the raw JSON body, hex-encoded in the
 * `x-fake-signature` header, same construction as WhatsApp's
 * x-hub-signature-256 (api/whatsapp/webhook.ts).
 */

const STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded', 'expired']

function isWebhookEvent(v: unknown): v is WebhookEvent {
  if (typeof v !== 'object' || v === null) return false
  const b = v as Record<string, unknown>
  return (
    typeof b.eventId === 'string' && b.eventId.length > 0 &&
    typeof b.gatewayRef === 'string' && b.gatewayRef.length > 0 &&
    typeof b.status === 'string' && STATUSES.includes(b.status as PaymentStatus) &&
    typeof b.amountMinor === 'number' && Number.isFinite(b.amountMinor) &&
    typeof b.currency === 'string'
  )
}

export const fakeAdapter: GatewayAdapter = {
  id: 'fake',

  verifyWebhook(rawBody, headers, secret) {
    const raw = headers['x-fake-signature']
    const sig = Array.isArray(raw) ? raw[0] : raw
    if (!sig) return null

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    if (sig.length !== expected.length) return null
    try {
      if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null
    } catch {
      return null
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return null
    }
    if (!isWebhookEvent(body)) return null
    return body
  },

  async createPayment() {
    // Webhook-only test double — Phase 3b's real adapters implement this.
    throw new Error('fake adapter does not implement createPayment')
  },
}
