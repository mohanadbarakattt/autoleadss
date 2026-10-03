import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  Check,
  Coffee,
  CreditCard,
  Dog,
  QrCode,
  ScanLine,
  Scissors,
  Shirt,
  Sparkles,
  Store,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import MembershipFlowDemo from '../MembershipFlowDemo'
import QuoteBuilder from './QuoteBuilder'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { trackLeadFormConversion } from '../../analytics'
import { waLink } from '../../site'

type Term = 1 | 3 | 6 | 12
type CategoryKey = 'barber' | 'car' | 'laundry' | 'pets' | 'cafe'

type Plan = {
  name: string
  fit: string
  monthly: number
  items: string[]
  rule: string
  highlighted?: boolean
}

type Category = {
  key: CategoryKey
  name: string
  eyebrow: string
  icon: LucideIcon
  plans: Plan[]
}

const termDiscount: Record<Term, number> = { 1: 1, 3: 0.95, 6: 0.9, 12: 0.82 }

const money = (value: number, ar: boolean) =>
  new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG', { maximumFractionDigits: 0 }).format(value)

function SectionIntro({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
      <div>
        <p className={`eyebrow ${dark ? 'text-[#fe8c58]' : 'text-accent'}`}>{eyebrow}</p>
        <h2 className={`mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] ${dark ? 'text-white' : 'text-[#0A0A0B]'}`}>{title}</h2>
      </div>
      {body ? <p className={`max-w-xl text-base leading-relaxed lg:justify-self-end ${dark ? 'text-white/55' : 'text-muted-fg'}`}>{body}</p> : null}
    </div>
  )
}

function Hero() {
  const { isRTL } = useLocale()
  const deliverables = isRTL
    ? ['بيع الباقات', 'تحصيل الدفع', 'استخدام QR', 'متابعة الأداء']
    : ['Sell packages', 'Take payment', 'Redeem by QR', 'See performance']

  return (
    <>
      <section className="relative overflow-hidden bg-[#0A0A0B] text-white">
        <div aria-hidden className="absolute inset-0 grain-overlay opacity-70" />
        <div aria-hidden className="absolute -end-32 -top-48 h-[620px] w-[620px] rounded-full bg-[#ff5c2a]/20 blur-[120px]" />
        <div className="content-width relative grid items-center gap-10 pb-16 pt-28 sm:pt-32 lg:min-h-[720px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:pb-24 lg:pt-36">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">AutoLeadss / Cairo</p>
            <h1 className="mt-6 font-display text-[clamp(3.4rem,7.5vw,6.8rem)] font-bold leading-[0.88] tracking-[-0.066em]">
              {isRTL ? 'بيع الشهر' : 'Sell the month'}
              <span className="mt-1 block font-serif font-normal italic text-[#fe8c58]">{isRTL ? 'مقدماً.' : 'upfront.'}</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/62 sm:text-lg">
              {isRTL
                ? 'نحوّل خدمتك المتكررة لعضوية باسمك: بيع، QR ولوحة مالك.'
                : 'We turn repeat services into an owned membership product: storefront, QR and dashboard.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pricing" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#fe8c58] px-6 text-sm font-semibold text-[#111214] transition-transform hover:-translate-y-0.5">
                {isRTL ? 'عرض أول ٥ عملاء' : 'Founding offer'}
              </a>
              <a href="#packages" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/[0.05] px-6 text-sm font-medium text-white transition-colors hover:bg-white/10">
                {isRTL ? 'شوف القالب' : 'See the template'}
              </a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl lg:max-w-none lg:ps-4">
            <MembershipFlowDemo mode="compact" />
          </div>
        </div>
      </section>

      <section id="offer" className="scroll-mt-36 border-y border-black/10 bg-[#EFECE4]">
        <div className="content-width grid sm:grid-cols-2 lg:grid-cols-4">
          {deliverables.map((item, index) => (
            <div key={item} className="flex min-h-28 items-center gap-4 border-b border-black/10 py-6 sm:px-5 lg:border-b-0 lg:border-e first:ps-0 last:border-e-0">
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <p className="max-w-[12rem] font-display text-lg font-bold leading-tight">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function MembershipFlow() {
  const { isRTL } = useLocale()
  const steps = isRTL
    ? [
        ['اختيار الباقة', 'المدة والمحتوى واضحين', Store],
        ['الدفع مقدماً', 'على حساب التاجر المعتمد', CreditCard],
        ['استلام البطاقة', 'QR ورصيد وتاريخ تجديد', QrCode],
        ['تسجيل الاستخدام', 'الموظف يخصم في ثواني', ScanLine],
        ['متابعة الأرقام', 'الإيراد والتجديد والأداء', BarChart3],
      ] as const
    : [
        ['Choose a plan', 'Clear term and inclusions', Store],
        ['Pay upfront', 'Through the approved merchant account', CreditCard],
        ['Receive the pass', 'QR, balance and renewal date', QrCode],
        ['Redeem each use', 'Staff deduct it in seconds', ScanLine],
        ['See the numbers', 'Revenue, renewals and performance', BarChart3],
      ] as const

  return (
    <section className="bg-[#FAFAF7] py-20 sm:py-28">
      <div className="content-width">
        <SectionIntro
          eyebrow={isRTL ? 'منتج واحد متصل' : 'One connected product'}
          title={isRTL ? 'من أول دفعة لآخر استخدام.' : 'From first payment to every redemption.'}
          body={isRTL ? 'نفس قواعد الباقة والسعر والرصيد بتظهر للعميل والموظف والمالك، من غير اختلاف بين الشاشات.' : 'The same package rules, price and balance follow the customer, staff and owner—without mismatched screens.'}
        />
        <ol className="mt-12 grid overflow-hidden rounded-[28px] border border-border bg-white md:grid-cols-5">
          {steps.map(([title, body, Icon], index) => (
            <li key={title} className="relative min-h-52 border-b border-border p-6 last:border-0 md:border-b-0 md:border-e">
              <div className="flex items-center justify-between">
                <Icon size={21} className="text-[#1E7E48]" />
                <span className="font-mono text-[10px] text-black/30">0{index + 1}</span>
              </div>
              <h3 className="mt-12 font-display text-xl font-bold leading-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">{body}</p>
              {index < steps.length - 1 ? <ArrowDown size={16} className="absolute -bottom-2.5 start-1/2 z-10 rounded-full bg-[#0A0A0B] p-0.5 text-white md:-end-2.5 md:start-auto md:top-1/2 md:-translate-y-1/2 md:-rotate-90" /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function TrustStrip() {
  const { isRTL } = useLocale()
  const points = isRTL
    ? ['عربي وإنجليزي', 'SEO محلي من البداية', 'على دومينك وحساباتك', 'النسخة والبيانات ملكك']
    : ['Arabic + English', 'Local SEO from day one', 'Your domain and accounts', 'You own the build and data']

  return (
    <section className="border-y border-black/10 bg-white">
      <div className="content-width grid sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point, index) => (
          <div key={point} className="flex min-h-24 items-center gap-3 border-b border-black/10 py-5 sm:px-5 lg:border-b-0 lg:border-e first:ps-0 last:border-e-0">
            <Check size={16} className="shrink-0 text-[#1E7E48]" />
            <span className="text-sm font-semibold">{point}</span>
            <span className="ms-auto font-mono text-[9px] text-black/25">0{index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PackageLab() {
  const { isRTL, localePath } = useLocale()
  const [active, setActive] = useState<CategoryKey>('pets')
  const [term, setTerm] = useState<Term>(3)

  const categories: Category[] = useMemo(() => isRTL ? [
    { key: 'barber', name: 'حلاقة', eyebrow: 'خدمة متكررة', icon: Scissors, plans: [
      { name: 'Fresh', fit: 'للعميل اللي بيحلق مرة كل شهر', monthly: 550, items: ['حلاقة واحدة', 'غسيل وتصفيف', 'أولوية حجز', 'QR شخصي'], rule: 'استخدام واحد شهرياً' },
      { name: 'Sharp', fit: 'للحلاقة المنتظمة مع الدقن', monthly: 900, items: ['حلاقتان', 'تهذيب دقن', 'غسيل وتصفيف', 'أولوية حجز'], rule: 'حد أقصى زيارة أسبوعياً', highlighted: true },
      { name: 'Complete', fit: 'للعناية الكاملة طول الشهر', monthly: 1350, items: ['٣ حلاقات', '٣ مرات دقن', 'جلسة عناية', 'خصم منتجات'], rule: 'الحجوزات حسب المتاح' },
    ]},
    { key: 'car', name: 'غسيل سيارات', eyebrow: 'رصيد غسلات', icon: Waves, plans: [
      { name: 'City', fit: 'استخدام خفيف داخل المدينة', monthly: 480, items: ['غسلتان خارجية', 'تنظيف زجاج', 'فحص سريع', 'QR للسيارة'], rule: 'غسلة واحدة أسبوعياً' },
      { name: 'Always Clean', fit: 'للسائق اليومي', monthly: 850, items: ['٤ غسلات', 'تنظيف داخلي مرتان', 'حجز أوقات هادئة', 'خصم إضافات'], rule: 'استخدام كل ٥ أيام', highlighted: true },
      { name: 'Care+', fit: 'غسيل وعناية أعمق', monthly: 1450, items: ['٤ غسلات كاملة', 'واكس مرة', 'تنظيف صالون', 'أولوية حجز'], rule: 'للسيارة المسجلة فقط' },
    ]},
    { key: 'laundry', name: 'مغسلة', eyebrow: 'كيلوجرامات شهرية', icon: Shirt, plans: [
      { name: 'Solo', fit: 'لشخص واحد أو غسيل خفيف', monthly: 650, items: ['١٠ كجم', 'استلام مرة', 'توصيل مرة', 'متابعة الرصيد'], rule: 'الرصيد ينتهي شهرياً' },
      { name: 'Home', fit: 'للاحتياج الأسبوعي المنتظم', monthly: 1100, items: ['٢٠ كجم', 'استلام مرتان', 'توصيل مرتان', 'أولوية تشغيل'], rule: '٥ كجم حد أدنى للطلب', highlighted: true },
      { name: 'Family', fit: 'لأسرة واستهلاك أكبر', monthly: 1550, items: ['٣٠ كجم', '٤ مرات استلام', '٤ مرات توصيل', 'خصم القطع الخاصة'], rule: 'داخل نطاق التوصيل' },
    ]},
    { key: 'pets', name: 'حيوانات أليفة', eyebrow: 'طعام وعناية', icon: Dog, plans: [
      { name: 'Dry Routine', fit: 'طعام جاف لكلب متوسط', monthly: 1450, items: ['عبوة طعام جاف', 'توصيل شهري', 'تنبيه قبل الشحن', 'خصم مكافآت'], rule: 'المنتج والوزن حسب الاتفاق' },
      { name: 'Balanced Mix', fit: 'روتين يجمع الجاف والفريش', monthly: 2250, items: ['طعام جاف', 'وجبات طازجة', 'توصيل مجدول', 'متابعة التجديد'], rule: 'لكلب متوسط الحجم', highlighted: true },
      { name: 'Complete Care', fit: 'طعام متوازن مع جروومينج', monthly: 3150, items: ['طعام جاف', 'وجبات فريش', 'جلسة جروومينج', 'توصيل وأولوية'], rule: 'موعد الجروومينج بالحجز' },
    ]},
    { key: 'cafe', name: 'كافيه', eyebrow: 'رصيد مشروبات', icon: Coffee, plans: [
      { name: 'Weekday 10', fit: 'قهوة لأيام الشغل', monthly: 700, items: ['١٠ مشروبات ساخنة', 'تعديل لبن مرتين', 'QR سريع', 'تنبيه الرصيد'], rule: 'مشروب واحد يومياً' },
      { name: 'Daily 20', fit: 'للعميل شبه اليومي', monthly: 1200, items: ['٢٠ مشروباً', '٤ إضافات', 'ترقية حجم مرتين', 'أولوية تحضير'], rule: 'مشروب واحد يومياً', highlighted: true },
      { name: 'Coffee + Work', fit: 'للجلسات والاجتماعات', monthly: 1750, items: ['٢٠ مشروباً', '٥ حلويات', 'ساعتان مساحة عمل', 'خصم ضيف'], rule: 'الحجز حسب المتاح' },
    ]},
  ] : [
    { key: 'barber', name: 'Barber', eyebrow: 'Repeat service', icon: Scissors, plans: [
      { name: 'Fresh', fit: 'For one reliable monthly reset', monthly: 550, items: ['One haircut', 'Wash and style', 'Booking priority', 'Personal QR pass'], rule: 'One use each month' },
      { name: 'Sharp', fit: 'For regular cut-and-beard care', monthly: 900, items: ['Two haircuts', 'Beard shaping', 'Wash and style', 'Booking priority'], rule: 'Maximum one visit weekly', highlighted: true },
      { name: 'Complete', fit: 'For full upkeep all month', monthly: 1350, items: ['Three haircuts', 'Three beard services', 'One care session', 'Product discount'], rule: 'Appointments subject to availability' },
    ]},
    { key: 'car', name: 'Car wash', eyebrow: 'Wash credits', icon: Waves, plans: [
      { name: 'City', fit: 'For lighter city driving', monthly: 480, items: ['Two exterior washes', 'Glass clean', 'Quick check', 'Vehicle QR pass'], rule: 'Maximum one wash weekly' },
      { name: 'Always Clean', fit: 'For the everyday driver', monthly: 850, items: ['Four washes', 'Two interior cleans', 'Off-peak booking', 'Add-on savings'], rule: 'One use every five days', highlighted: true },
      { name: 'Care+', fit: 'For washing plus deeper care', monthly: 1450, items: ['Four full washes', 'One wax treatment', 'Interior detailing', 'Booking priority'], rule: 'Registered vehicle only' },
    ]},
    { key: 'laundry', name: 'Laundry', eyebrow: 'Monthly kilograms', icon: Shirt, plans: [
      { name: 'Solo', fit: 'For one person or light loads', monthly: 650, items: ['10 kg', 'One pickup', 'One delivery', 'Live balance'], rule: 'Allowance expires monthly' },
      { name: 'Home', fit: 'For dependable weekly laundry', monthly: 1100, items: ['20 kg', 'Two pickups', 'Two deliveries', 'Priority processing'], rule: '5 kg minimum per order', highlighted: true },
      { name: 'Family', fit: 'For a larger household', monthly: 1550, items: ['30 kg', 'Four pickups', 'Four deliveries', 'Special-item savings'], rule: 'Within the delivery area' },
    ]},
    { key: 'pets', name: 'Pets', eyebrow: 'Food and care', icon: Dog, plans: [
      { name: 'Dry Routine', fit: 'Dry food for a medium dog', monthly: 1450, items: ['Dry-food bag', 'Monthly delivery', 'Pre-shipment reminder', 'Treat discount'], rule: 'Brand and weight agreed first' },
      { name: 'Balanced Mix', fit: 'A dry and fresh-food routine', monthly: 2250, items: ['Dry food', 'Fresh meals', 'Scheduled delivery', 'Renewal tracking'], rule: 'Designed for a medium dog', highlighted: true },
      { name: 'Complete Care', fit: 'Balanced food plus grooming', monthly: 3150, items: ['Dry food', 'Fresh meals', 'One grooming visit', 'Delivery and priority'], rule: 'Grooming requires booking' },
    ]},
    { key: 'cafe', name: 'Café', eyebrow: 'Drink credits', icon: Coffee, plans: [
      { name: 'Weekday 10', fit: 'Coffee for working days', monthly: 700, items: ['10 hot drinks', 'Two milk changes', 'Fast QR redemption', 'Balance reminders'], rule: 'One drink per day' },
      { name: 'Daily 20', fit: 'For the near-daily regular', monthly: 1200, items: ['20 drinks', 'Four add-ons', 'Two size upgrades', 'Priority preparation'], rule: 'One drink per day', highlighted: true },
      { name: 'Coffee + Work', fit: 'For sessions and meetings', monthly: 1750, items: ['20 drinks', 'Five desserts', 'Two workspace hours', 'Guest discount'], rule: 'Space subject to availability' },
    ]},
  ], [isRTL])

  const selected = categories.find(category => category.key === active) ?? categories[0]
  const SelectedIcon = selected.icon
  const savings = Math.round((1 - termDiscount[term]) * 100)
  const demoIdentity = (isRTL ? {
    barber: ['قالب صالون حلاقة', 'حلاقتك محسوبة طول الشهر.'],
    car: ['قالب غسيل سيارات', 'عربيتك نضيفة من غير قرار كل مرة.'],
    laundry: ['قالب مغسلة', 'غسيل الشهر متظبط ومستلم.'],
    pets: ['قالب عناية بالحيوانات', 'الأكل والعناية جايين في ميعادهم.'],
    cafe: ['قالب كافيه', 'قهوتك اليومية محسوبة.'],
  } : {
    barber: ['Barber template', 'Stay sharp all month.'],
    car: ['Car-wash template', 'Keep the car clean without deciding every visit.'],
    laundry: ['Laundry template', 'The month’s laundry, collected and covered.'],
    pets: ['Pet-care template', 'Food and care, arriving on schedule.'],
    cafe: ['Café template', 'Your everyday coffee, already covered.'],
  })[active]

  return (
    <section id="packages" className="scroll-mt-36 bg-[#EFECE4] py-20 sm:py-28">
      <div className="content-width">
        <SectionIntro
          eyebrow={isRTL ? 'قالب التجار' : 'Vendor template'}
          title={isRTL ? 'هيكل واحد. شخصية مختلفة لكل نشاط.' : 'One system. A different character for every business.'}
          body={isRTL ? 'نغير الهوية والصور والباقات والقواعد، ونحافظ على تجربة بيع وتشغيل ثابتة.' : 'Brand, imagery, plans and rules adapt. The buying and operating experience stays dependable.'}
        />

        <div className="mt-10 flex gap-7 overflow-x-auto border-b border-black/12 pb-0" role="tablist" aria-label={isRTL ? 'نوع النشاط' : 'Business category'}>
          {categories.map(category => {
            const on = category.key === active
            return <button key={category.key} type="button" role="tab" aria-selected={on} onClick={() => setActive(category.key)} className={`relative shrink-0 pb-4 text-sm font-semibold transition-colors ${on ? 'text-[#0A0A0B]' : 'text-black/38 hover:text-black/70'}`}>{category.name}{on ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#ff5c2a]" /> : null}</button>
          })}
        </div>

        <div className="mt-7 overflow-hidden rounded-[30px] bg-[#101112] text-white shadow-[0_32px_90px_-58px_rgba(10,10,11,0.7)]">
          <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <SelectedIcon size={19} className="text-[#fe8c58]" />
              <div><p className="font-display text-lg font-bold">{demoIdentity[0]}</p><p className="text-xs text-white/38">{isRTL ? 'ديمو تصوري · قالب قابل للتخصيص' : 'Concept demo · adaptable template'}</p></div>
            </div>
            <div className="flex items-center gap-1 border-b border-white/15" aria-label={isRTL ? 'مدة الاشتراك' : 'Membership term'}>
              {([1, 3, 6, 12] as Term[]).map(value => <button key={value} type="button" aria-pressed={term === value} onClick={() => setTerm(value)} className={`min-w-12 px-2 py-2 text-xs font-semibold transition-colors ${term === value ? 'border-b-2 border-[#fe8c58] text-white' : 'text-white/35 hover:text-white/70'}`}>{value}{isRTL ? ' ش' : 'm'}</button>)}
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12 lg:p-10">
            <div className="flex flex-col justify-between">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#fe8c58]">{selected.eyebrow}</p><h3 className="mt-4 max-w-md font-display text-[clamp(2.4rem,5vw,4.8rem)] font-bold leading-[0.94] tracking-[-0.05em]">{demoIdentity[1]}</h3></div>
              <Link to={localePath('/demo/membership-flow')} className="mt-8 inline-flex w-fit items-center gap-2 border-b border-white/25 pb-1 text-sm font-semibold text-white transition-colors hover:border-[#fe8c58] hover:text-[#fe8c58]">{isRTL ? 'شوف تدفق النظام' : 'See the system flow'} <ArrowUpRight size={15} /></Link>
            </div>
            <div className="grid gap-3">
              {selected.plans.map(plan => {
                const total = Math.round(plan.monthly * term * termDiscount[term])
                return <article key={plan.name} className={`grid gap-5 border-t p-5 sm:grid-cols-[1fr_auto] sm:items-center ${plan.highlighted ? 'border-[#fe8c58] bg-white/[0.06]' : 'border-white/12 bg-white/[0.025]'}`}>
                  <div><div className="flex items-center gap-3"><h4 className="font-display text-xl font-bold">{plan.name}</h4>{plan.highlighted ? <span className="font-mono text-[9px] uppercase tracking-wider text-[#fe8c58]">{isRTL ? 'مقترحة' : 'Recommended'}</span> : null}</div><p className="mt-1 text-sm text-white/45">{plan.fit}</p><p className="mt-3 text-xs text-white/35">{plan.items.slice(0, 2).join(' · ')}</p></div>
                  <div className="sm:text-end"><p className="font-serif text-3xl">{money(total, isRTL)}</p><p className="mt-1 text-[10px] text-white/35">{isRTL ? 'جنيه إجمالي' : 'EGP total'}{savings ? ` · ${isRTL ? 'وفر' : 'save'} ${savings}%` : ''}</p></div>
                </article>
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 px-6 py-4 text-xs text-white/38 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>{isRTL ? 'صفحة البيع · الدفع · QR · لوحة المالك' : 'Storefront · payment · QR · owner dashboard'}</span>
            <span className="inline-flex items-center gap-2"><Sparkles size={13} /> {isRTL ? 'كلها من نفس بيانات الباقة' : 'One source of package data'}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Work() {
  const { locale, localePath, isRTL } = useLocale()
  const [activeWork, setActiveWork] = useState(0)
  const items = [
    { name: 'TUT', domain: 'tutapp.co', label: isRTL ? 'منتج حي' : 'Live product', body: isRTL ? 'منتج سفر لمصر مبني على إجابات موثقة ومصادر واضحة.' : 'An Egypt travel product built around sourced, verifiable answers.', image: '/work/tut.png', href: 'https://tutapp.co', external: true, aspect: 'aspect-[2467/1297]', surface: 'bg-[#f4eddc]' },
    { name: 'Lash Cartel', domain: 'lash-cartel.demo', label: isRTL ? 'ديمو تصوري' : 'Concept demo', body: isRTL ? 'تجربة حجز راقية لاستوديو رموش في الزمالك.' : 'A premium booking experience for a Zamalek lash studio.', image: `/demos/lashes/${locale === 'ar' ? 'ar' : 'en'}-hero.png`, href: localePath('/demo/lashes'), external: false, aspect: 'aspect-[2880/1284]', surface: 'bg-[#080808]' },
    { name: 'MBAI Group', domain: 'mbai-group.com', label: isRTL ? 'موقع المجموعة' : 'Group website', body: isRTL ? 'واجهة تحريرية لمجموعة ذكاء اصطناعي ومنتجات في المنطقة.' : 'An editorial site for a regional AI and product group.', image: '/work/mbai.png', href: 'https://mbai-group.com', external: true, aspect: 'aspect-[2467/1297]', surface: 'bg-[#cbc8c3]' },
  ]
  const activeItem = items[activeWork]
  const projectLink = activeItem.external
    ? <a href={activeItem.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-sm font-semibold transition-colors hover:border-[#fe8c58] hover:text-[#fe8c58]">{isRTL ? 'افتح المشروع' : 'Open project'} <ArrowUpRight size={15} /></a>
    : <Link to={activeItem.href} className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-sm font-semibold transition-colors hover:border-[#fe8c58] hover:text-[#fe8c58]">{isRTL ? 'افتح الديمو' : 'Open demo'} <ArrowUpRight size={15} /></Link>

  return (
    <section id="work" className="scroll-mt-36 bg-[#0A0A0B] py-20 text-white sm:py-28">
      <div className="content-width">
        <SectionIntro dark eyebrow={isRTL ? 'شغل مختار' : 'Selected work'} title={isRTL ? 'ثلاثة مشاريع. معروضين صح.' : 'Three projects. Shown properly.'} body={isRTL ? 'من غير شبكة صور صغيرة أو قص عشوائي. اختار المشروع وشوفه كامل.' : 'No wall of tiny screenshots and no arbitrary crops. Choose a project and see it clearly.'} />
        <div className="mt-10 grid border-y border-white/12 sm:grid-cols-3">
          {items.map((item, index) => <button key={item.name} type="button" onClick={() => setActiveWork(index)} aria-pressed={activeWork === index} className={`flex items-center justify-between border-b border-white/12 px-0 py-5 text-start transition-colors last:border-b-0 sm:border-b-0 sm:border-e sm:px-5 first:sm:ps-0 last:sm:border-e-0 ${activeWork === index ? 'text-white' : 'text-white/35 hover:text-white/70'}`}><span><span className="block font-display text-lg font-bold">{item.name}</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em]">{item.label}</span></span><span className={`h-2 w-2 rounded-full ${activeWork === index ? 'bg-[#fe8c58]' : 'bg-white/15'}`} /></button>)}
        </div>
        <div className="mt-8 overflow-hidden rounded-[28px] border border-white/12 bg-[#151618] shadow-[0_34px_90px_-48px_rgba(0,0,0,0.9)]">
          <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#171719] px-4 sm:h-12 sm:px-5"><div className="flex items-center gap-1.5" aria-hidden><span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></div><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/38" dir="ltr">{activeItem.domain}</span></div>
          <div className={`${activeItem.aspect} ${activeItem.surface}`}><img key={activeItem.image} src={activeItem.image} alt={`${activeItem.name} website homepage`} decoding="async" className="h-full w-full object-contain object-top" /></div>
        </div>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-display text-3xl font-bold">{activeItem.name}</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">{activeItem.body}</p></div>{projectLink}</div>
      </div>
    </section>
  )
}

function FoundingOffer() {
  const { isRTL } = useLocale()
  const t = useT()
  const included = isRTL
    ? ['صفحة بيع عربي وإنجليزي', 'حتى ٣ باقات بمدد ١/٣/٦/١٢ شهر', 'بطاقة QR وتجربة خصم للموظف', 'لوحة مالك مركزة', 'PWA وتدريب وتسليم']
    : ['Arabic and English sales page', 'Up to 3 plans with 1/3/6/12-month terms', 'Customer QR pass and staff redemption', 'Focused owner dashboard', 'PWA, training and handoff']
  const steps = isRTL
    ? [['٠١', 'نحدد الباقة', 'الخدمة المتكررة والسعر والرصيد والصلاحية وقواعد الاستخدام.'], ['٠٢', 'نصمم ونبني', 'محتوى حقيقي، واجهة بيع، QR ولوحة تحكم متناسقة.'], ['٠٣', 'نختبر ونسلّم', 'نجرب السيناريوهات، ندرب الفريق ونسلّم النسخة النهائية.']]
    : [['01', 'Define the package', 'Repeat purchase, price, allowance, validity and usage rules.'], ['02', 'Design and build', 'Real content, storefront, QR and dashboard as one system.'], ['03', 'Test and hand over', 'We test scenarios, train the team and deliver the final build.']]

  return (
    <section id="pricing" className="scroll-mt-36 bg-[#EFECE4] py-20 sm:py-28">
      <div className="content-width">
        <div className="grid overflow-hidden rounded-[32px] bg-white shadow-[0_32px_100px_-68px_rgba(10,10,11,0.6)] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="bg-[#1B3B2B] p-7 text-white sm:p-10 lg:p-12">
            <p className="eyebrow text-[#fe8c58]">{isRTL ? 'عرض التأسيس لأول ٥' : 'Founding offer · first five'}</p>
            <div className="mt-8 flex items-end gap-3"><span className="font-serif text-[clamp(4rem,9vw,7rem)] leading-[0.8]">{isRTL ? '٢٠٬٠٠٠' : '20,000'}</span><span className="pb-1 text-sm text-white/50">{isRTL ? 'جنيه' : 'EGP'}</span></div>
            <p className="mt-5 text-sm text-white/58">{isRTL ? 'إجمالي تنفيذ المشروع وملكية النسخة المسلّمة' : 'Total implementation fee with ownership of the delivered build'}</p>
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/12">
              <div className="bg-white/[0.05] p-4"><p className="font-serif text-3xl">10k</p><p className="mt-1 text-xs text-white/50">{isRTL ? 'للبدء' : 'to start'}</p></div>
              <div className="bg-white/[0.05] p-4"><p className="font-serif text-3xl">10k</p><p className="mt-1 text-xs text-white/50">{isRTL ? 'عند قبول التسليم' : 'at accepted handoff'}</p></div>
            </div>
            <ul className="mt-8 space-y-3 border-t border-white/12 pt-7">
              {included.map(item => <li key={item} className="flex gap-2.5 text-sm text-white/78"><Check size={16} className="mt-0.5 shrink-0 text-[#fe8c58]" />{item}</li>)}
            </ul>
            <a href={waLink(t.hero.waText)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} className="mt-9 inline-flex min-h-13 w-full items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-[#1B3B2B]">{isRTL ? 'احجز مكان من أول ٥' : 'Claim one of the first five places'}</a>
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <p className="eyebrow text-accent">{isRTL ? 'تسليم خلال أسبوعين' : 'Two-week delivery'}</p>
            <h2 className="mt-3 max-w-xl font-display text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{isRTL ? 'من فكرة متكررة لمنتج متسلّم.' : 'From repeat purchase to handed-over product.'}</h2>
            <ol className="mt-9 divide-y divide-border border-y border-border">
              {steps.map(([number, title, body]) => <li key={number} className="grid gap-3 py-6 sm:grid-cols-[3rem_12rem_1fr]"><span className="font-mono text-xs text-accent">{number}</span><h3 className="font-display text-lg font-bold">{title}</h3><p className="text-sm leading-relaxed text-muted-fg">{body}</p></li>)}
            </ol>
            <div className="mt-7 flex flex-col gap-2 rounded-2xl bg-[#EFECE4] p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <strong>{isRTL ? 'بعد أول خمس مشاريع' : 'After the first five projects'}</strong>
              <span className="text-muted-fg">{isRTL ? 'الباقة الأساسية تبدأ من ٣٥٬٠٠٠ جنيه.' : 'Standard implementations start at 35,000 EGP.'}</span>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-fg">{isRTL ? 'المدة تبدأ بعد استلام الدفعة والمحتوى وقواعد الباقات والحسابات المطلوبة. رسوم مقدم الدفع والاستضافة الخارجية تُدفع لمقدميها.' : 'Timing starts after deposit, approved content, package rules and required accounts are received. Payment-provider and external hosting fees are paid to their providers.'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqAndContact() {
  const { isRTL } = useLocale()
  const t = useT()
  const questions = isRTL
    ? [
        ['هل العميل بيدفع اشتراك شهري لأوتوليدز؟', 'لا. ده تنفيذ وتسليم مقابل سعر المشروع. أي صيانة أو تطوير لاحق يكون باتفاق منفصل.'],
        ['مين بيستقبل فلوس الباقات؟', 'التاجر من خلال حسابه المعتمد لدى مقدم الدفع. إحنا نجهز تجربة الربط ولا نضمن قبول مقدم الخدمة.'],
        ['هل النظام يشتغل على الموبايل؟', 'نعم. واجهة العميل والموظف قابلة للإضافة على الشاشة الرئيسية كتطبيق PWA.'],
        ['هل كل الأنشطة بتاخد نفس التصميم؟', 'نفس الهيكل التقني، لكن الهوية والصور والباقات والمحتوى والتفاصيل تتكيف مع كل نشاط.'],
        ['إمتى يبدأ الأسبوعان؟', 'بعد استلام الدفعة والمحتوى المعتمد وقواعد الباقات وأي وصول مطلوب للحسابات.'],
      ]
    : [
        ['Does the client pay AutoLeadss a monthly subscription?', 'No. This is a fixed implementation and handoff. Optional maintenance or later development is agreed separately.'],
        ['Who receives the membership payments?', 'The merchant receives them through its approved provider account. We prepare the connection experience but cannot guarantee provider approval.'],
        ['Does the system work on a phone?', 'Yes. Customer and staff experiences can be installed on the home screen as a PWA.'],
        ['Does every business receive the same design?', 'The technical system is consistent; brand, imagery, plans, content and details are tailored to each business.'],
        ['When do the two weeks begin?', 'After the deposit, approved content, package rules and required account access are received.'],
      ]

  return (
    <section id="faq" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
      <div className="content-width grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-accent">{isRTL ? 'قبل ما نبدأ' : 'Before we start'}</p>
          <h2 className="mt-3 font-display text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{isRTL ? 'واضح من البداية.' : 'Clear from day one.'}</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-fg">{isRTL ? 'نبيع مشروع محدد، بسعر واضح، وتسليم واضح. أول محادثة هدفها نعرف هل عندك عرض شهري يستاهل البناء.' : 'A defined project, a visible price and a clear handoff. The first conversation decides whether your repeat purchase is strong enough to package.'}</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {questions.map(([question, answer], index) => <details key={question} className="group py-1" open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-display text-lg font-bold"><span>{question}</span><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-accent transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-6 pe-12 text-sm leading-relaxed text-muted-fg">{answer}</p></details>)}
        </div>
      </div>

      <div className="content-width mt-20">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0A0A0B] px-7 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="absolute -end-24 -top-32 h-80 w-80 rounded-full bg-[#ff5c2a]/25 blur-[90px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="eyebrow text-[#fe8c58]">{isRTL ? 'مكالمة قصيرة قبل أي التزام' : 'A short call before any commitment'}</p><h2 className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5.5vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.05em]">{isRTL ? 'إيه الحاجة اللي عميلك بيشتريها كل شهر؟' : 'What does your customer already buy every month?'}</h2></div>
            <a href={waLink(t.hero.waText)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#1E7E48] px-7 text-sm font-semibold text-white">{isRTL ? 'ابعتلنا على واتساب' : 'Start on WhatsApp'}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePageSystem() {
  return (
    <>
      <Hero />
      <MembershipFlow />
      <PackageLab />
      <TrustStrip />
      <QuoteBuilder />
      <Work />
      <FoundingOffer />
      <FaqAndContact />
    </>
  )
}
