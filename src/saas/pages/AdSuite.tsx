import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Loader2,
  Search,
  Megaphone,
  Briefcase,
  Music2,
  Copy,
  RefreshCw,
  FileDown,
  ClipboardList,
  Users,
} from 'lucide-react'
import Logo from '../../components/Logo'
import AuthGate from '../auth/authReady'
import { useI18n, toContentLocale } from '../i18n'
import { useSession, useFunnels, slugify } from '../store'
import { useUpgrade } from '../billing/UpgradeContext'
import { useCapGate, isCapHit } from '../billing/usage'
import { INDUSTRIES, industryLabel, industryNamePlaceholder } from '../industries'
import { AD_PLATFORMS, GOOGLE_RSA, META_LIMITS, LINKEDIN_LIMITS, TIKTOK_LIMITS, PLATFORM_INFO, type AdPlatform, type PlatformInfo } from '../ads/specs'
import { generateAdsForPlatform } from '../ads/generateLive'
import type { AdSuiteInput, GoogleRsaCopy, LinkedInCopy, PlatformAdResult, SocialVideoCopy } from '../ads/types'
import type { Industry, Locale, Tone } from '../types'

const ease = [0.22, 1, 0.36, 1] as const
const ACCENT = '#FF5C2A'

const PLATFORM_ICONS: Record<PlatformInfo['icon'], typeof Search> = { Search, Megaphone, Briefcase, Music2 }

function AdSuiteInner() {
  const { t, locale, isRTL } = useI18n()
  const session = useSession()
  const funnels = useFunnels()
  const openUpgrade = useUpgrade()
  const aiActionGate = useCapGate('aiAction')
  const contentLocale = toContentLocale(locale)
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const [step, setStep] = useState(0) // 0=platforms, 1=details — 'generating'/'ready' are tracked via `phase` below
  const [phase, setPhase] = useState<'form' | 'generating' | 'ready'>('form')

  const [selected, setSelected] = useState<AdPlatform[]>([])
  const [funnelId, setFunnelId] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState<Industry | null>(null)
  const [language, setLanguage] = useState<Locale>(contentLocale)
  const [tone, setTone] = useState<Tone>('bold')
  const [accent, setAccent] = useState(ACCENT)
  const [description, setDescription] = useState('')

  const [genInput, setGenInput] = useState<AdSuiteInput | null>(null)
  const [results, setResults] = useState<Partial<Record<AdPlatform, PlatformAdResult>>>({})
  const [regenerating, setRegenerating] = useState<Partial<Record<AdPlatform, boolean>>>({})
  const [capNote, setCapNote] = useState(false)

  const tones: Tone[] = ['bold', 'friendly', 'luxury', 'professional']
  const railItems = [t.adSuite.rail.platforms, t.adSuite.rail.details, t.adSuite.rail.generate, t.adSuite.rail.review]
  const railIndex = phase === 'form' ? step : phase === 'generating' ? 2 : 3

  function togglePlatform(id: AdPlatform) {
    setSelected((s) => (s.includes(id) ? s.filter((p) => p !== id) : [...s, id]))
  }

  function applyFunnel(id: string) {
    setFunnelId(id)
    const f = funnels.find((x) => x.id === id)
    if (!f) return
    setBusinessName(f.name)
    setIndustry(f.industry)
    setLanguage(f.language)
    setAccent(f.accent)
  }

  const detailsValid = !!industry && businessName.trim().length > 1

  async function startGeneration() {
    if (!industry) return
    if (isCapHit(aiActionGate.status)) {
      openUpgrade('aiActionCap')
      return
    }
    setPhase('generating')
    const input: AdSuiteInput = {
      businessName: businessName.trim(),
      industry,
      language,
      tone,
      accent,
      description: description.trim() || undefined,
      plan: session?.workspace.plan,
    }
    setGenInput(input)

    let capExceededMidBatch = false
    for (const platform of selected) {
      const r = await generateAdsForPlatform(input, platform)
      setResults((prev) => ({ ...prev, [platform]: r.result }))
      if (r.engine === 'ai') aiActionGate.record({ skipRemote: r.usageRecorded })
      if (r.capExceeded) capExceededMidBatch = true
    }
    if (capExceededMidBatch) openUpgrade('aiActionCap')
    setCapNote(capExceededMidBatch)
    setPhase('ready')
  }

  async function regenerateOne(platform: AdPlatform) {
    if (!genInput) return
    if (isCapHit(aiActionGate.status)) {
      openUpgrade('aiActionCap')
      return
    }
    setRegenerating((r) => ({ ...r, [platform]: true }))
    const r = await generateAdsForPlatform(genInput, platform)
    setResults((prev) => ({ ...prev, [platform]: r.result }))
    if (r.engine === 'ai') aiActionGate.record({ skipRemote: r.usageRecorded })
    if (r.capExceeded) openUpgrade('aiActionCap')
    setRegenerating((r) => ({ ...r, [platform]: false }))
  }

  function exportAll() {
    if (!genInput) return
    const lines: string[] = [`# ${genInput.businessName} — Ad Suite`, '']
    for (const platform of selected) {
      const r = results[platform]
      if (!r) continue
      lines.push(`## ${PLATFORM_INFO[platform].name}${r.isDemoContent ? ` (${t.adSuite.sample})` : ''}`, '')
      if (platform === 'google') {
        const c = r.copy as GoogleRsaCopy
        lines.push(`### ${t.adSuite.headlines}`, ...c.headlines.map((h) => `- ${h}`), '', `### ${t.adSuite.descriptions}`, ...c.descriptions.map((d) => `- ${d}`), '')
      } else if (platform === 'linkedin') {
        const c = r.copy as LinkedInCopy
        lines.push(`### ${t.adSuite.intro}`, c.intro, '', `### ${t.adSuite.headline}`, c.headline, '')
      } else {
        const c = r.copy as SocialVideoCopy
        lines.push(
          `### ${t.adSuite.variants}`,
          ...c.variants.map((v, i) => `${i + 1}. **${v.headline}** — ${v.primaryText}`),
          '',
          `### ${t.adSuite.videoScript}`,
          ...c.videoScript.map((b) => `- **${b.time}** — ${b.beat}`),
          '',
        )
      }
      lines.push(
        `### ${t.adSuite.audienceLabel}`,
        `- ${t.adSuite.interests}: ${r.audience.interests.join(', ')}`,
        `- ${t.adSuite.jobTitles}: ${r.audience.jobTitles.join(', ')}`,
        `- ${t.adSuite.ageBands}: ${r.audience.ageBands.join(', ')}`,
        '',
        `### ${t.adSuite.budgetLabel}`,
        `- ${r.budget.dailyBudgetEgp} ${t.adSuite.perDay} — ${r.budget.strategy}`,
        '',
        `### ${t.adSuite.checklistLabel}`,
        ...PLATFORM_INFO[platform].checklist[contentLocale].map((s, i) => `${i + 1}. ${s}`),
        '',
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(genInput.businessName) || 'ad-suite'}-ads.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function startOver() {
    setStep(0)
    setPhase('form')
    setSelected([])
    setFunnelId('')
    setBusinessName('')
    setIndustry(null)
    setDescription('')
    setGenInput(null)
    setResults({})
    setCapNote(false)
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="relative min-h-screen overflow-hidden bg-background">
      <Helmet defer={false}>
        <title>{t.adSuite.navLabel} — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div aria-hidden className="absolute inset-0 grid-bg" style={{ maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)' }} />

      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Logo size={28} />
        <Link to="/app" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-fg transition-colors hover:text-foreground">
          <X size={18} />
        </Link>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
        <aside className="mb-8 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <Rail items={railItems} current={railIndex} />
        </aside>

        <div className="min-w-0">
          {phase === 'form' && step === 0 && (
            <motion.div key="platforms" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease }}>
              <h2 className="mb-2 font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.adSuite.platformsTitle}</h2>
              <p className="mb-6 text-sm text-muted-fg">{t.adSuite.platformsSub}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {AD_PLATFORMS.map((id) => {
                  const info = PLATFORM_INFO[id]
                  const Icon = PLATFORM_ICONS[info.icon]
                  const active = selected.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => togglePlatform(id)}
                      className={`flex flex-col items-start gap-3 rounded-2xl border p-5 text-start transition-all ${active ? 'border-accent bg-accent/5 shadow-[0_10px_30px_-14px_rgba(255,92,42,0.5)]' : 'border-border bg-card hover:border-accent/40'}`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-accent text-white' : 'bg-muted text-muted-fg'}`}>
                          <Icon size={18} />
                        </span>
                        {active && <Check size={16} className="text-accent" />}
                      </div>
                      <span className="text-sm font-semibold">{info.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {info.chips.map((c) => (
                          <span key={c.en} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-fg">
                            {contentLocale === 'ar' ? c.ar : c.en}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="mt-10 flex justify-end">
                <button
                  onClick={() => selected.length > 0 && setStep(1)}
                  disabled={selected.length === 0}
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {t.common.next} <Arrow size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'form' && step === 1 && (
            <motion.div key="details" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease }}>
              {funnels.length > 0 && (
                <div className="mb-6">
                  <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.adSuite.useFunnel}</label>
                  <select value={funnelId} onChange={(e) => applyFunnel(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
                    <option value="">{t.adSuite.useFunnelNone}</option>
                    {funnels.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <h2 className="mb-4 text-center font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.adSuite.detailsTitle}</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.adSuite.detailsPlaceholder}
                rows={4}
                className="w-full resize-none rounded-2xl border border-border bg-card px-5 py-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.adSuite.businessName}</label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={industryNamePlaceholder(industry, contentLocale)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.adSuite.industryLabel}</label>
                  <select value={industry ?? ''} onChange={(e) => setIndustry(e.target.value as Industry)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
                    <option value="" disabled>{t.adSuite.industryLabel}</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.id} value={ind.id}>{industryLabel(ind.id, contentLocale)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted-fg">{t.adSuite.toneLabel}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tones.map((tn) => (
                    <button key={tn} onClick={() => setTone(tn)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${tone === tn ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-fg hover:border-accent/40'}`}>
                      {t.tones[tn]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted-fg">{t.adSuite.adLanguage}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['en', 'ar'] as const).map((l) => (
                    <button key={l} onClick={() => setLanguage(l)} className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${language === l ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-fg hover:border-accent/40'}`}>
                      {l === 'en' ? 'English' : 'العربية'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between">
                <button onClick={() => setStep(0)} className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:text-foreground">
                  {t.common.back}
                </button>
                <button
                  onClick={startGeneration}
                  disabled={!detailsValid}
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)] disabled:opacity-40"
                >
                  <Sparkles size={16} /> {t.adSuite.generateCta}
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'generating' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pt-16 text-center">
              <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full pulse-ring" style={{ background: `${accent}33` }} />
                <span className="flex h-24 w-24 items-center justify-center rounded-3xl" style={{ background: accent }}>
                  <Sparkles size={34} className="animate-pulse text-white" />
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.adSuite.generatingTitle}</h2>
              <p className="mt-2 text-sm text-muted-fg">{t.adSuite.generatingSub}</p>
              <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
                {selected.map((p) => {
                  const done = !!results[p]
                  return (
                    <div key={p} className="flex items-center gap-3 text-sm">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? 'bg-accent text-white' : 'bg-accent/20'}`}>
                        {done ? <Check size={12} /> : <Loader2 size={12} className="animate-spin text-accent" />}
                      </span>
                      <span className="font-medium text-foreground">{PLATFORM_INFO[p].name}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {phase === 'ready' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.adSuite.readyTitle}</h2>
                  <p className="mt-1 text-sm text-muted-fg">{t.adSuite.readySub}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={exportAll} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent/40">
                    <FileDown size={15} /> {t.adSuite.exportAll}
                  </button>
                  <button onClick={startOver} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent/40">
                    {t.adSuite.startOver}
                  </button>
                </div>
              </div>

              {capNote && (
                <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  {t.adSuite.capNote}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {selected.map((p) => {
                  const r = results[p]
                  if (!r) return null
                  return (
                    <PlatformCard
                      key={p}
                      result={r}
                      accent={accent}
                      locale={contentLocale}
                      t={t}
                      regenerating={!!regenerating[p]}
                      onRegenerate={() => regenerateOne(p)}
                    />
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function Rail({ items, current }: { items: string[]; current: number }) {
  return (
    <>
      <div className="hidden flex-col gap-1 lg:flex">
        {items.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo'
          return (
            <div key={label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${state === 'active' ? 'bg-accent/10 text-accent' : state === 'done' ? 'text-foreground' : 'text-muted-fg'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${state === 'active' ? 'bg-accent text-white' : state === 'done' ? 'bg-accent/20 text-accent' : 'border border-border text-muted-fg'}`}>
                {state === 'done' ? <Check size={12} /> : i + 1}
              </span>
              {label}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        {items.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo'
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${state === 'active' ? 'bg-accent text-white' : state === 'done' ? 'bg-accent/20 text-accent' : 'border border-border text-muted-fg'}`}>
                {state === 'done' ? <Check size={12} /> : i + 1}
              </span>
              {i < items.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${state === 'done' ? 'bg-accent/40' : 'bg-border'}`} />}
            </div>
          )
        })}
      </div>
    </>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setC(true)
        setTimeout(() => setC(false), 1400)
      }}
      className="shrink-0 text-muted-fg transition-colors hover:text-foreground"
    >
      {c ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  )
}

function CharCount({ len, max }: { len: number; max: number }) {
  return <span className={`shrink-0 text-[10px] tabular-nums ${len > max ? 'text-red-500' : 'text-muted-fg'}`}>{len}/{max}</span>
}

function PlatformCard({
  result,
  accent,
  locale,
  t,
  regenerating,
  onRegenerate,
}: {
  result: PlatformAdResult
  accent: string
  locale: Locale
  t: ReturnType<typeof useI18n>['t']
  regenerating: boolean
  onRegenerate: () => void
}) {
  const info = PLATFORM_INFO[result.platform]
  const Icon = PLATFORM_ICONS[info.icon]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: accent }}>
            <Icon size={16} />
          </span>
          <span className="text-sm font-semibold">{info.name}</span>
          {result.isDemoContent && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-fg">{t.adSuite.sample}</span>}
        </div>
        <button onClick={onRegenerate} disabled={regenerating} className="flex items-center gap-1.5 text-xs font-medium text-muted-fg transition-colors hover:text-foreground disabled:opacity-50">
          {regenerating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} {t.adSuite.regenerate}
        </button>
      </div>

      {result.platform === 'google' && <GoogleCopy copy={result.copy as GoogleRsaCopy} t={t} />}
      {result.platform === 'linkedin' && <LinkedInCopyBlock copy={result.copy as LinkedInCopy} t={t} />}
      {(result.platform === 'meta' || result.platform === 'tiktok') && <SocialCopy copy={result.copy as SocialVideoCopy} t={t} platform={result.platform} />}

      <div className="rounded-xl bg-muted/50 p-3 text-xs">
        <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-muted-fg"><Users size={12} /> {t.adSuite.audienceLabel}</p>
        <p><span className="text-muted-fg">{t.adSuite.interests}:</span> {result.audience.interests.join(', ')}</p>
        <p><span className="text-muted-fg">{t.adSuite.jobTitles}:</span> {result.audience.jobTitles.join(', ')}</p>
        <p><span className="text-muted-fg">{t.adSuite.ageBands}:</span> {result.audience.ageBands.join(', ')}</p>
      </div>

      <div className="rounded-xl bg-muted/50 p-3 text-xs">
        <p className="mb-1 font-semibold text-muted-fg">{t.adSuite.budgetLabel}</p>
        <p>{result.budget.dailyBudgetEgp} {t.adSuite.perDay} — {result.budget.strategy}</p>
      </div>

      <details className="rounded-xl bg-muted/50 p-3 text-xs">
        <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-muted-fg"><ClipboardList size={12} /> {t.adSuite.checklistLabel}</summary>
        <ol className="mt-2 list-decimal space-y-1.5 ps-4">
          {info.checklist[locale].map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>
    </div>
  )
}

function GoogleCopy({ copy, t }: { copy: GoogleRsaCopy; t: ReturnType<typeof useI18n>['t'] }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-fg">{t.adSuite.headlines}</p>
        <ul className="flex flex-col gap-1">
          {copy.headlines.map((h, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5">
              <span className="min-w-0 truncate">{h}</span>
              <span className="flex shrink-0 items-center gap-2"><CharCount len={h.length} max={GOOGLE_RSA.headlineMax} /><CopyBtn text={h} /></span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-fg">{t.adSuite.descriptions}</p>
        <ul className="flex flex-col gap-1">
          {copy.descriptions.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5">
              <span className="min-w-0 truncate">{d}</span>
              <span className="flex shrink-0 items-center gap-2"><CharCount len={d.length} max={GOOGLE_RSA.descriptionMax} /><CopyBtn text={d} /></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function LinkedInCopyBlock({ copy, t }: { copy: LinkedInCopy; t: ReturnType<typeof useI18n>['t'] }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-fg">{t.adSuite.intro}</p>
          <span className="flex items-center gap-2"><CharCount len={copy.intro.length} max={LINKEDIN_LIMITS.introMax} /><CopyBtn text={copy.intro} /></span>
        </div>
        <p className="rounded-lg bg-muted/60 px-2.5 py-1.5">{copy.intro}</p>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-fg">{t.adSuite.headline}</p>
          <CopyBtn text={copy.headline} />
        </div>
        <p className="rounded-lg bg-muted/60 px-2.5 py-1.5">{copy.headline}</p>
      </div>
    </div>
  )
}

function SocialCopy({ copy, t, platform }: { copy: SocialVideoCopy; t: ReturnType<typeof useI18n>['t']; platform: 'meta' | 'tiktok' }) {
  const max = platform === 'meta' ? META_LIMITS.primaryTextMax : TIKTOK_LIMITS.primaryTextMax
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-fg">{t.adSuite.variants}</p>
        <ul className="flex flex-col gap-2">
          {copy.variants.map((v, i) => (
            <li key={i} className="rounded-lg bg-muted/60 px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{v.headline}</span>
                <span className="flex shrink-0 items-center gap-2"><CharCount len={v.primaryText.length} max={max} /><CopyBtn text={`${v.headline}\n${v.primaryText}`} /></span>
              </div>
              <p className="mt-0.5 text-muted-fg">{v.primaryText}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-muted-fg">{t.adSuite.videoScript}</p>
        <ul className="flex flex-col gap-1">
          {copy.videoScript.map((b, i) => (
            <li key={i} className="rounded-lg bg-muted/60 px-2.5 py-1.5">
              <span className="font-semibold text-accent">{b.time}</span> — {b.beat}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Route entry: same Clerk-aware gate as Wizard.tsx, full-screen wizard experience
 * (not nested in AppShell — matches the existing /app/new pattern). */
export default function AdSuite() {
  return (
    <AuthGate>
      <AdSuiteInner />
    </AuthGate>
  )
}
