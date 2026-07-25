/** Gateway ids the product knows about. Only `fake` (test-only, see registry.ts)
 * ever has a real adapter today — the 9 real gateways are Phase 3b. */
export type Gateway =
  | 'tap'
  | 'paytabs'
  | 'telr'
  | 'checkout'
  | 'tabby'
  | 'tamara'
  | 'stripe'
  | 'paypal'
  | 'apple_pay'
  | 'fake'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired'

export interface Money {
  /** Integer minor units (fils/cents) — never a float. */
  amountMinor: number
  /** ISO-4217, uppercase (e.g. "AED"). */
  currency: string
}

/** A gateway webhook event, already verified and parsed. */
export interface WebhookEvent {
  eventId: string
  gatewayRef: string
  status: PaymentStatus
  amountMinor: number
  currency: string
}

export interface GatewayAdapter {
  id: Gateway
  /** Verify a webhook against the RAW body; returns the parsed event, or null
   * if the signature fails. Must never be called with a re-serialized body —
   * see api/payments/webhook/[gateway].ts. */
  verifyWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>, secret: string): WebhookEvent | null
  /** Start a payment with the gateway. Phase 3b implements this per adapter;
   * CORE only needs the shape to exist. */
  createPayment(input: Money & { reference?: string }): Promise<{ gatewayRef: string; redirectUrl?: string }>
}
