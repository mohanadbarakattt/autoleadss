import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Download, ExternalLink, MapPin, PackageCheck, Phone, ShieldCheck, Sparkles, Truck, X } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import { pilotBySlug, type Localized } from '../pilots/data'
import NotFound from './NotFound'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
type Duration = { months: 1 | 3 | 6 | 12; discount: number }
type Offer = { name: Localized; kicker: Localized; description: Localized; monthly: number; features: Localized[]; featured?: boolean; image?: string; verified?: boolean }

const DURATIONS: Duration[] = [{ months: 1, discount: 0 }, { months: 3, discount: .05 }, { months: 6, discount: .1 }, { months: 12, discount: .15 }]
const PETSIKA_LOGO = 'https://petsika.com/cdn/shop/files/Asset_76.svg?v=1785428145&width=300'
const RITA_30 = 'https://petsika.com/cdn/shop/files/Balanced.png?v=1781705130&width=900'
const RITA_50 = 'https://petsika.com/cdn/shop/files/370a624764aa3f8f5b0a5e3d8c06958a.webp?v=1786215418&width=900'
const HILLS_MEDIUM = 'https://petsika.com/cdn/shop/files/826a542f-7b62-40ed-a9b0-8a1614d73fd5067ad7aca2b77b90caec6de1b06686b8_9B5ZDnIwUF.jpg?v=1789398235&width=900'

const petsikaOffers: Offer[] = [
  { name: { en: 'Rita Fresh 30', ar: 'ريتا فريش ٣٠' }, kicker: { en: 'Fresh-food plan', ar: 'باقة طعام طازج' }, description: { en: 'A freezer-ready monthly Rita box for a medium dog.', ar: 'صندوق ريتا شهري جاهز للفريزر لكلب متوسط.' }, monthly: 1390, image: RITA_30, verified: true, features: [{ en: '30 × Rita Frozen 30% Protein · 500 g', ar: '٣٠ × ريتا مجمد ٣٠٪ بروتين · ٥٠٠ جم' }, { en: '15 kg delivered in scheduled drops', ar: '١٥ كجم بتوصيل مجدول' }, { en: 'Swap protein before renewal', ar: 'تغيير نوع البروتين قبل التجديد' }, { en: 'Free Madinaty delivery', ar: 'توصيل مجاني داخل مدينتي' }] },
  { name: { en: 'Balanced Medium', ar: 'بالانسد ميديوم' }, kicker: { en: 'Dry + fresh + care', ar: 'جاف + طازج + عناية' }, description: { en: 'A practical mixed-food routine with monthly grooming.', ar: 'نظام مختلط عملي مع جلسة عناية شهرية.' }, monthly: 2690, image: HILLS_MEDIUM, featured: true, features: [{ en: 'Hill’s Medium Adult Chicken · 2.5 kg', ar: 'هيلز ميديوم أدلت دجاج · ٢.٥ كجم' }, { en: '15 × Rita Frozen · 500 g', ar: '١٥ × ريتا مجمد · ٥٠٠ جم' }, { en: '1 full grooming session*', ar: 'جلسة عناية كاملة واحدة*' }, { en: 'Two scheduled deliveries', ar: 'توصيل على دفعتين' }] },
  { name: { en: 'Complete Medium', ar: 'كومبليت ميديوم' }, kicker: { en: 'Full monthly care', ar: 'رعاية شهرية كاملة' }, description: { en: 'More fresh meals, premium dry food and monthly care.', ar: 'وجبات طازجة أكثر، طعام جاف ممتاز وعناية شهرية.' }, monthly: 3390, image: RITA_50, features: [{ en: 'Hill’s Medium Adult Chicken · 2.5 kg', ar: 'هيلز ميديوم أدلت دجاج · ٢.٥ كجم' }, { en: '30 × Rita Frozen · 500 g', ar: '٣٠ × ريتا مجمد · ٥٠٠ جم' }, { en: '1 full grooming session*', ar: 'جلسة عناية كاملة واحدة*' }, { en: 'Priority same-day delivery', ar: 'أولوية التوصيل في نفس اليوم' }] },
]

function money(n: number) { return Math.round(n).toLocaleString('en-US') }

function PaymentMarks() {
  return <div className="flex flex-wrap items-center gap-2.5" aria-label="Suggested payment methods, subject to merchant approval">
    <span className="rounded-xl border border-black/10 bg-white px-4 py-2 text-lg font-black tracking-[-.08em] text-[#F05A28]">valU</span>
    <span className="rounded-xl bg-[#60269E] px-4 py-2 text-sm font-black uppercase tracking-[.08em] text-white">FORSA</span>
    <span className="rounded-xl bg-[#FFCF00] px-4 py-2 text-lg font-black tracking-[-.05em] text-black">halan</span>
    <span className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black/70">VISA</span>
    <span className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black/70">Mastercard</span>
  </div>
}

function useInstallPrompt() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent) }
    const onInstalled = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])
  const install = async () => { if (prompt) { await prompt.prompt(); await prompt.userChoice; setPrompt(null) } else { document.querySelector('#install-help')?.scrollIntoView({ behavior: 'smooth' }) } }
  return { canInstall: Boolean(prompt), installed, install }
}

function Brand({ name, logo, dark = false }: { name: string; logo?: string; dark?: boolean }) {
  if (logo) return <img src={logo} alt={name} className="h-10 w-auto max-w-[150px] object-contain" />
  return <span className={`text-xl font-black tracking-[-.06em] ${dark ? 'text-white' : 'text-[#151515]'}`}>{name}</span>
}

export default function PilotStorefront() {
  const { slug } = useParams()
  const { locale, switchLocale } = useLocale()
  const pilot = pilotBySlug(slug)
  const [duration, setDuration] = useState<Duration>(DURATIONS[0])
  const [chosen, setChosen] = useState(1)
  const [checkout, setCheckout] = useState(false)
  const [faq, setFaq] = useState<number | null>(null)
  const { canInstall, installed, install } = useInstallPrompt()
  const isAr = locale === 'ar'
  const local = (v: Localized) => v[locale]
  if (!pilot) return <NotFound />
  const isPetsika = pilot.slug === 'petsika'
  const logo = isPetsika ? PETSIKA_LOGO : pilot.logoImage
  const offers: Offer[] = isPetsika ? petsikaOffers : pilot.plans.map((p) => ({ name: p.name, kicker: pilot.category, description: p.summary, monthly: p.price, features: p.benefits, featured: p.featured }))
  const selectedOffer = offers[chosen]
  const total = selectedOffer.monthly * duration.months * (1 - duration.discount)
  const effective = total / duration.months
  const heroTitle = isPetsika ? { en: 'Never run out of their essentials.', ar: 'احتياجاتهم توصلك قبل ما تخلص.' } : pilot.headline
  const heroCopy = isPetsika ? { en: 'Food, fresh meals and care for medium dogs—packed into one flexible monthly plan.', ar: 'طعام جاف، وجبات طازجة وعناية للكلاب المتوسطة—في باقة شهرية مرنة.' } : pilot.subhead
  const trust = isPetsika ? [{ icon: Truck, en: '30-min Madinaty delivery', ar: 'توصيل خلال ٣٠ دقيقة بمدينتي' }, { icon: PackageCheck, en: 'Real Petsika products', ar: 'منتجات بيتسيكا الحقيقية' }, { icon: ShieldCheck, en: 'Pause or change before renewal', ar: 'إيقاف أو تعديل قبل التجديد' }] : [{ icon: PackageCheck, en: 'Clear monthly allowance', ar: 'رصيد شهري واضح' }, { icon: ShieldCheck, en: 'Personal QR member pass', ar: 'بطاقة عضوية QR شخصية' }, { icon: Clock3, en: 'Simple staff redemption', ar: 'استخدام سهل للموظفين' }]
  const faqs = isPetsika ? [
    { en: 'Is this the final price?', ar: 'هل هذا السعر النهائي؟', ae: 'No. It is a package proposal based on current public product prices. Petsika must approve product margin, delivery cost and grooming price.', aa: 'لا. هذا مقترح مبني على أسعار المنتجات العامة الحالية. يجب اعتماد هامش المنتجات والتوصيل وسعر العناية من بيتسيكا.' },
    { en: 'Is grooming currently available?', ar: 'هل خدمة العناية متاحة حالياً؟', ae: 'It is a proposed add-on and must be confirmed by the owner before launch.', aa: 'هي إضافة مقترحة ويجب أن يؤكدها صاحب النشاط قبل الإطلاق.' },
    { en: 'How much should my dog eat?', ar: 'كم يجب أن يأكل كلبي؟', ae: 'Serving size depends on weight, activity and health. The final basket should be confirmed with the owner or your veterinarian.', aa: 'الكمية تعتمد على الوزن والنشاط والحالة الصحية. يجب تأكيد السلة النهائية مع صاحب النشاط أو الطبيب البيطري.' },
  ] : [
    { en: 'Can I change plans?', ar: 'هل يمكن تغيير الباقة؟', ae: 'Yes. Changes apply from the next renewal.', aa: 'نعم. يبدأ التغيير من موعد التجديد التالي.' },
    { en: 'How do I use a visit?', ar: 'كيف أستخدم الزيارة؟', ae: 'Show the QR pass from your phone. Staff scans it and the balance updates immediately.', aa: 'اعرض بطاقة QR من هاتفك. الموظف يمسحها ويتحدث الرصيد فوراً.' },
    { en: 'Do unused visits roll over?', ar: 'هل تنتقل الزيارات المتبقية؟', ae: 'The business chooses its rollover rule before launch.', aa: 'يحدد النشاط قاعدة ترحيل الزيارات قبل الإطلاق.' },
  ]

  return <div className="min-h-screen bg-[#F7F7F2] text-[#171815]">
    <Helmet defer={false}><title>{pilot.name} memberships | Private concept</title><meta name="robots" content="noindex,nofollow" /><meta name="theme-color" content={pilot.accent} /><link rel="manifest" href={`/manifests/${pilot.slug}.webmanifest`} /><meta name="apple-mobile-web-app-title" content={`${pilot.name} Club`} /></Helmet>
    <div className="bg-[#151713] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[.14em] text-white/70">{isAr ? 'تصور خاص للعرض · الأسعار والخدمات تحتاج اعتماد النشاط' : 'Private sales concept · pricing and services require owner approval'}</div>
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#F7F7F2]/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 md:px-8">
      <Link to={`/${locale}/pilots`}><Brand name={pilot.name} logo={logo} /></Link>
      <nav className="hidden items-center gap-7 text-sm font-medium text-black/60 md:flex"><a href="#plans">{isAr ? 'الباقات' : 'Plans'}</a><a href="#how">{isAr ? 'كيف تعمل' : 'How it works'}</a><a href="#faq">{isAr ? 'الأسئلة' : 'FAQ'}</a></nav>
      <div className="flex items-center gap-2"><Link to={`/${locale}/pilot/${pilot.slug}/admin`} className="hidden rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold lg:block">{isAr ? 'لوحة الإدارة' : 'Admin preview'}</Link><button onClick={() => switchLocale(isAr ? 'en' : 'ar')} className="rounded-full px-3 py-2 text-xs font-bold">{isAr ? 'EN' : 'AR'}</button><button onClick={install} className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold sm:flex"><Download size={14}/>{installed ? (isAr ? 'تم التثبيت' : 'Installed') : (isAr ? 'أضف للهاتف' : 'Add to phone')}</button><a href="#plans" className="rounded-full bg-[#171815] px-5 py-2.5 text-xs font-semibold text-white">{isAr ? 'اختر باقة' : 'Choose plan'}</a></div>
    </div></header>

    <main>
      <section className="mx-auto grid max-w-[1180px] gap-12 px-5 py-16 md:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:py-20">
        <div><div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold shadow-sm"><Sparkles size={14} style={{ color: pilot.accent }}/>{local(pilot.eyebrow)}</div><h1 className="mt-7 max-w-[640px] text-[clamp(3rem,6.2vw,5.7rem)] font-semibold leading-[.96] tracking-[-.065em]">{local(heroTitle)}</h1><p className="mt-6 max-w-xl text-[17px] leading-7 text-black/58">{local(heroCopy)}</p><div className="mt-8 flex flex-wrap gap-3"><a href="#plans" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold" style={{ background: pilot.accent }}>{isAr ? 'شاهد الباقات' : 'See packages'}{isAr ? <ArrowLeft size={16}/> : <ArrowRight size={16}/>}</a>{pilot.originalSite && <a href={pilot.originalSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold">{isAr ? 'المتجر الحالي' : 'Shop current store'}<ExternalLink size={15}/></a>}</div><div className="mt-8 flex flex-wrap gap-5 text-xs font-medium text-black/45"><span className="flex items-center gap-1.5"><MapPin size={14}/>{local(pilot.location)}</span><span className="flex items-center gap-1.5"><Clock3 size={14}/>{local(pilot.hours)}</span></div></div>

        {isPetsika ? <div className="relative min-h-[520px] overflow-hidden rounded-[36px] bg-[#DDF4CA] p-6 md:p-9"><div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#FF775F]/25 blur-2xl"/><div className="relative flex h-full flex-col"><div className="flex items-center justify-between"><span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em]">Medium dog plan</span><span className="text-xs font-semibold text-black/45">Monthly box · 01</span></div><div className="mt-10 grid flex-1 grid-cols-2 items-end gap-2"><img src={HILLS_MEDIUM} alt="Hill's medium adult dry food from Petsika" className="h-[260px] w-full object-contain mix-blend-multiply drop-shadow-xl md:h-[330px]"/><img src={RITA_30} alt="Rita frozen dog food from Petsika" className="h-[240px] w-full object-contain mix-blend-multiply drop-shadow-xl md:h-[310px]"/></div><div className="mt-5 flex items-end justify-between border-t border-black/10 pt-5"><div><p className="text-sm font-bold">Dry + fresh + monthly care</p><p className="mt-1 text-xs text-black/45">Built from products currently listed on petsika.com</p></div><span className="rounded-full bg-[#171815] px-4 py-2 text-xs font-bold text-white">from 1,390 EGP</span></div></div></div>
        : <div className="relative min-h-[520px] overflow-hidden rounded-[36px] bg-[#171815]"><img src={pilot.heroImage} alt={`${pilot.name} storefront`} className="absolute inset-0 h-full w-full object-cover opacity-85"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/><div className="absolute bottom-0 p-7 text-white"><Brand name={pilot.name} dark/><p className="mt-2 text-sm text-white/60">{local(pilot.category)} · {local(pilot.location)}</p></div></div>}
      </section>

      <section className="border-y border-black/5 bg-white"><div className="mx-auto grid max-w-[1180px] divide-y divide-black/5 px-5 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-8 rtl:md:divide-x-reverse">{trust.map(({icon: Icon,en,ar}) => <div key={en} className="flex items-center gap-3 py-5 md:px-6 first:ps-0"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F1EB]"><Icon size={17}/></span><span className="text-sm font-semibold">{isAr ? ar : en}</span></div>)}</div></section>

      <section id="plans" className="mx-auto max-w-[1180px] px-5 py-20 md:px-8 md:py-28"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.15em]" style={{ color: pilot.accent }}>{isAr ? 'اختر الرعاية المناسبة' : 'Choose the right level'}</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] md:text-6xl">{isAr ? 'باقات واضحة. توفير حقيقي.' : 'Clear packages. Better value.'}</h2></div><div className="flex w-full rounded-2xl border border-black/8 bg-white p-1.5 lg:w-auto">{DURATIONS.map((d) => <button key={d.months} onClick={() => setDuration(d)} className={`relative flex-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors lg:flex-none ${duration.months === d.months ? 'bg-[#171815] text-white' : 'text-black/55'}`}><span>{d.months} {isAr ? (d.months === 1 ? 'شهر' : 'شهور') : (d.months === 1 ? 'month' : 'months')}</span>{d.discount > 0 && <small className="ms-1 text-[9px] text-[#FF775F]">-{Math.round(d.discount*100)}%</small>}</button>)}</div></div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">{offers.map((offer,index) => { const offerTotal = offer.monthly * duration.months * (1-duration.discount); const perMonth=offerTotal/duration.months; return <article key={local(offer.name)} className={`relative flex flex-col overflow-hidden rounded-[28px] border p-6 ${offer.featured ? 'border-[#171815] bg-[#171815] text-white' : 'border-black/8 bg-white'}`}>{offer.featured && <span className="absolute end-4 top-4 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[.13em]" style={{ background: pilot.accent, color:'#111' }}>{isAr ? 'الأكثر اختياراً' : 'Best value'}</span>}{offer.image && <div className={`mb-5 flex h-44 items-center justify-center rounded-2xl p-3 ${offer.featured ? 'bg-white' : 'bg-[#F5F5EF]'}`}><img src={offer.image} alt="" className="h-full w-full object-contain mix-blend-multiply"/></div>}<p className={`text-[10px] font-bold uppercase tracking-[.14em] ${offer.featured ? 'text-white/45' : 'text-black/40'}`}>{local(offer.kicker)}</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{local(offer.name)}</h3><p className={`mt-2 min-h-12 text-sm leading-6 ${offer.featured ? 'text-white/55' : 'text-black/50'}`}>{local(offer.description)}</p><div className={`my-5 h-px ${offer.featured ? 'bg-white/10' : 'bg-black/8'}`}/><div className="flex items-end gap-2"><span className="text-4xl font-semibold tracking-[-.055em]">{money(perMonth)}</span><span className={`pb-1 text-xs ${offer.featured ? 'text-white/45' : 'text-black/45'}`}>EGP / {isAr ? 'شهر' : 'month'}</span></div>{duration.months > 1 && <p className={`mt-1 text-xs ${offer.featured ? 'text-white/40' : 'text-black/40'}`}>{money(offerTotal)} EGP {isAr ? `إجمالي ${duration.months} شهور` : `total for ${duration.months} months`}</p>}<ul className="my-6 space-y-3">{offer.features.map((f) => <li key={local(f)} className="flex gap-2.5 text-sm"><Check size={16} className="mt-0.5 shrink-0" style={{ color: pilot.accent }}/><span>{local(f)}</span></li>)}</ul><button onClick={() => {setChosen(index);setCheckout(true)}} className={`mt-auto w-full rounded-full py-3.5 text-sm font-bold ${offer.featured ? 'text-black' : 'text-white'}`} style={{ background: offer.featured ? pilot.accent : '#171815' }}>{isAr ? 'اختر هذه الباقة' : 'Choose this package'}</button></article> })}</div>
        {isPetsika && <p className="mt-5 text-xs leading-5 text-black/40">* {isAr ? 'خدمة العناية إضافة مقترحة وتحتاج اعتماد بيتسيكا. كميات الطعام إرشادية وتُضبط حسب وزن ونشاط وحالة الكلب وبإرشاد بيطري عند الحاجة.' : 'Grooming is a proposed add-on and requires Petsika approval. Food quantities are indicative and should be adjusted for the dog’s weight, activity and health, with veterinary guidance where appropriate.'}</p>}
      </section>

      <section className="bg-[#EDEDE6] px-5 py-16 md:px-8"><div className="mx-auto flex max-w-[1050px] flex-col justify-between gap-8 rounded-[30px] bg-white p-7 md:flex-row md:items-center md:p-10"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-black/35">{isAr ? 'ادفع بالطريقة المناسبة' : 'Pay your way'}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{isAr ? 'دفع كامل أو تقسيط بعد تفعيل التاجر.' : 'Pay in full or finance after merchant activation.'}</h2><p className="mt-2 text-sm text-black/45">{isAr ? 'الخيارات المعروضة مقترحة وتحتاج موافقة وربط حساب النشاط.' : 'Displayed methods are proposed and require provider approval and merchant connection.'}</p></div><PaymentMarks/></div></section>

      <section id="how" className="mx-auto max-w-[1180px] px-5 py-20 md:px-8 md:py-28"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.15em]" style={{ color:pilot.accent }}>{isAr ? 'كيف تعمل' : 'How it works'}</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.05em] md:text-6xl">{isAr ? 'من الاختيار للتوصيل.' : 'From choice to doorstep.'}</h2><div className="mt-9 space-y-6">{[
          {n:'01',en:'Choose a package and commitment',ar:'اختار الباقة والمدة'},
          {n:'02',en:'Pay online and receive your member pass',ar:'ادفع أونلاين واستلم بطاقة العضوية'},
          {n:'03',en:isPetsika?'Receive each scheduled monthly delivery':'Scan the pass on every visit',ar:isPetsika?'استلم كل توصيل شهري في موعده':'امسح البطاقة في كل زيارة'},
        ].map(s=><div key={s.n} className="flex gap-4"><span className="text-xs font-bold" style={{color:pilot.accent}}>{s.n}</span><p className="font-semibold">{isAr?s.ar:s.en}</p></div>)}</div></div>
        <div id="install-help" className="rounded-[34px] bg-[#171815] p-7 text-white md:p-10"><div className="grid gap-8 sm:grid-cols-[1fr_220px] sm:items-center"><div><span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-[10px] font-bold uppercase tracking-[.13em]"><Download size={13}/>{isAr?'تطبيق ويب':'Installable web app'}</span><h3 className="mt-5 text-3xl font-semibold tracking-[-.04em]">{isAr?'عضويتك على شاشة الهاتف.':'Your membership on the home screen.'}</h3><p className="mt-3 text-sm leading-6 text-white/50">{isAr?'أضف التطبيق بدون متجر تطبيقات. افتح باقتك، تابع التجديد واعرض QR من الهاتف.':'Add it without an app store. Open the package, track renewal and show the QR pass from the phone.'}</p><button onClick={install} className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-black" style={{background:pilot.accent}}><Download size={16}/>{canInstall?(isAr?'ثبّت الآن':'Install now'):(isAr?'طريقة الإضافة للهاتف':'How to add to phone')}</button><p className="mt-3 text-[11px] text-white/35">{isAr?'iPhone: مشاركة ← إضافة إلى الشاشة الرئيسية · Android: قائمة المتصفح ← تثبيت':'iPhone: Share → Add to Home Screen · Android: browser menu → Install app'}</p></div><div className="mx-auto w-[190px] rounded-[32px] border-[7px] border-white/15 bg-[#F4F4EE] p-3 text-[#171815] shadow-2xl"><div className="h-2 w-16 rounded-full bg-black/15 mx-auto"/><div className="mt-8 text-center"><Brand name={pilot.name} logo={logo}/><div className="mx-auto mt-7 grid h-24 w-24 grid-cols-5 gap-1 rounded-2xl bg-white p-3 shadow-sm">{Array.from({length:25},(_,i)=><span key={i} className="rounded-[2px]" style={{background:[0,1,2,5,7,10,11,12,14,16,17,19,20,22,23,24].includes(i)?'#171815':'transparent'}}/>)}</div><p className="mt-5 text-xs font-bold">{local(selectedOffer.name)}</p><p className="mt-1 text-[10px] text-black/40">ACTIVE · renews in 18 days</p></div></div></div></div>
      </div></section>

      <section id="faq" className="border-t border-black/5 bg-white"><div className="mx-auto max-w-[900px] px-5 py-20 md:px-8"><h2 className="text-4xl font-semibold tracking-[-.05em]">{isAr?'قبل الاشتراك':'Before you subscribe'}</h2><div className="mt-8 divide-y divide-black/8">{faqs.map((f,i)=><button key={f.en} onClick={()=>setFaq(faq===i?null:i)} className="w-full py-5 text-start"><span className="flex items-center justify-between gap-4 font-semibold"><span>{isAr?f.ar:f.en}</span><ChevronDown size={18} className={`transition-transform ${faq===i?'rotate-180':''}`}/></span>{faq===i&&<p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">{isAr?f.aa:f.ae}</p>}</button>)}</div></div></section>

      <section className="bg-[#171815] px-5 py-16 text-white md:px-8"><div className="mx-auto flex max-w-[1050px] flex-col justify-between gap-8 md:flex-row md:items-center"><div><Brand name={pilot.name} logo={logo} dark/><p className="mt-3 text-sm text-white/45">{local(pilot.location)} · {local(pilot.hours)}</p></div><div className="flex flex-wrap gap-3">{pilot.phone&&<a href={`tel:${pilot.phone.replace(/\s/g,'')}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black"><Phone size={15}/>{pilot.phone}</a>}<a href={pilot.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm">{isAr?'المصدر العام':'Public source'}<ExternalLink size={14}/></a></div></div></section>
    </main>

    {checkout&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true"><div className="relative w-full max-w-lg rounded-[30px] bg-white p-7"><button onClick={()=>setCheckout(false)} className="absolute end-5 top-5 rounded-full bg-black/5 p-2"><X size={18}/></button><p className="text-[10px] font-bold uppercase tracking-[.14em] text-black/35">{isAr?'ملخص الباقة':'Package summary'}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">{local(selectedOffer.name)}</h2><div className="mt-6 rounded-2xl bg-[#F4F4EE] p-5"><div className="flex justify-between text-sm"><span>{duration.months} {isAr?'شهر':'months'}</span><strong>{money(total)} EGP</strong></div><div className="mt-3 flex justify-between border-t border-black/8 pt-3 text-sm"><span>{isAr?'متوسط شهري':'Effective monthly'}</span><strong>{money(effective)} EGP</strong></div></div><div className="mt-6"><PaymentMarks/></div><button className="mt-7 w-full rounded-full bg-[#171815] py-4 text-sm font-bold text-white">{isAr?'متابعة للدفع التجريبي':'Continue to demo checkout'}</button><p className="mt-3 text-center text-[11px] text-black/35">{isAr?'عرض فقط — لن يتم تحصيل أي مبلغ.':'Preview only — no payment will be collected.'}</p></div></div>}
  </div>
}
