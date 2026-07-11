import type { PlanId } from './types'

/** 'hard' = blocked once the cap is hit; 'soft' = advisory only, never blocks
 * (Pro's caps are soft per PRICING-SPEC-DRAFT.md §2.2 — "don't throttle the power users"). */
export type CapType = 'hard' | 'soft'

export interface UsageCap {
  limit: number
  type: CapType
}

/** What each plan unlocks. Enforced client-side for UX; the server (RLS + checkout) is the real boundary. */
export interface Entitlement {
  maxFunnels: number
  whatsappBot: boolean
  removeBadge: boolean
  adSocialGen: boolean
  priorityAI: boolean
  whiteLabel: boolean
  teamSeats: number
  /** WhatsApp-AI conversations/mo. `null` where the plan has no WhatsApp bot at all
   * (Starter) or is agency-managed with its own services-cost model, not a per-seat
   * cap (Done-with-you/White-label — see PRICING-SPEC-DRAFT.md §2.3). */
  whatsappCap: UsageCap | null
  /** Ad/social/page-copy AI generations/mo. Same `null` cases as `whatsappCap`. */
  aiActionCap: UsageCap | null
}

export const ENTITLEMENTS: Record<PlanId, Entitlement> = {
  starter: { maxFunnels: 1, whatsappBot: false, removeBadge: false, adSocialGen: false, priorityAI: false, whiteLabel: false, teamSeats: 1, whatsappCap: null, aiActionCap: null },
  growth: { maxFunnels: 5, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: false, whiteLabel: false, teamSeats: 1, whatsappCap: { limit: 300, type: 'hard' }, aiActionCap: { limit: 2000, type: 'hard' } },
  pro: { maxFunnels: Infinity, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: true, whiteLabel: false, teamSeats: 5, whatsappCap: { limit: 800, type: 'soft' }, aiActionCap: { limit: 10000, type: 'soft' } },
  dwy: { maxFunnels: Infinity, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: true, whiteLabel: false, teamSeats: 25, whatsappCap: null, aiActionCap: null },
  whitelabel: { maxFunnels: Infinity, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: true, whiteLabel: true, teamSeats: 999, whatsappCap: null, aiActionCap: null },
}

export type Feature = keyof Omit<Entitlement, 'maxFunnels' | 'teamSeats' | 'whatsappCap' | 'aiActionCap'>
export type CapFeature = 'whatsappCap' | 'aiActionCap'

export function entitlementFor(plan: PlanId): Entitlement {
  return ENTITLEMENTS[plan] ?? ENTITLEMENTS.starter
}

export interface CapStatus {
  used: number
  limit: number
  type: CapType
  hit: boolean
  remaining: number
}

/** Where a plan is uncapped for this metric (`cap` is `null`), there's nothing to
 * report — the caller should simply not gate on it. */
export function capStatus(cap: UsageCap | null, used: number): CapStatus | null {
  if (!cap) return null
  return { used, limit: cap.limit, type: cap.type, hit: used >= cap.limit, remaining: Math.max(0, cap.limit - used) }
}

/** The plan a user should upgrade TO to unlock a given feature/limit/cap (first plan that grants it). */
export function nextPlanFor(feature: Feature | 'maxFunnels' | CapFeature, current: PlanId): PlanId {
  const order: PlanId[] = ['starter', 'growth', 'pro']
  const startIdx = Math.max(0, order.indexOf(current))
  for (let i = startIdx + 1; i < order.length; i++) {
    const e = ENTITLEMENTS[order[i]]
    if (feature === 'maxFunnels') {
      if (e.maxFunnels > ENTITLEMENTS[current].maxFunnels) return order[i]
    } else if (feature === 'whatsappCap' || feature === 'aiActionCap') {
      const curCap = ENTITLEMENTS[current][feature]
      const nextCap = e[feature]
      if (nextCap && (!curCap || nextCap.limit > curCap.limit)) return order[i]
    } else if (e[feature]) {
      return order[i]
    }
  }
  return 'pro'
}
