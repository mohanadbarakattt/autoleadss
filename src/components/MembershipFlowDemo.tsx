import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Check,
  Coffee,
  Dog,
  Pause,
  Play,
  RefreshCw,
  ScanLine,
  Scissors,
  Shirt,
  Sparkles,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type CategoryKey = 'barber' | 'car' | 'laundry' | 'pets' | 'cafe'
type DemoMode = 'compact' | 'full'

type Category = {
  key: CategoryKey
  label: [string, string]
  unit: [string, string]
  icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { key: 'barber', label: ['Barber', 'حلاقة'], unit: ['visits', 'زيارات'], icon: Scissors },
  { key: 'car', label: ['Car wash', 'غسيل سيارات'], unit: ['washes', 'غسلات'], icon: Waves },
  { key: 'laundry', label: ['Laundry', 'مغسلة'], unit: ['pickups', 'استلامات'], icon: Shirt },
  { key: 'pets', label: ['Pet care', 'رعاية حيوانات'], unit: ['services', 'خدمات'], icon: Dog },
  { key: 'cafe', label: ['Café', 'كافيه'], unit: ['drinks', 'مشروبات'], icon: Coffee },
]

const STEP_LENGTHS = [1800, 1500, 900, 1700, 1900, 1350, 2400]

const qrCells = new Set([
  0, 1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24,
  28, 29, 30, 31, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 51, 52,
  53, 54, 58, 60, 62, 64, 66, 68, 70, 72, 74, 75, 76, 78, 80, 82,
  84, 85, 86, 87, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108,
  110, 112, 114, 116, 118, 120,
])

function MiniQr({ scanning = false }: { scanning?: boolean }) {
  return (
    <div className="relative grid aspect-square w-full grid-cols-11 gap-[2px] overflow-hidden rounded-xl bg-white p-3 shadow-xl">
      {Array.from({ length: 121 }, (_, index) => (
        <i key={index} className={qrCells.has(index) ? 'rounded-[1px] bg-[#0A0A0B]' : 'bg-transparent'} />
      ))}
      {scanning ? (
        <motion.span
          aria-hidden
          className="absolute inset-x-2 h-[2px] bg-[#ff5c2a] shadow-[0_0_14px_4px_rgba(255,92,42,.65)]"
          animate={{ top: ['12%', '86%', '12%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
    </div>
  )
}

function Metric({ value, label, changed }: { value: string; label: string; changed?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 transition-colors ${changed ? 'border-[#ff5c2a]/50 bg-[#ff5c2a]/10' : 'border-white/10 bg-white/[0.04]'}`}>
      <p className="font-display text-xl font-bold text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] leading-tight text-white/45">{label}</p>
    </div>
  )
}

export default function MembershipFlowDemo({ mode = 'compact' }: { mode?: DemoMode }) {
  const { isRTL } = useLocale()
  const reducedMotion = usePrefersReducedMotion()
  const [categoryKey, setCategoryKey] = useState<CategoryKey>('barber')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(!reducedMotion)
  const ar = isRTL
  const category = CATEGORIES.find(item => item.key === categoryKey) ?? CATEGORIES[0]
  const Icon = category.icon

  const copy = useMemo(() => ({
    steps: ar
      ? ['اختيار الباقة', 'الدفع', 'تم التحصيل', 'بطاقة العميل', 'مسح QR', 'تم الخصم', 'لوحة المالك']
      : ['Choose plan', 'Checkout', 'Payment received', 'Customer pass', 'Scan QR', 'Redeemed', 'Owner dashboard'],
    business: ar ? 'نشاط خدمي' : 'Service Business',
    plan: ar ? 'الباقة العادية' : 'Regular plan',
    term: ar ? '٣ شهور' : '3 months',
    pay: ar ? 'ادفع ٢٬٤٠٠ ج.م' : 'Pay EGP 2,400',
  }), [ar])

  useEffect(() => {
    if (!playing || reducedMotion) return
    const timer = window.setTimeout(() => setStep(current => (current + 1) % 7), STEP_LENGTHS[step])
    return () => window.clearTimeout(timer)
  }, [playing, reducedMotion, step])

  const restart = () => {
    setStep(0)
    setPlaying(!reducedMotion)
  }

  const progress = ((step + 1) / 7) * 100
  const hasPaid = step >= 2
  const hasPass = step >= 3
  const scanning = step === 4
  const redeemed = step >= 5
  const dashboard = step === 6

  return (
    <div className={`overflow-hidden border border-white/12 bg-[#111113] text-white shadow-2xl ${mode === 'full' ? 'rounded-[30px]' : 'rounded-[26px]'}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff5c2a] text-white"><Icon size={15} /></span>
          <div>
            <p className="text-xs font-semibold">{copy.business}</p>
            <p className="text-[10px] text-white/40">{copy.steps[step]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setPlaying(value => !value)} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white" aria-label={playing ? 'Pause demo' : 'Play demo'}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button type="button" onClick={restart} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white" aria-label="Replay demo"><RefreshCw size={13} /></button>
        </div>
      </div>

      {mode === 'full' ? (
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-5">
          {CATEGORIES.map(item => {
            const CategoryIcon = item.icon
            const active = item.key === categoryKey
            return (
              <button key={item.key} type="button" onClick={() => { setCategoryKey(item.key); restart() }} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-white text-black' : 'bg-white/[0.05] text-white/52 hover:text-white'}`}>
                <CategoryIcon size={13} /> {item.label[ar ? 1 : 0]}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className={`grid ${mode === 'full' ? 'min-h-[450px] gap-5 p-4 md:grid-cols-[0.93fr_1.07fr] md:p-6' : 'min-h-[380px] p-4 sm:p-5'}`}>
        <div className={`relative overflow-hidden rounded-2xl bg-[#F2EEE7] text-[#111113] ${mode === 'full' ? 'min-h-[390px] sm:min-h-[420px]' : ''} ${mode === 'compact' && dashboard ? 'hidden' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div key={step < 3 ? `shop-${step}` : step < 6 ? `pass-${step}` : 'done'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: reducedMotion ? 0 : 0.28 }} className="absolute inset-0 p-5 sm:p-6">
              {step < 3 ? (
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between"><span className="font-display text-lg font-bold">{copy.business}</span><Sparkles size={16} className="text-[#ff5c2a]" /></div>
                  <div className="my-auto rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-black/42">{ar ? 'عضوية' : 'Membership'}</p>
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div><h3 className="font-display text-2xl font-bold">{copy.plan}</h3><p className="mt-1 text-xs text-black/50">4 {category.unit[ar ? 1 : 0]} / {ar ? 'شهر' : 'month'}</p></div>
                      <span className="text-sm font-bold">2,400 <small className="font-normal text-black/45">EGP</small></span>
                    </div>
                    <div className="mt-5 grid grid-cols-4 gap-1.5">{[1, 3, 6, 12].map(term => <span key={term} className={`rounded-lg border py-2 text-center text-[10px] ${term === 3 ? 'border-[#ff5c2a] bg-[#ff5c2a]/10 font-bold text-[#df4517]' : 'border-black/10 text-black/40'}`}>{term}M</span>)}</div>
                    <button type="button" className={`mt-5 w-full rounded-xl py-3 text-xs font-bold transition ${step === 1 ? 'bg-[#ff5c2a] text-white shadow-lg shadow-[#ff5c2a]/25' : hasPaid ? 'bg-emerald-600 text-white' : 'bg-[#111113] text-white'}`}>
                      {hasPaid ? <span className="inline-flex items-center gap-2"><Check size={14} /> {ar ? 'تم الدفع' : 'Payment received'}</span> : copy.pay}
                    </button>
                  </div>
                  <p className="text-center text-[9px] text-black/35">{ar ? 'دفع آمن من خلال حساب التاجر' : 'Secure payment through the merchant account'}</p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">{hasPass ? copy.plan : copy.steps[step]}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{ar ? 'بطاقة عضويتك' : 'Your membership pass'}</h3>
                  <div className="mt-4 w-36"><MiniQr scanning={scanning} /></div>
                  <div className="mt-4 flex items-end gap-2"><strong className="font-display text-4xl">{redeemed ? 3 : 4}</strong><span className="pb-1 text-xs text-black/45">/ 4 {category.unit[ar ? 1 : 0]}</span></div>
                  {redeemed ? <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"><Check size={14} /> {ar ? 'تم الخصم بنجاح' : 'Redemption approved'}</p> : <p className="mt-3 text-[10px] text-black/38">MEMBER 0085 · {copy.term}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {(mode === 'full' || dashboard) ? (
          <motion.div initial={false} animate={{ opacity: dashboard ? 1 : mode === 'full' ? 0.5 : 0, scale: dashboard ? 1 : 0.985 }} className={`rounded-2xl border border-white/10 bg-[#09090a] p-5 ${mode === 'compact' ? '' : 'flex flex-col'}`}>
            <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.16em] text-white/35">{ar ? 'لوحة المالك' : 'Owner dashboard'}</p><h3 className="mt-1 font-display text-lg font-bold">{ar ? 'نظرة اليوم' : "Today's snapshot"}</h3></div><BarChart3 size={18} className="text-[#ff5c2a]" /></div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Metric value={dashboard ? '85' : '84'} label={ar ? 'عضو نشط' : 'Active members'} changed={dashboard} />
              <Metric value={dashboard ? '73.8K' : '71.4K'} label={ar ? 'إيراد مقدم' : 'Prepaid EGP'} changed={dashboard} />
              <Metric value={dashboard ? '19' : '18'} label={ar ? 'استخدام اليوم' : 'Uses today'} changed={dashboard} />
            </div>
            <div className="mt-5 flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between"><p className="text-xs font-semibold">{ar ? 'آخر العمليات' : 'Recent activity'}</p><ScanLine size={14} className="text-white/35" /></div>
              <div className={`mt-4 flex items-center justify-between rounded-lg px-3 py-3 transition ${dashboard ? 'bg-emerald-500/10' : 'bg-white/[0.03]'}`}>
                <div><p className="text-xs font-semibold">Member 0085</p><p className="mt-1 text-[9px] text-white/38">{copy.plan}</p></div>
                <span className={`text-[10px] font-bold ${dashboard ? 'text-emerald-400' : 'text-white/28'}`}>{dashboard ? (ar ? 'تم الخصم الآن' : 'Redeemed now') : '—'}</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      <div className="border-t border-white/10 px-4 py-3 sm:px-5">
        <div className="h-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-[#ff5c2a]" animate={{ width: `${progress}%` }} transition={{ duration: reducedMotion ? 0 : 0.3 }} /></div>
        <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.13em] text-white/32"><span>{step + 1} / 7</span><span>{playing && !reducedMotion ? (ar ? 'عرض تلقائي' : 'Playing automatically') : (ar ? 'متوقف' : 'Paused')}</span></div>
      </div>
    </div>
  )
}
