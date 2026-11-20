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
import SectionIntro from './SectionIntro'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { trackLeadFormConversion } from '../../analytics'
import { waLink } from '../../site'

// Membership-storefront sections, moved from the homepage so it can focus on the WhatsApp agent.

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

export function MembershipFlow() {
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
          eyebrow={isRTL ? 'متجر العضويات · للأنشطة اللي العميل بيرجعلها' : 'Membership storefront · for repeat-visit businesses'}
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

export function PackageLab() {
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
                <Link to={localePath('/showroom')} className="mt-8 inline-flex w-fit items-center gap-2 border-b border-white/25 pb-1 text-sm font-semibold text-white transition-colors hover:border-[#fe8c58] hover:text-[#fe8c58]">{isRTL ? 'شوف العرض الكامل' : 'Open the guided showroom'} <ArrowUpRight size={15} /></Link>
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

export function FoundingOffer() {
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
