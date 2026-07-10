import type { PlanId } from './types'

/** What each plan unlocks. Enforced client-side for UX; the server (RLS + checkout) is the real boundary. */
export interface Entitlement {
  maxFunnels: number
  whatsappBot: boolean
  removeBadge: boolean
  adSocialGen: boolean
  priorityAI: boolean
  teamSeats: number
}

export const ENTITLEMENTS: Record<PlanId, Entitlement> = {
  starter: { maxFunnels: 1, whatsappBot: false, removeBadge: false, adSocialGen: false, priorityAI: false, teamSeats: 1 },
  growth: { maxFunnels: 5, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: false, teamSeats: 1 },
  pro: { maxFunnels: Infinity, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: true, teamSeats: 5 },
  dwy: { maxFunnels: Infinity, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: true, teamSeats: 25 },
  whitelabel: { maxFunnels: Infinity, whatsappBot: true, removeBadge: true, adSocialGen: true, priorityAI: true, teamSeats: 999 },
}

export type Feature = keyof Omit<Entitlement, 'maxFunnels' | 'teamSeats'>

export function entitlementFor(plan: PlanId): Entitlement {
  return ENTITLEMENTS[plan] ?? ENTITLEMENTS.starter
}

/** The plan a user should upgrade TO to unlock a given feature/limit (first plan that grants it). */
export function nextPlanFor(feature: Feature | 'maxFunnels', current: PlanId): PlanId {
  const order: PlanId[] = ['starter', 'growth', 'pro']
  const startIdx = Math.max(0, order.indexOf(current))
  for (let i = startIdx + 1; i < order.length; i++) {
    const e = ENTITLEMENTS[order[i]]
    if (feature === 'maxFunnels' ? e.maxFunnels > ENTITLEMENTS[current].maxFunnels : e[feature]) return order[i]
  }
  return 'pro'
}
