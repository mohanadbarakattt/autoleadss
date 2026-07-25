import { fakeAdapter } from './fake-adapter'
import type { Gateway, GatewayAdapter } from './types'

export interface GatewayInfo {
  id: Gateway
  label: string
  regions: ('gulf' | 'global')[]
  implemented: boolean
}

/**
 * Every gateway the product knows about. All nine real gateways are
 * `implemented: false` — Phase 3b builds each one against its live docs and
 * real credentials; nothing here is guessed at their request/response shapes.
 * `fake` is a test-only double and only appears when PAYMENTS_FAKE_ADAPTER=1
 * — never in production by default.
 */
const REAL_GATEWAYS: GatewayInfo[] = [
  { id: 'tap', label: 'Tap', regions: ['gulf'], implemented: false },
  { id: 'paytabs', label: 'PayTabs', regions: ['gulf'], implemented: false },
  { id: 'telr', label: 'Telr', regions: ['gulf'], implemented: false },
  { id: 'checkout', label: 'Checkout.com', regions: ['gulf', 'global'], implemented: false },
  { id: 'tabby', label: 'Tabby', regions: ['gulf'], implemented: false },
  { id: 'tamara', label: 'Tamara', regions: ['gulf'], implemented: false },
  { id: 'stripe', label: 'Stripe', regions: ['global'], implemented: false },
  { id: 'paypal', label: 'PayPal', regions: ['global'], implemented: false },
  { id: 'apple_pay', label: 'Apple Pay', regions: ['gulf', 'global'], implemented: false },
]

export function listGateways(): GatewayInfo[] {
  const gateways = [...REAL_GATEWAYS]
  if (process.env.PAYMENTS_FAKE_ADAPTER === '1') {
    gateways.push({ id: 'fake', label: 'Fake (test only)', regions: ['gulf', 'global'], implemented: true })
  }
  return gateways
}

export function getGatewayInfo(id: string): GatewayInfo | undefined {
  return listGateways().find((g) => g.id === id)
}

/** The live adapter for an implemented gateway, or null if unknown/unimplemented. */
export function getAdapter(id: string): GatewayAdapter | null {
  const info = getGatewayInfo(id)
  if (!info?.implemented) return null
  if (id === 'fake') return fakeAdapter
  return null
}
