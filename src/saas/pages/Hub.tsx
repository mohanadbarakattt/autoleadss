import { Helmet } from 'react-helmet-async'
import { ShoppingBag, Send, MessageCircle, LayoutTemplate, Users, Image, BarChart3, Star, Calendar, type LucideIcon } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { GoldButton, Tag, ToolCard } from '../suite/ui'
import { useI18n } from '../i18n'

type ToolKey = 'storefront' | 'ads' | 'whatsapp' | 'pages' | 'leads' | 'social' | 'insights' | 'reviews' | 'bookings'

/** Honest-status guard (design spec §4): today's truth, not the prototype's
 * everything-is-Live mockup. Frozen by Hub.test.tsx — later phases update this set
 * as tools genuinely go live, never the other way around. */
export const LIVE_TOOL_KEYS: ToolKey[] = ['ads', 'whatsapp', 'pages']

const TOOL_META: { key: ToolKey; icon: LucideIcon; href?: string }[] = [
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

/** The suite home content — the flagship Storefront card + the tool grid. Exported
 * separately from the routed page so tests can render it without an authenticated
 * session (SuiteShell gates on one; this doesn't need it). */
export function HubContent() {
  const { t } = useI18n()
  const h = t.hub

  return (
    <div className="mx-auto max-w-[1120px] px-[30px] pb-[60px] pt-[38px]">
      <div>
        <h1 className="font-luxe text-[40px] font-semibold tracking-wide text-suite-text">{h.head.title}</h1>
        <p className="mt-1.5 text-base text-suite-muted">{h.head.subtitle}</p>
      </div>

      <div className="mt-7 grid grid-cols-1 overflow-hidden rounded-[20px] border border-suite-line bg-gradient-to-br from-[#16171d] to-[#101116] md:grid-cols-[1.2fr_1fr]">
        <div className="p-8">
          <Tag>{h.flagship.tag}</Tag>
          <h2 className="font-luxe mt-3 text-[30px] font-semibold text-suite-text">{h.flagship.title}</h2>
          <p className="mt-2 max-w-[380px] text-[14.5px] text-suite-muted">{h.flagship.body}</p>
          <GoldButton disabled className="mt-5">
            {h.flagship.cta}
          </GoldButton>
        </div>
        <div aria-hidden className="min-h-[150px] bg-gradient-to-br from-[#20222c] to-[#14151b]" />
      </div>

      <p id="tools" className="mb-4 mt-9 text-xs font-semibold uppercase tracking-[0.14em] text-suite-muted">{h.toolsLabel}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_META.map((tool) => {
          const isLive = LIVE_TOOL_KEYS.includes(tool.key)
          return (
            <ToolCard
              key={tool.key}
              testId={`tool-${tool.key}`}
              icon={tool.icon}
              name={h.tools[tool.key].name}
              description={h.tools[tool.key].desc}
              status={isLive ? 'live' : 'soon'}
              statusLabel={isLive ? h.status.live : h.status.soon}
              href={isLive ? tool.href : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function Hub() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>AutoLeadss — growth suite</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <HubContent />
    </SuiteShell>
  )
}
