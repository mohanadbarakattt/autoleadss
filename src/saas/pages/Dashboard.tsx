import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Plus, ExternalLink, Pencil, Users, Eye, TrendingUp, FlaskConical } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { GoldButton, Panel } from '../suite/ui'
import { useI18n, toContentLocale } from '../i18n'
import { useFunnels, useAgency, hasSampleData, clearSampleData } from '../store'
import { realCountsFor } from '../insights/demo'
import { INDUSTRIES, industryLabel } from '../industries'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import { useCapGate, isCapHit } from '../billing/usage'
import type { CapGate } from '../billing/usage'

export default function Dashboard() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>Dashboard — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <DashboardContent />
    </SuiteShell>
  )
}

/** Exported separately from the routed default (same split as
 * Hub/Leads/Whatsapp) so it can be tested without an authenticated session. */
export function DashboardContent() {
  const { t, locale, isRTL } = useI18n()
  const allFunnels = useFunnels()
  const { activeSubAccountId } = useAgency()
  const funnels = activeSubAccountId ? allFunnels.filter((f) => f.subAccountId === activeSubAccountId) : allFunnels
  const navigate = useNavigate()
  const ent = useEntitlements()
  const openUpgrade = useUpgrade()
  const whatsappGate = useCapGate('whatsapp')
  const aiActionGate = useCapGate('aiAction')

  const atCap = allFunnels.length >= ent.maxFunnels
  function handleNew() {
    if (atCap) openUpgrade('maxFunnels')
    else navigate('/app/new')
  }

  // Same "real activity" rule Insights uses — seeded sample leads and fake
  // visits are excluded. These tiles used to sum raw, so the Dashboard showed
  // inflated numbers while Insights showed true ones for the same workspace.
  const totalLeads = funnels.reduce((a, f) => a + realCountsFor(f).leads.length, 0)
  const totalVisits = funnels.reduce((a, f) => a + realCountsFor(f).visits, 0)
  const stats = [
    { label: t.dash.totalFunnels, value: funnels.length, icon: TrendingUp },
    { label: t.dash.totalLeads, value: totalLeads, icon: Users },
    { label: t.dash.totalVisits, value: totalVisits, icon: Eye },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-luxe text-3xl font-semibold text-suite-text" style={{ letterSpacing: '-0.02em' }}>{t.dash.title}</h1>
        <GoldButton onClick={handleNew}>
          <Plus size={16} /> {t.common.new}
        </GoldButton>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const I = s.icon
          return (
            <Panel key={i} className="p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-suite-gold/10">
                <I size={16} className="text-suite-gold-l" />
              </div>
              <p className="font-luxe text-3xl font-semibold text-suite-text">{s.value}</p>
              <p className="mt-0.5 text-xs text-suite-muted">{s.label}</p>
            </Panel>
          )
        })}
      </div>

      {ent.maxFunnels !== Infinity && (
        <Panel className="mt-4 p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-suite-text">{isRTL ? 'استهلاك الأقماع' : 'Funnel usage'}</span>
            <span className="text-suite-muted">{allFunnels.length} / {ent.maxFunnels}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-suite-panel2">
            <div className="h-full rounded-full bg-suite-gold transition-all" style={{ width: `${Math.min(100, (allFunnels.length / ent.maxFunnels) * 100)}%` }} />
          </div>
          {atCap && (
            <button onClick={() => openUpgrade('maxFunnels')} className="mt-3 text-xs font-medium text-suite-gold-l hover:underline">
              {isRTL ? 'رقِّ لمزيد من الأقماع ←' : 'Upgrade for more funnels →'}
            </button>
          )}
        </Panel>
      )}

      {whatsappGate.status && (
        <CapUsageBar
          label={isRTL ? 'محادثات واتساب الذكي' : 'WhatsApp-AI conversations'}
          gate={whatsappGate}
          isRTL={isRTL}
          onUpgrade={() => openUpgrade('whatsappCap')}
        />
      )}
      {aiActionGate.status && (
        <CapUsageBar
          label={isRTL ? 'توليد الذكاء الاصطناعي' : 'AI generations'}
          gate={aiActionGate}
          isRTL={isRTL}
          onUpgrade={() => openUpgrade('aiActionCap')}
        />
      )}

      {funnels.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-suite-line bg-suite-panel py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-suite-gold/10">
            <Plus size={24} className="text-suite-gold-l" />
          </div>
          <div>
            <p className="font-luxe text-lg font-semibold text-suite-text">{t.dash.empty}</p>
            <p className="mt-1 text-sm text-suite-muted">{t.dash.emptySub}</p>
          </div>
          <Link to="/app/new" className="mt-2 inline-flex items-center gap-2 rounded-full bg-suite-gold px-6 py-3 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90">
            {t.common.generate}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {funnels.map((f, i) => {
            const ind = INDUSTRIES.find((x) => x.id === f.industry)
            // Real activity only, same rule as the tiles above and Insights —
            // otherwise a card would contradict the totals it rolls up into.
            const real = realCountsFor(f)
            const conv = real.visits ? Math.round((real.leads.length / real.visits) * 100) : 0
            return (
              <motion.div key={f.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="group overflow-hidden rounded-2xl border border-suite-line bg-suite-panel transition-colors hover:border-[#3a3d49]">
                <div className="relative h-28 overflow-hidden px-5 py-4" style={{ background: '#0A0A0B' }}>
                  <div aria-hidden className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(ellipse at 80% 20%, ${f.accent}55, transparent 60%)` }} />
                  <div className="relative flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] text-white/70">
                      <span>{ind?.emoji}</span> {industryLabel(f.industry, toContentLocale(locale))}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${f.status === 'published' ? 'bg-suite-ok/20 text-suite-ok' : 'bg-white/10 text-white/60'}`}>
                      {f.status === 'published' ? t.common.published : t.common.draft}
                    </span>
                  </div>
                  <p className="relative mt-3 truncate font-luxe text-lg font-semibold text-white">{f.name}</p>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Metric value={real.visits} label={t.common.visits} />
                    <Metric value={real.leads.length} label={t.common.leads} />
                    <Metric value={`${conv}%`} label={t.common.convRate} />
                  </div>
                  {hasSampleData(f) && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-300">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium">
                        <FlaskConical size={12} /> {isRTL ? 'بيانات تجريبية' : 'Sample data'}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(isRTL ? 'مسح كل العملاء والزيارات التجريبية وابدأ من صفر؟' : 'Clear all sample leads/visits and start from scratch?')) {
                            clearSampleData(f.id)
                          }
                        }}
                        className="text-[11px] font-semibold underline decoration-dotted hover:text-amber-100"
                      >
                        {isRTL ? 'ابدأ من صفر' : 'Start from scratch'}
                      </button>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link to={`/app/funnel/${f.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-suite-text py-2.5 text-xs font-medium text-suite-bg transition-opacity hover:opacity-90">
                      <Pencil size={13} /> {t.common.edit}
                    </Link>
                    <Link to={`/p/${f.slug}`} target="_blank" className="flex items-center justify-center gap-1.5 rounded-full border border-suite-line px-4 py-2.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text">
                      <ExternalLink size={13} /> {t.common.open}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg bg-suite-panel2 py-2">
      <p className="font-luxe text-lg font-semibold text-suite-text">{value}</p>
      <p className="text-[10px] text-suite-muted">{label}</p>
    </div>
  )
}

/**
 * Friendly usage bar for a WhatsApp-AI/AI-action cap. Hard caps (Growth) get an
 * "upgrade for more" CTA once hit, matching the funnel-usage bar above. Soft caps
 * (Pro) never block — past 100% they just switch to an advisory note, per
 * PRICING-SPEC-DRAFT.md §2.2 ("don't throttle the power users").
 */
function CapUsageBar({ label, gate, isRTL, onUpgrade }: { label: string; gate: CapGate; isRTL: boolean; onUpgrade: () => void }) {
  const status = gate.status
  if (!status) return null
  const pct = Math.min(100, (status.used / status.limit) * 100)
  return (
    <Panel className="mt-4 p-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-suite-text">{label}</span>
        <span className="text-suite-muted">{status.used} / {status.limit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-suite-panel2">
        <div className={`h-full rounded-full transition-all ${isCapHit(status) ? 'bg-red-400' : 'bg-suite-gold'}`} style={{ width: `${pct}%` }} />
      </div>
      {isCapHit(status) && (
        <button onClick={onUpgrade} className="mt-3 text-xs font-medium text-suite-gold-l hover:underline">
          {isRTL ? 'رقِّ لمزيد ←' : 'Upgrade for more →'}
        </button>
      )}
      {status.hit && status.type === 'soft' && (
        <p className="mt-3 text-xs text-suite-muted">
          {isRTL ? 'أنت من المستخدمين الأقوياء — لا تقييد على باقة Pro.' : 'You’re a power user — no throttling on Pro.'}
        </p>
      )}
    </Panel>
  )
}
