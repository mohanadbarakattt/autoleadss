import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, ScanLine, Smartphone } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import { pilotBySlug, type PilotSlug } from '../pilots/data'
import { SITE } from '../site'

type Term = 1 | 3 | 6 | 12
type Payment = 'card' | 'instapay' | 'cash'
type ScanStatus = 'idle' | 'scanning' | 'found' | 'redeemed' | 'empty' | 'expired'
type DemoState = { step: number; plan: number; term: Term; customerName: string; passId: string; balance: number; expiry: string; payment: Payment; paid: boolean; scanStatus: ScanStatus; redemptionLog: { id: string; label: string }[]; dashboard: { members: number; revenue: number; redemptions: number; renewals: number } }
type Action =
  | { type: 'STEP'; step: number } | { type: 'PLAN'; plan: number; allowance: number } | { type: 'TERM'; term: Term }
  | { type: 'CUSTOMER'; name: string } | { type: 'PAYMENT'; payment: Payment } | { type: 'COMPLETE_PAYMENT'; total: number }
  | { type: 'SCAN'; status: ScanStatus } | { type: 'REDEEM'; label: string } | { type: 'RESET'; state: DemoState }

const allowanceMap: Record<PilotSlug | 'generic', number[]> = {
  generic: [2, 4, 8], 'jo-x': [2, 2, 3], '212-car-wash': [2, 4, 6], 'wash-and-wash': [10, 20, 30], petsika: [1, 1, 1], '741-cafe': [10, 20, 20],
}

const reducer = (state: DemoState, action: Action): DemoState => {
  switch (action.type) {
    case 'STEP': return { ...state, step: Math.max(0, Math.min(6, action.step)) }
    case 'PLAN': return { ...state, plan: action.plan, balance: action.allowance, scanStatus: 'idle' }
    case 'TERM': return { ...state, term: action.term }
    case 'CUSTOMER': return { ...state, customerName: action.name }
    case 'PAYMENT': return { ...state, payment: action.payment }
    case 'COMPLETE_PAYMENT': return state.paid ? { ...state, step: 2 } : { ...state, paid: true, step: 2, dashboard: { ...state.dashboard, members: state.dashboard.members + 1, revenue: state.dashboard.revenue + action.total, renewals: state.dashboard.renewals + 1 } }
    case 'SCAN': return { ...state, scanStatus: action.status }
    case 'REDEEM': {
      if (state.balance <= 0) return { ...state, scanStatus: 'empty' }
      if (new Date(state.expiry).getTime() < Date.now()) return { ...state, scanStatus: 'expired' }
      return { ...state, balance: state.balance - 1, scanStatus: 'redeemed', redemptionLog: [{ id: `${Date.now()}`, label: action.label }, ...state.redemptionLog], dashboard: { ...state.dashboard, redemptions: state.dashboard.redemptions + 1 } }
    }
    case 'RESET': return action.state
  }
}

const genericPlans = [
  { name: { en: 'Essential', ar: 'الأساسية' }, price: 650, summary: { en: 'A simple repeat-service plan.', ar: 'باقة بسيطة للخدمة المتكررة.' }, benefits: [{ en: '2 monthly visits', ar: 'زيارتان شهرياً' }, { en: 'Digital member pass', ar: 'بطاقة عضوية رقمية' }, { en: 'Clear usage balance', ar: 'رصيد استخدام واضح' }] },
  { name: { en: 'Regular', ar: 'المنتظمة' }, price: 1100, summary: { en: 'The best rhythm for regulars.', ar: 'النظام الأنسب للعملاء المنتظمين.' }, benefits: [{ en: '4 monthly visits', ar: '٤ زيارات شهرياً' }, { en: 'Priority service', ar: 'أولوية في الخدمة' }, { en: 'Digital member pass', ar: 'بطاقة عضوية رقمية' }], featured: true },
  { name: { en: 'Signature', ar: 'المميزة' }, price: 1850, summary: { en: 'More value for your best customers.', ar: 'قيمة أكبر لأفضل عملائك.' }, benefits: [{ en: '8 monthly visits', ar: '٨ زيارات شهرياً' }, { en: 'Guest credit', ar: 'رصيد لضيف' }, { en: 'Priority service', ar: 'أولوية في الخدمة' }] },
]

function initialState(name: string, allowance: number): DemoState {
  const expiry = new Date(); expiry.setMonth(expiry.getMonth() + 1)
  return { step: 0, plan: 1, term: 3, customerName: name, passId: `MBR-${Math.floor(1000 + Math.random() * 8999)}`, balance: allowance, expiry: expiry.toISOString().slice(0, 10), payment: 'card', paid: false, scanStatus: 'idle', redemptionLog: [], dashboard: { members: 47, revenue: 68400, redemptions: 12, renewals: 9 } }
}
const money = (value: number, ar: boolean) => `${value.toLocaleString(ar ? 'ar-EG' : 'en-EG')} ${ar ? 'ج.م' : 'EGP'}`

export default function GuidedShowcasePage() {
  const { locale, isRTL } = useLocale()
  const slug = new URLSearchParams(window.location.search).get('shop') || ''
  const pilot = pilotBySlug(slug)
  const skinKey = (pilot?.slug || 'generic') as PilotSlug | 'generic'
  const plans = pilot?.plans || genericPlans
  const brand = pilot?.name || (isRTL ? 'استوديو الخدمة' : 'Service Studio')
  const accent = pilot?.accent || '#FE6B35'; const accentSoft = pilot?.accentSoft || '#251712'; const surface = pilot?.surface || '#0B0B0D'; const ink = pilot?.ink || '#FFF9F5'; const initials = pilot?.monogram || 'SS'
  const unit = pilot?.redemptionUnit[locale] || (isRTL ? 'زيارات متبقية' : 'visits remaining')
  const sampleName = pilot?.sampleMember || (isRTL ? 'مريم حسن' : 'Mariam Hassan')
  const allowances = allowanceMap[skinKey]
  const fresh = useMemo(() => initialState(sampleName, allowances[1]), [sampleName, skinKey])
  const storageKey = `autoleadss-showroom:${locale}:${skinKey}`
  const [state, dispatch] = useReducer(reducer, fresh, fallback => { try { const stored = sessionStorage.getItem(storageKey); return stored ? { ...fallback, ...JSON.parse(stored) } : fallback } catch { return fallback } })
  const [autoplay, setAutoplay] = useState(false); const [showCue, setShowCue] = useState(false); const timer = useRef<number | undefined>(undefined)
  const selected = plans[state.plan]; const total = selected.price * state.term; const t = (en: string, ar: string) => isRTL ? ar : en

  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(state)) }, [state, storageKey])
  useEffect(() => {
    window.clearTimeout(timer.current); if (!autoplay) return
    timer.current = window.setTimeout(() => {
      if (state.step === 1) dispatch({ type: 'COMPLETE_PAYMENT', total })
      else if (state.step === 4) {
        if (state.scanStatus === 'idle') dispatch({ type: 'SCAN', status: 'scanning' })
        else if (state.scanStatus === 'scanning') dispatch({ type: 'SCAN', status: 'found' })
        else if (state.scanStatus === 'found') dispatch({ type: 'REDEEM', label: t('1 visit redeemed', 'تم خصم زيارة واحدة') })
        else dispatch({ type: 'STEP', step: 5 })
      } else dispatch({ type: 'STEP', step: state.step === 6 ? 0 : state.step + 1 })
    }, state.step === 4 ? 3200 : 10000)
    return () => window.clearTimeout(timer.current)
  }, [autoplay, state.step, state.scanStatus, total])

  const reset = () => { sessionStorage.removeItem(storageKey); dispatch({ type: 'RESET', state: initialState(sampleName, allowances[1]) }); setAutoplay(false) }
  const next = () => {
    if (state.step === 1) return dispatch({ type: 'COMPLETE_PAYMENT', total })
    if (state.step === 4) {
      if (state.scanStatus === 'idle') { dispatch({ type: 'SCAN', status: 'scanning' }); window.setTimeout(() => dispatch({ type: 'SCAN', status: 'found' }), 850); return }
      if (state.scanStatus === 'scanning') return
      if (state.scanStatus === 'found') return dispatch({ type: 'REDEEM', label: t('1 visit redeemed', 'تم خصم زيارة واحدة') })
    }
    dispatch({ type: 'STEP', step: state.step === 6 ? 0 : state.step + 1 })
  }
  const cues = [t('The customer picks a clear package and commitment term.', 'العميل يختار باقة واضحة ومدة الاشتراك.'), t('Checkout uses the shop’s approved payment setup.', 'الدفع يتم من خلال وسيلة الدفع المعتمدة عند المحل.'), t('Payment activates the membership immediately.', 'الدفع يفعّل العضوية فوراً.'), t('The customer keeps this pass on their phone.', 'العميل يحتفظ ببطاقة العضوية على موبايله.'), t('Staff scan and deduct one use in seconds.', 'الموظف يمسح الكود ويخصم استخداماً في ثوانٍ.'), t('The owner sees the numbers that matter.', 'صاحب النشاط يشوف الأرقام المهمة فقط.'), t('We deliver the complete owned system in two weeks.', 'نسلّم النظام كاملاً ومملوكاً لك خلال أسبوعين.')]
  const steps = [t('Packages', 'الباقات'), t('Checkout', 'الدفع'), t('Activated', 'تم التفعيل'), t('Member pass', 'بطاقة العضوية'), t('Redeem', 'الاستخدام'), t('Dashboard', 'لوحة التحكم'), t('Your offer', 'عرضك')]

  return <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen overflow-x-hidden pb-28 text-white" style={{ background: surface, color: ink }}>
    <Helmet><title>{t('Membership showroom', 'عرض نظام العضويات')} · AutoLeadss</title>{pilot && <meta name="robots" content="noindex,nofollow" />}</Helmet>
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 font-black" style={{ background: accentSoft, color: accent }}>{initials}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{brand}</p><p className="text-[10px] uppercase tracking-[.17em] text-white/45">{t('Membership showroom', 'عرض نظام العضويات')}</p></div></div><div className="flex items-center gap-2"><a href={`/${isRTL ? 'en' : 'ar'}/showroom${pilot ? `?shop=${pilot.slug}` : ''}`} className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold">{isRTL ? 'EN' : 'عربي'}</a><button onClick={reset} className="grid size-9 place-items-center rounded-full border border-white/15" aria-label={t('Reset demo', 'إعادة العرض')}><RotateCcw size={15} /></button></div></header>
    <div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="mb-4 flex items-center gap-1.5 overflow-hidden">{steps.map((label, index) => <button key={label} onClick={() => dispatch({ type: 'STEP', step: index })} className={`h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-200 ${index <= state.step ? '' : 'bg-white/10'}`} style={index <= state.step ? { background: accent } : undefined} aria-label={label} />)}</div>
      <div key={state.step} className="animate-[fadeIn_.22s_ease-out] overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.035] shadow-2xl shadow-black/25 motion-reduce:animate-none">
        {state.step === 0 && <Storefront {...{ pilot, brand, plans, state, dispatch, allowances, accent, accentSoft, isRTL }} />}
        {state.step === 1 && <Checkout {...{ brand, selected, state, dispatch, total, accent, isRTL }} />}
        {state.step === 2 && <Success {...{ brand, selected, state, total, accent, isRTL }} />}
        {state.step === 3 && <Pass {...{ brand, selected, state, unit, accent, accentSoft, initials, isRTL }} />}
        {state.step === 4 && <Scanner {...{ brand, selected, state, unit, accent, isRTL }} />}
        {state.step === 5 && <Dashboard {...{ brand, state, accent, isRTL }} />}
        {state.step === 6 && <Offer brand={brand} accent={accent} isRTL={isRTL} />}
      </div>
      {showCue && <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center text-sm text-white/70">{cues[state.step]}</div>}
      <div className="mt-4 flex items-center justify-between text-[11px] text-white/38"><span>{pilot ? t(`Private concept for ${brand} — sample data`, `تصور خاص لـ ${brand} — بيانات تجريبية`) : t('Fictional business — sample data', 'نشاط تجريبي — بيانات توضيحية')}</span><span>AutoLeadss.</span></div>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090b]/95 px-3 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-3xl items-center gap-2"><button onClick={() => dispatch({ type: 'STEP', step: state.step - 1 })} disabled={state.step === 0} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/12 disabled:opacity-25"><ChevronLeft className={isRTL ? 'rotate-180' : ''} size={18} /></button><button onClick={() => setAutoplay(!autoplay)} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/12">{autoplay ? <Pause size={16} /> : <Play size={16} />}</button><div className="min-w-0 flex-1 text-center"><p className="truncate text-xs font-bold">{state.step + 1}/7 · {steps[state.step]}</p><button onClick={() => setShowCue(!showCue)} className="mt-0.5 text-[10px] text-white/42">{showCue ? t('Hide presenter cue', 'إخفاء ملاحظة العرض') : t('Show presenter cue', 'إظهار ملاحظة العرض')}</button></div><button onClick={next} disabled={state.step === 4 && state.scanStatus === 'scanning'} className="flex min-h-11 shrink-0 items-center gap-1 rounded-full px-4 text-xs font-black text-black disabled:opacity-50" style={{ background: accent }}>{state.step === 4 ? (state.scanStatus === 'idle' ? t('Scan', 'امسح') : state.scanStatus === 'found' ? t('Redeem 1', 'اخصم ١') : state.scanStatus === 'redeemed' ? t('Dashboard', 'اللوحة') : t('Scanning', 'جاري المسح')) : state.step === 6 ? t('Replay', 'إعادة') : t('Next', 'التالي')}<ChevronRight className={isRTL ? 'rotate-180' : ''} size={15} /></button></div></nav>
  </main>
}

function Storefront({ pilot, brand, plans, state, dispatch, allowances, accent, accentSoft, isRTL }: any) {
  const terms: Term[] = [1, 3, 6, 12]
  return <section className="grid min-h-[630px] lg:grid-cols-[.8fr_1.2fr]"><div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden p-6 sm:p-9">{pilot?.heroImage && <img src={pilot.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.18em]" style={{ color: accent }}>{isRTL ? 'عضوية شهرية' : 'Monthly membership'}</p><h1 className="mt-3 max-w-lg text-4xl font-black leading-[.94] tracking-[-.045em] sm:text-6xl">{pilot?.headline?.[isRTL ? 'ar' : 'en'] || (isRTL ? 'خدمتك المعتادة، محسوبة وجاهزة.' : 'Your regular service, already handled.')}</h1><p className="mt-4 max-w-md text-sm leading-6 text-white/62">{brand} · {isRTL ? 'اختر باقتك واحتفظ برصيدك على موبايلك.' : 'Choose a plan and keep the balance on your phone.'}</p></div></div><div className="p-5 sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-xs text-white/45">{isRTL ? 'الخطوة ١' : 'STEP 01'}</p><h2 className="mt-1 text-2xl font-black">{isRTL ? 'اختر الباقة' : 'Choose a package'}</h2></div><span className="rounded-full border border-white/12 px-3 py-1 text-[10px] text-white/48">{isRTL ? 'أسعار تجريبية' : 'Example pricing'}</span></div><div className="mt-5 grid grid-cols-4 gap-1 rounded-xl bg-black/25 p-1">{terms.map(term => <button key={term} onClick={() => dispatch({ type: 'TERM', term })} className="rounded-lg px-2 py-2 text-xs font-bold transition-colors" style={state.term === term ? { background: accent, color: '#09090b' } : undefined}>{term} {isRTL ? (term === 1 ? 'شهر' : 'شهور') : term === 1 ? 'mo' : 'mos'}</button>)}</div><div className="mt-5 grid gap-3">{plans.map((plan: any, index: number) => <button key={plan.name.en} onClick={() => dispatch({ type: 'PLAN', plan: index, allowance: allowances[index] })} className="rounded-2xl border p-4 text-start transition-all duration-200" style={state.plan === index ? { borderColor: accent, background: accentSoft } : { borderColor: 'rgba(255,255,255,.1)' }}><div className="flex items-center justify-between gap-3"><div><h3 className="font-black">{plan.name[isRTL ? 'ar' : 'en']}</h3><p className="mt-1 line-clamp-1 text-xs text-white/48">{plan.summary[isRTL ? 'ar' : 'en']}</p></div><p className="shrink-0 text-lg font-black" style={{ color: accent }}>{money(plan.price * state.term, isRTL)}</p></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{plan.benefits.slice(0, 3).map((benefit: any) => <span key={benefit.en} className="text-[11px] text-white/66">✓ {benefit[isRTL ? 'ar' : 'en']}</span>)}</div></button>)}</div></div></section>
}

function Checkout({ brand, selected, state, dispatch, total, accent, isRTL }: any) {
  const methods = [{ id: 'card', en: 'Card · merchant gateway', ar: 'بطاقة · بوابة المحل' }, { id: 'instapay', en: 'InstaPay transfer', ar: 'تحويل إنستاباي' }, { id: 'cash', en: 'Cash · manual activation', ar: 'كاش · تفعيل يدوي' }]
  return <Centered title={isRTL ? 'الدفع' : 'Checkout'} eyebrow={isRTL ? 'الخطوة ٢' : 'STEP 02'}><div className="grid gap-5 sm:grid-cols-2"><div><label className="text-xs text-white/48">{isRTL ? 'اسم العميل' : 'Customer name'}</label><input value={state.customerName} onChange={e => dispatch({ type: 'CUSTOMER', name: e.target.value })} className="mt-2 w-full rounded-xl border border-white/12 bg-black/25 px-4 py-3 outline-none" /><p className="mt-5 text-xs text-white/48">{isRTL ? 'وسيلة الدفع' : 'Payment method'}</p><div className="mt-2 grid gap-2">{methods.map(method => <button key={method.id} onClick={() => dispatch({ type: 'PAYMENT', payment: method.id })} className="flex items-center justify-between rounded-xl border px-4 py-3 text-start text-sm" style={state.payment === method.id ? { borderColor: accent, background: `${accent}16` } : { borderColor: 'rgba(255,255,255,.1)' }}><span>{method[isRTL ? 'ar' : 'en']}</span>{state.payment === method.id && <Check size={16} style={{ color: accent }} />}</button>)}</div></div><div className="rounded-2xl bg-white/[.055] p-5"><p className="text-xs uppercase tracking-[.15em] text-white/42">{brand}</p><h3 className="mt-3 text-xl font-black">{selected.name[isRTL ? 'ar' : 'en']}</h3><div className="my-5 h-px bg-white/10" /><div className="flex justify-between text-sm"><span className="text-white/50">{isRTL ? 'المدة' : 'Term'}</span><b>{state.term} {isRTL ? 'شهر' : state.term === 1 ? 'month' : 'months'}</b></div><div className="mt-3 flex justify-between"><span className="text-white/50">{isRTL ? 'الإجمالي' : 'Total'}</span><b className="text-xl" style={{ color: accent }}>{money(total, isRTL)}</b></div><p className="mt-6 text-[11px] leading-5 text-white/38">{isRTL ? 'عرض تجريبي فقط. لا يتم تحصيل أي مدفوعات.' : 'Simulation only. No real payment is collected.'}</p></div></div></Centered>
}

function Success({ brand, selected, state, total, accent, isRTL }: any) { return <Centered title={isRTL ? 'تم تفعيل العضوية' : 'Membership activated'} eyebrow={isRTL ? 'الخطوة ٣' : 'STEP 03'}><div className="mx-auto max-w-md text-center"><div className="mx-auto grid size-16 place-items-center rounded-full" style={{ background: `${accent}20`, color: accent }}><Check size={30} /></div><p className="mt-5 text-white/55">{isRTL ? `أهلاً ${state.customerName}` : `Welcome, ${state.customerName}`}</p><div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-start"><Row a={isRTL ? 'النشاط' : 'Business'} b={brand} /><Row a={isRTL ? 'الباقة' : 'Package'} b={selected.name[isRTL ? 'ar' : 'en']} /><Row a={isRTL ? 'الإيصال' : 'Receipt'} b={money(total, isRTL)} /><Row a="ID" b={state.passId} /></div><p className="mt-5 text-sm" style={{ color: accent }}>{isRTL ? 'تم إرسال التأكيد وبطاقة العضوية.' : 'Confirmation and member pass are ready.'}</p></div></Centered> }

function Pass({ brand, selected, state, unit, accent, accentSoft, initials, isRTL }: any) { return <Centered title={isRTL ? 'بطاقة العضوية' : 'Your member pass'} eyebrow={isRTL ? 'الخطوة ٤' : 'STEP 04'}><div className="mx-auto max-w-sm"><div className="overflow-hidden rounded-[26px] border border-white/15 shadow-2xl" style={{ background: `linear-gradient(145deg, ${accentSoft}, #09090b)` }}><div className="flex items-start justify-between p-5"><div><p className="text-xs text-white/45">{brand}</p><h3 className="mt-1 text-xl font-black">{state.customerName}</h3></div><div className="grid size-10 place-items-center rounded-xl font-black text-black" style={{ background: accent }}>{initials}</div></div><div className="grid grid-cols-[1fr_auto] items-end gap-5 px-5 pb-5"><div><p className="text-sm font-bold">{selected.name[isRTL ? 'ar' : 'en']}</p><p className="mt-5 text-5xl font-black" style={{ color: accent }}>{state.balance}</p><p className="mt-1 text-xs text-white/48">{unit}</p><p className="mt-5 font-mono text-[10px] text-white/36">{state.passId} · {state.expiry}</p></div><Qr /></div></div><div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[.05] p-4"><Smartphone size={20} style={{ color: accent }} /><div><p className="text-sm font-bold">{isRTL ? 'أضفها للشاشة الرئيسية' : 'Add to home screen'}</p><p className="text-xs text-white/42">{isRTL ? 'تفتح مثل التطبيق حتى بدون إنترنت.' : 'Opens like an app, even offline.'}</p></div></div></div></Centered> }

function Scanner({ brand, selected, state, unit, accent, isRTL }: any) { const found = ['found', 'redeemed', 'empty', 'expired'].includes(state.scanStatus); return <Centered title={isRTL ? 'المسح والاستخدام' : 'Scan and redeem'} eyebrow={isRTL ? 'الخطوة ٥' : 'STEP 05'}><div className="grid gap-5 sm:grid-cols-[.9fr_1.1fr]"><div className="relative grid min-h-64 place-items-center overflow-hidden rounded-2xl bg-black/35"><div className={`absolute inset-8 rounded-2xl border-2 ${state.scanStatus === 'scanning' ? 'animate-pulse' : ''}`} style={{ borderColor: accent }} /><div className="text-center"><ScanLine className="mx-auto" size={48} style={{ color: accent }} /><p className="mt-3 text-sm font-bold">{state.scanStatus === 'scanning' ? (isRTL ? 'جاري قراءة البطاقة…' : 'Reading member pass…') : found ? (isRTL ? 'تم العثور على العضو' : 'Member found') : (isRTL ? 'وجّه الكاميرا نحو QR' : 'Point scanner at the QR')}</p></div></div><div className="rounded-2xl border border-white/10 p-5"><p className="text-xs text-white/42">{brand}</p><h3 className="mt-2 text-2xl font-black">{found ? state.customerName : '—'}</h3>{found && <><p className="mt-1 text-sm text-white/52">{selected.name[isRTL ? 'ar' : 'en']}</p><div className="mt-6 flex items-end justify-between"><div><p className="text-4xl font-black" style={{ color: accent }}>{state.balance}</p><p className="text-xs text-white/42">{unit}</p></div><span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${accent}20`, color: accent }}>{state.scanStatus === 'redeemed' ? (isRTL ? 'تم الخصم' : 'Redeemed') : (isRTL ? 'عضوية فعالة' : 'Active')}</span></div></>}<p className="mt-7 text-xs leading-5 text-white/38">{isRTL ? 'لا يتم استخدام الكاميرا في هذا العرض. المسح والخصم محاكاة آمنة.' : 'No camera is used in this demo. Scan and redemption are safely simulated.'}</p></div></div></Centered> }

function Dashboard({ brand, state, accent, isRTL }: any) { const cards = [{ en: 'Active members', ar: 'الأعضاء النشطون', value: state.dashboard.members }, { en: 'Prepaid revenue', ar: 'إيراد مدفوع مقدماً', value: money(state.dashboard.revenue, isRTL) }, { en: 'Redemptions today', ar: 'استخدامات اليوم', value: state.dashboard.redemptions }, { en: 'Upcoming renewals', ar: 'تجديدات قادمة', value: state.dashboard.renewals }]; return <Centered title={isRTL ? 'لوحة صاحب النشاط' : 'Owner dashboard'} eyebrow={isRTL ? 'الخطوة ٦ · بيانات تجريبية' : 'STEP 06 · SEEDED SAMPLE DATA'}><div className="flex items-center justify-between"><div><p className="text-white/45">{brand}</p><p className="mt-1 text-sm font-bold" style={{ color: accent }}>{isRTL ? 'كل شيء مهم، في شاشة واحدة.' : 'What matters, on one screen.'}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/45">{isRTL ? 'بيانات تجريبية' : 'Sample data'}</span></div><div className="mt-6 grid grid-cols-2 gap-3">{cards.map(card => <div key={card.en} className="rounded-2xl border border-white/10 bg-white/[.04] p-4 sm:p-5"><p className="text-[11px] text-white/45">{card[isRTL ? 'ar' : 'en']}</p><p className="mt-3 text-2xl font-black sm:text-3xl">{card.value}</p></div>)}</div><div className="mt-4 rounded-2xl border border-white/10 p-4"><div className="flex justify-between text-sm"><b>{isRTL ? 'آخر استخدام' : 'Latest activity'}</b><span style={{ color: accent }}>Live</span></div><p className="mt-3 text-sm text-white/55">{state.redemptionLog[0]?.label || (isRTL ? 'لا توجد استخدامات جديدة بعد' : 'No new redemption yet')}</p></div></Centered> }

function Offer({ brand, accent, isRTL }: { brand: string; accent: string; isRTL: boolean }) { const items = isRTL ? ['موقع بيع ثنائي اللغة', 'باقات ومدد وأسعار واضحة', 'دفع أونلاين أو تفعيل يدوي', 'بطاقة QR ومسح للموظفين', 'لوحة تحكم بسيطة وتدريب الفريق', 'الكود والنظام ملكك بالكامل'] : ['Bilingual sales website', 'Clear packages, terms and pricing', 'Online payment or manual activation', 'Customer QR pass and staff scanner', 'Simple owner dashboard and staff training', 'You own the system and source code']; const message = encodeURIComponent(isRTL ? `مرحباً، أريد ورشة باقات لـ ${brand} وعرض أول ٥ عملاء.` : `Hi, I want the package workshop for ${brand} and the first-five offer.`); return <Centered title={isRTL ? 'نحوّلها لنظامك خلال أسبوعين.' : 'Make it yours in two weeks.'} eyebrow={isRTL ? 'الخطوة ٧ · عرض أول ٥ عملاء' : 'STEP 07 · FIRST FIVE CLIENTS'}><div className="grid gap-6 sm:grid-cols-[1.15fr_.85fr]"><div className="grid gap-2">{items.map(item => <p key={item} className="flex items-start gap-3 rounded-xl bg-white/[.045] px-4 py-3 text-sm"><Check className="mt-0.5 shrink-0" size={16} style={{ color: accent }} />{item}</p>)}</div><div className="rounded-2xl border border-white/12 bg-black/20 p-5"><p className="text-xs text-white/42">{isRTL ? 'السعر لأول ٥ عملاء' : 'First-five price'}</p><p className="mt-2 text-4xl font-black" style={{ color: accent }}>20,000 <span className="text-sm">EGP</span></p><p className="mt-3 text-sm text-white/55">{isRTL ? '١٠,٠٠٠ مقدماً · ١٠,٠٠٠ عند التسليم' : '10,000 upfront · 10,000 at handoff'}</p><div className="my-5 h-px bg-white/10" /><p className="text-sm font-bold">{isRTL ? 'مدة التنفيذ: أسبوعان' : 'Delivery: two weeks'}</p><p className="mt-2 text-xs leading-5 text-white/42">{isRTL ? 'دفعة واحدة. النظام مملوك لك. بدون اشتراك شهري لـ AutoLeadss.' : 'One project fee. You own it. No monthly AutoLeadss subscription.'}</p><a href={`${SITE.waBase}?text=${message}`} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-12 items-center justify-center rounded-full px-4 text-center text-sm font-black text-black" style={{ background: accent }}>{isRTL ? `ابدأ ورشة باقات ${brand}` : `Start ${brand}'s package workshop`}</a></div></div></Centered> }

function Centered({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="min-h-[630px] p-5 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/42">{eyebrow}</p><h1 className="mt-2 mb-7 max-w-2xl text-3xl font-black tracking-[-.035em] sm:text-5xl">{title}</h1>{children}</section> }
function Row({ a, b }: { a: string; b: string }) { return <div className="mt-3 flex justify-between gap-4 first:mt-0"><span className="text-white/45">{a}</span><b>{b}</b></div> }
function Qr() { return <div className="grid size-24 grid-cols-5 gap-1 rounded-xl bg-white p-2">{Array.from({ length: 25 }).map((_, i) => <i key={i} className={`rounded-[1px] ${[0,1,2,5,7,10,11,12,14,16,18,20,21,22,24,6,9,13,17,19].includes(i) ? 'bg-black' : 'bg-white'}`} />)}</div> }
