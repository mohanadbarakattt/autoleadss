import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import FunnelRenderer from '../components/FunnelRenderer'
import BrowserFrame from '../components/BrowserFrame'
import { useI18n, toContentLocale } from '../i18n'
import { useSession, useFunnels, createFunnel, seedDemoLeads, uid, slugify } from '../store'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import { INDUSTRIES, industryNamePlaceholder } from '../industries'
import { generateFunnel } from '../ai/generateLive'
import type { Industry, Tone, WizardInput, FunnelSpec, Funnel } from '../types'

const ACCENTS = ['#FF5C2A', '#2563EB', '#7C3AED', '#059669', '#E11D48', '#0A0A0B']
const ease = [0.22, 1, 0.36, 1] as const

const GEN_STEPS = {
  en: ['Analyzing your business…', 'Writing your landing page…', 'Creating ad variants…', 'Building your WhatsApp bot…', 'Generating social posts…', 'Finishing touches…'],
  ar: ['نحلّل نشاطك…', 'نكتب صفحة الهبوط…', 'ننشئ نصوص الإعلانات…', 'نبني بوت واتساب…', 'نولّد منشورات السوشيال…', 'اللمسات الأخيرة…'],
}

export default function Wizard() {
  const { t, locale, isRTL } = useI18n()
  const session = useSession()
  const funnels = useFunnels()
  const ent = useEntitlements()
  const openUpgrade = useUpgrade()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => { if (mounted && !session) navigate('/login', { replace: true }) }, [mounted, session, navigate])

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'form' | 'generating' | 'ready'>('form')
  const [liveSteps, setLiveSteps] = useState<string[]>([])
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [spec, setSpec] = useState<FunnelSpec | null>(null)

  const contentLocale = toContentLocale(locale)
  const [industry, setIndustry] = useState<Industry | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [language, setLanguage] = useState(contentLocale)
  const [goal, setGoal] = useState<string>('leads')
  const [tone, setTone] = useState<Tone>('bold')
  const [accent, setAccent] = useState(ACCENTS[0])

  const Arrow = isRTL ? ArrowLeft : ArrowRight
  const goals = [
    { id: 'leads', label: t.goals.leads },
    { id: 'bookings', label: t.goals.bookings },
    { id: 'sales', label: t.goals.sales },
    { id: 'calls', label: t.goals.calls },
  ]
  const tones: Tone[] = ['bold', 'friendly', 'luxury', 'professional']

  const steps = [
    { valid: !!industry },
    { valid: businessName.trim().length > 1 },
    { valid: !!goal },
    { valid: !!tone && !!accent },
  ]
  const canNext = steps[step]?.valid

  async function generate() {
    if (!session || !industry) return
    if (funnels.length >= ent.maxFunnels) {
      openUpgrade('maxFunnels')
      return
    }
    setPhase('generating')
    setLiveSteps([])
    const input: WizardInput = {
      industry,
      businessName: businessName.trim(),
      language,
      region: session.workspace.region,
      goal,
      tone,
      accent,
    }
    const started = Date.now()
    const { spec: resultSpec } = await generateFunnel(
      input,
      (label) => setLiveSteps((s) => (s.includes(label) ? s : [...s, label])),
      GEN_STEPS[contentLocale],
    )
    const wait = Math.max(0, 2400 - (Date.now() - started))
    await new Promise((r) => setTimeout(r, wait))

    const id = uid('f_')
    const funnel: Funnel = {
      id,
      name: businessName.trim(),
      slug: slugify(businessName.trim()),
      industry,
      language,
      status: 'draft',
      accent,
      spec: resultSpec,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      visits: 0,
      leads: [],
    }
    createFunnel(funnel)
    seedDemoLeads(id, language === 'ar'
      ? [['أحمد المنصوري', '+971 50 123 4567'], ['سارة عبدالله', '+20 100 234 5678'], ['محمد خالد', '+971 55 987 6543']]
      : [['Ahmed Al Mansoori', '+971 50 123 4567'], ['Sara Abdullah', '+20 100 234 5678'], ['Mohamed Khaled', '+971 55 987 6543']])
    setSpec(resultSpec)
    setCreatedId(id)
    setPhase('ready')
  }

  if (!mounted || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-accent" /></div>
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="relative min-h-screen overflow-hidden bg-background">
      <Helmet defer={false}>
        <title>{t.wizard.title} — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div aria-hidden className="absolute inset-0 grid-bg" style={{ maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)' }} />

      <div className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Logo size={28} />
        <Link to="/app" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-fg transition-colors hover:text-foreground">
          <X size={18} />
        </Link>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 pb-20">
        {phase === 'form' && (
          <div>
            <div className="mb-8 mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-fg">
                <span>{t.wizard.step} {step + 1} {t.wizard.of} {steps.length}</span>
                <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} transition={{ duration: 0.4, ease }} />
              </div>
            </div>

            <motion.div key={step} initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease }}>
              {step === 0 && (
                <StepWrap title={t.wizard.industryQ}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {INDUSTRIES.map((ind) => (
                      <button key={ind.id} onClick={() => setIndustry(ind.id)} className={`flex flex-col items-start gap-3 rounded-2xl border p-5 text-start transition-all ${industry === ind.id ? 'border-accent bg-accent/5 shadow-[0_10px_30px_-14px_rgba(255,92,42,0.5)]' : 'border-border bg-card hover:border-accent/40'}`}>
                        <span className="text-2xl">{ind.emoji}</span>
                        <span className="text-sm font-semibold">{ind.label[contentLocale]}</span>
                      </button>
                    ))}
                  </div>
                </StepWrap>
              )}

              {step === 1 && (
                <StepWrap title={t.wizard.nameQ}>
                  <input autoFocus value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={industryNamePlaceholder(industry, contentLocale)} className="w-full rounded-xl border border-border bg-card px-5 py-4 font-display text-xl font-semibold outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-medium text-muted-fg">{t.wizard.langQ}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['en', 'ar'] as const).map((l) => (
                        <button key={l} onClick={() => setLanguage(l)} className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${language === l ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-fg hover:border-accent/40'}`}>
                          {l === 'en' ? 'English' : 'العربية'}
                        </button>
                      ))}
                    </div>
                  </div>
                </StepWrap>
              )}

              {step === 2 && (
                <StepWrap title={t.wizard.goalQ}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {goals.map((g) => (
                      <button key={g.id} onClick={() => setGoal(g.id)} className={`rounded-2xl border p-5 text-start text-sm font-semibold transition-all ${goal === g.id ? 'border-accent bg-accent/5' : 'border-border bg-card hover:border-accent/40'}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </StepWrap>
              )}

              {step === 3 && (
                <StepWrap title={t.wizard.toneQ}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {tones.map((tn) => (
                      <button key={tn} onClick={() => setTone(tn)} className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${tone === tn ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-fg hover:border-accent/40'}`}>
                        {t.tones[tn]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    {ACCENTS.map((a) => (
                      <button key={a} onClick={() => setAccent(a)} aria-label={a} className={`h-9 w-9 rounded-full transition-transform ${accent === a ? 'scale-110' : ''}`} style={{ background: a, boxShadow: accent === a ? `0 0 0 2px #FAFAF7, 0 0 0 4px ${a}` : undefined }} />
                    ))}
                  </div>
                </StepWrap>
              )}
            </motion.div>

            <div className="mt-10 flex items-center justify-between">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:text-foreground disabled:opacity-0">
                {t.common.back}
              </button>
              {step < steps.length - 1 ? (
                <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext} className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0">
                  {t.common.next} <Arrow size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <button onClick={generate} disabled={!canNext} className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)] disabled:opacity-40">
                  <Sparkles size={16} /> {t.common.generate}
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'generating' && (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pt-16 text-center">
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full pulse-ring" style={{ background: `${accent}33` }} />
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl" style={{ background: accent }}>
                <Sparkles size={34} className="animate-pulse text-white" />
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.wizard.generating}</h2>
            <p className="mt-2 text-sm text-muted-fg">{t.wizard.generatingSub}</p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
              {(liveSteps.length ? liveSteps : [GEN_STEPS[contentLocale][0]]).map((label, i, arr) => {
                const active = i === arr.length - 1
                return (
                  <motion.div key={label + i} initial={{ opacity: 0, x: isRTL ? 8 : -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full ${active ? 'bg-accent/20' : 'bg-accent text-white'}`}>
                      {active ? <Loader2 size={12} className="animate-spin text-accent" /> : <Check size={12} />}
                    </span>
                    <span className="font-medium text-foreground">{label}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {phase === 'ready' && spec && createdId && (
          <motion.div key="ready" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${accent}22` }}>
              <Check size={30} style={{ color: accent }} />
            </motion.div>
            <h2 className="font-display text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>{t.wizard.ready}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-fg">{t.wizard.readySub}</p>

            <div className="mx-auto mt-8 max-w-md">
              <BrowserFrame url={`${slugify(businessName)}.autoleadss.site`}>
                <div className="h-[300px] overflow-hidden">
                  <div className="origin-top scale-[0.5]" style={{ width: '200%' }}>
                    <FunnelRenderer spec={spec} accent={accent} scale />
                  </div>
                </div>
              </BrowserFrame>
            </div>

            <Link to={`/app/funnel/${createdId}`} className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgba(255,92,42,0.6)]">
              {t.wizard.openEditor} <Arrow size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StepWrap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
      {children}
    </div>
  )
}
