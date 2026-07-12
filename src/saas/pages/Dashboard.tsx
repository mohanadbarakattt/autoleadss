import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Plus, ExternalLink, Pencil, Users, Eye, TrendingUp, FlaskConical } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useI18n, toContentLocale } from '../i18n'
import { useFunnels, useAgency, hasSampleData, clearSampleData } from '../store'
import { INDUSTRIES, industryLabel } from '../industries'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import { useCapGate, isCapHit } from '../billing/usage'
import type { CapGate } from '../billing/usage'

export default function Dashboard() {
  return (
    <AppShell>
      <Helmet defer={false}>
        <title>Dashboard — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <DashboardInner />
    </AppShell>
  )
}

function DashboardInner() {
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

  const totalLeads = funnels.reduce((a, f) => a + f.leads.length, 0)
  const totalVisits = funnels.reduce((a, f) => a + f.visits, 0)
  const stats = [
    { label: t.dash.totalFunnels, value: funnels.length, icon: TrendingUp },
    { label: t.dash.totalLeads, value: totalLeads, icon: Users },
    { label: t.dash.totalVisits, value: totalVisits, icon: Eye },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.dash.title}</h1>
        <button onClick={handleNew} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
          <Plus size={16} /> {t.common.new}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const I = s.icon
          return (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <I size={16} className="text-accent" />
              </div>
              <p className="font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-fg">{s.label}</p>
            </div>
          )
        })}
      </div>

      {ent.maxFunnels !== Infinity && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{isRTL ? 'استهلاك الأقماع' : 'Funnel usage'}</span>
            <span className="text-muted-fg">{allFunnels.length} / {ent.maxFunnels}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (allFunnels.length / ent.maxFunnels) * 100)}%` }} />
          </div>
          {atCap && (
            <button onClick={() => openUpgrade('maxFunnels')} className="mt-3 text-xs font-medium text-accent hover:underline">
              {isRTL ? 'رقِّ لمزيد من الأقماع ←' : 'Upgrade for more funnels →'}
            </button>
          )}
        </div>
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
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Plus size={24} className="text-accent" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{t.dash.empty}</p>
            <p className="mt-1 text-sm text-muted-fg">{t.dash.emptySub}</p>
          </div>
          <Link to="/app/new" className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">
            {t.common.generate}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {funnels.map((f, i) => {
            const ind = INDUSTRIES.find((x) => x.id === f.industry)
            const conv = f.visits ? Math.round((f.leads.length / f.visits) * 100) : 0
            return (
              <motion.div key={f.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent/40">
                <div className="relative h-28 overflow-hidden px-5 py-4" style={{ background: '#0A0A0B' }}>
                  <div aria-hidden className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(ellipse at 80% 20%, ${f.accent}55, transparent 60%)` }} />
                  <div className="relative flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] text-white/70">
                      <span>{ind?.emoji}</span> {industryLabel(f.industry, toContentLocale(locale))}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${f.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
                      {f.status === 'published' ? t.common.published : t.common.draft}
                    </span>
                  </div>
                  <p className="relative mt-3 truncate font-display text-lg font-bold text-white">{f.name}</p>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Metric value={f.visits} label={t.common.visits} />
                    <Metric value={f.leads.length} label={t.common.leads} />
                    <Metric value={`${conv}%`} label={t.common.convRate} />
                  </div>
                  {hasSampleData(f) && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-amber-800">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium">
                        <FlaskConical size={12} /> {isRTL ? 'بيانات تجريبية' : 'Sample data'}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(isRTL ? 'مسح كل العملاء والزيارات التجريبية وابدأ من صفر؟' : 'Clear all sample leads/visits and start from scratch?')) {
                            clearSampleData(f.id)
                          }
                        }}
                        className="text-[11px] font-semibold underline decoration-dotted hover:text-amber-950"
                      >
                        {isRTL ? 'ابدأ من صفر' : 'Start from scratch'}
                      </button>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link to={`/app/funnel/${f.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90">
                      <Pencil size={13} /> {t.common.edit}
                    </Link>
                    <Link to={`/p/${f.slug}`} target="_blank" className="flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-fg transition-colors hover:text-foreground">
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
    <div className="rounded-lg bg-muted/50 py-2">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-fg">{label}</p>
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
    <div className="mt-4 rounded-2xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-fg">{status.used} / {status.limit}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${isCapHit(status) ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
      </div>
      {isCapHit(status) && (
        <button onClick={onUpgrade} className="mt-3 text-xs font-medium text-accent hover:underline">
          {isRTL ? 'رقِّ لمزيد ←' : 'Upgrade for more →'}
        </button>
      )}
      {status.hit && status.type === 'soft' && (
        <p className="mt-3 text-xs text-muted-fg">
          {isRTL ? 'أنت من المستخدمين الأقوياء — لا تقييد على باقة Pro.' : 'You’re a power user — no throttling on Pro.'}
        </p>
      )}
    </div>
  )
}
