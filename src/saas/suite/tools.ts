import { ShoppingBag, Send, MessageCircle, LayoutTemplate, Users, Image, BarChart3, Star, Calendar, type LucideIcon } from 'lucide-react'

/** The suite's tool catalogue — shared by the Hub grid (Hub.tsx) and the
 * business-type onboarding toolkit picker (Start.tsx, onboarding.ts). */
export type ToolKey = 'storefront' | 'ads' | 'whatsapp' | 'pages' | 'leads' | 'social' | 'insights' | 'reviews' | 'bookings'

export const TOOLS: { key: ToolKey; icon: LucideIcon; href?: string }[] = [
  { key: 'storefront', icon: ShoppingBag },
  { key: 'ads', icon: Send, href: '/app/ads' },
  { key: 'whatsapp', icon: MessageCircle, href: '/app/connect' },
  { key: 'pages', icon: LayoutTemplate, href: '/app/pages' },
  { key: 'leads', icon: Users },
  { key: 'social', icon: Image },
  { key: 'insights', icon: BarChart3 },
  { key: 'reviews', icon: Star },
  { key: 'bookings', icon: Calendar },
]

/** Honest-status guard (design spec §4): today's truth, not the prototype's
 * everything-is-Live mockup. Hub.test.tsx pins its own hardcoded copy of this set
 * (not imported from here) — later phases update both by hand as tools genuinely
 * go live, never the other way around. */
export const LIVE_TOOL_KEYS: ToolKey[] = ['ads', 'whatsapp', 'pages']
