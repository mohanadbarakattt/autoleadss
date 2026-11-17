import { useState } from 'react'
import { ArrowUpRight, Check, MessageCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'
import { trackLeadFormConversion } from '../../analytics'
import { SITE, waLink } from '../../site'

type Region = 'eg' | 'gulf'

type ServicePackage = {
  id: string
  name: string
  title: string
  delivery: string
  egp: number
  usd?: number
  priceNote?: string
  bestFor: string
  items: string[]
  featured?: boolean
}

type MonthlyPlan = { name: string; body: string; egp: number; usd: number }

const fmt = (value: number, ar: boolean) =>
  new Intl.NumberFormat(ar ? 'ar-EG' : 'en-US', { maximumFractionDigits: 0 }).format(value)

export function bookCallLink(ar: boolean, packageName?: string) {
  const text = ar
    ? `أهلاً أوتوليدز، عايز أحجز مكالمة${packageName ? ` عن باقة ${packageName}` : ''}.`
    : `Hi AutoLeadss, I'd like to book a call${packageName ? ` about the ${packageName} package` : ''}.`
  return waLink(text)
}

export default function ServicesPricing() {
  const { isRTL } = useLocale()
  const [region, setRegion] = useState<Region>('eg')
  const ar = isRTL

  const packages: ServicePackage[] = ar
    ? [
        { id: 'launch', name: 'Launch', title: 'صفحة عملاء لإعلاناتك', bestFor: 'عيادة أو استوديو بيبدأ إعلانات وعايز الرسايل توصل مرتبة', delivery: '١٠ أيام عمل', egp: 18000, usd: 750, items: ['موقع عربي وإنجليزي حتى ٥ صفحات أو صفحة هبوط واحدة', 'فورم عملاء بيوصل على واتساب وGoogle Sheet', 'زر محادثة واتساب مباشر', 'Meta Pixel وGoogle Analytics', 'SEO أساسي', 'على دومينك وحساباتك'] },
        { id: 'growth', name: 'Growth', title: 'وكيل واتساب بالذكاء الاصطناعي يرد ويأهل ويحجز', bestFor: 'عيادات وشركات عقارات ومراكز تجميل بتستقبل رسايل كل يوم', delivery: '٣ أسابيع', egp: 32000, usd: 1500, featured: true, items: ['رقم رسمي على WhatsApp Business API', 'وكيل AI متدرب على أسعارك وأسئلتك بالعربي والإنجليزي', 'تأهيل العملاء والحجز', 'تحويل للموظف عند الحاجة', 'CRM بسيط ومتابعات تلقائية', '٣٠ يوم ضبط وتحسين'] },
        { id: 'scale', name: 'Scale', title: 'نظام العملاء الكامل: إعلانات وصفحة ووكيل ومتابعة', bestFor: 'عيادات بأكتر من فرع، وسطاء ومطورين عقاريين بميزانية إعلانات', delivery: '٥ إلى ٦ أسابيع', egp: 65000, usd: 3000, items: ['Launch وGrowth مع بعض', 'حتى ٥ أتمتة n8n مخصصة (تذكير، تقييمات، تقارير)', 'حساب إعلانات Meta وهيكل الحملات', 'لوحة متابعة', 'تدريب الفريق', '٦٠ يوم ضبط وتحسين'] },
        { id: 'membership', name: 'Membership', title: 'متجر العضويات', bestFor: 'صالونات وحلاقين واستوديوهات رموش وأي نشاط العميل بيرجعله', delivery: 'أسبوعان', egp: 20000, priceNote: 'لأول ٥ عملاء، بعدها ٣٥٬٠٠٠ جنيه', items: ['صفحة بيع حتى ٣ باقات', 'الدفع على حساب التاجر المعتمد', 'بطاقة QR للعميل وخصم للموظف', 'لوحة مالك', 'يتثبت على الموبايل'] },
      ]
    : [
        { id: 'launch', name: 'Launch', title: 'Lead page for your ads', bestFor: 'A clinic or studio starting ads that needs every inquiry to land in one place', delivery: '10 working days', egp: 18000, usd: 750, items: ['Arabic and English site, up to 5 pages or one landing page', 'Lead form sent to WhatsApp and a Google Sheet', 'WhatsApp click-to-chat', 'Meta Pixel and Google Analytics', 'Basic SEO', 'On your domain and accounts'] },
        { id: 'growth', name: 'Growth', title: 'AI WhatsApp agent that replies, qualifies and books', bestFor: 'Clinics, real estate teams and beauty businesses that get chats every day', delivery: '3 weeks', egp: 32000, usd: 1500, featured: true, items: ['Official WhatsApp Business API number', 'AI agent trained on your prices and FAQs in Arabic and English', 'Lead qualification and booking', 'Human handoff', 'Simple CRM pipeline and automatic follow-ups', '30 days of tuning'] },
        { id: 'scale', name: 'Scale', title: 'The full lead system: ads, page, agent and follow-up', bestFor: 'Multi-branch clinics, brokerages and developers with an ad budget', delivery: '5 to 6 weeks', egp: 65000, usd: 3000, items: ['Launch plus Growth', 'Up to 5 custom n8n automations (reminders, reviews, reports)', 'Meta ads account and campaign structure', 'Dashboard', 'Team training', '60 days of tuning'] },
        { id: 'membership', name: 'Membership', title: 'Membership storefront', bestFor: 'Salons, barbers, lash studios and other repeat-visit businesses', delivery: '2 weeks', egp: 20000, priceNote: 'For the first five clients, then EGP 35,000', items: ['Sales page with up to 3 plans', 'Payment through your merchant account', 'Customer QR pass and staff redemption', 'Owner dashboard', 'Installable on phones'] },
      ]

  const monthly: MonthlyPlan[] = ar
    ? [
        { name: 'Care', body: 'متابعة الاستضافة، إصلاحات، تعديلات محتوى بسيطة، نسخة احتياطية شهرية', egp: 2500, usd: 120 },
        { name: 'Grow', body: 'Care مع ضبط وكيل الذكاء الاصطناعي، تعديلين على الأتمتة شهرياً، وتقرير عملاء شهري', egp: 6000, usd: 300 },
        { name: 'Lead Engine', body: 'Grow مع إدارة إعلانات Meta، ٨ تصميمات إعلانية شهرياً، واختبار صفحات الهبوط (ميزانية الإعلان منفصلة)', egp: 12000, usd: 600 },
      ]
    : [
        { name: 'Care', body: 'Hosting checks, fixes, small content edits, monthly backup', egp: 2500, usd: 120 },
        { name: 'Grow', body: 'Care plus AI agent tuning, 2 automation changes a month, monthly lead report', egp: 6000, usd: 300 },
        { name: 'Lead Engine', body: 'Grow plus Meta ads management, 8 ad creatives a month, landing page tests (ad spend extra)', egp: 12000, usd: 600 },
      ]

  const price = (egp: number, usd?: number) => {
    if (region === 'gulf' && usd) return { value: `$${fmt(usd, false)}`, unit: ar ? 'دولار' : 'USD' }
    return { value: fmt(egp, ar), unit: ar ? 'جنيه' : 'EGP' }
  }

  const proof = ar
    ? [
        { big: '+٢٠٠', label: 'عميل محتمل اتولّد عبر ٣ أسواق في الشرق الأوسط وشمال أفريقيا' },
        { big: '٤', label: 'باقات بسعر ثابت ومدة تسليم واضحة' },
        { big: 'AR / EN', label: 'عربي وإنجليزي من أول يوم' },
      ]
    : [
        { big: '200+', label: 'leads generated across 3 MENA markets' },
        { big: '4', label: 'fixed-price packages with clear delivery times' },
        { big: 'AR / EN', label: 'Arabic and English from day one' },
      ]

  return (
    <section id="services" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
      <div className="content-width">
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="eyebrow text-accent">{ar ? 'الخدمات والأسعار' : 'Services and pricing'}</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[#0A0A0B]">{ar ? 'متخسرش ولا عميل بعت رسالة.' : 'Stop losing the leads you already paid for.'}</h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{ar ? 'صفحات بتجمع العملاء من إعلاناتك، ووكيل واتساب بالذكاء الاصطناعي بيرد في ثواني ويأهل ويحجز، وأتمتة بتتابع اللي ماحجزش. سعر ثابت ومدة ثابتة والنسخة ملكك، للعيادات والعقارات والتجميل في مصر والخليج.' : 'Pages that capture your ad leads, an AI WhatsApp agent that replies in seconds, qualifies and books, and automations that follow up with everyone who did not book. Fixed price, fixed timeline, and you own the build. For clinics, real estate and beauty in Egypt and the Gulf.'}</p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[28px] bg-[#0A0A0B] text-white sm:grid-cols-3">
          {proof.map((item, index) => (
            <div key={item.label} className={`flex items-center gap-5 border-white/10 px-6 py-7 sm:px-8 ${index < proof.length - 1 ? 'border-b sm:border-b-0 sm:border-e' : ''}`}>
              <span className={`shrink-0 font-serif text-5xl leading-none ${index === 0 ? 'text-[#fe8c58]' : 'text-white'}`} dir="ltr">{item.big}</span>
              <span className="text-sm leading-snug text-white/62">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-fg">{ar ? '٥٠٪ للبدء و٥٠٪ عند التسليم. رسوم رسائل Meta والإعلانات والاستضافة ومقدم الدفع تُدفع لمقدميها مباشرة.' : '50% to start, 50% at handoff. Meta message fees, ad spend, hosting and payment-provider fees are paid to those providers directly.'}</p>
          <div className="inline-flex shrink-0 rounded-full border border-border bg-white p-1" role="tablist" aria-label={ar ? 'المنطقة' : 'Region'}>
            {(['eg', 'gulf'] as Region[]).map(r => (
              <button key={r} type="button" role="tab" aria-selected={region === r} onClick={() => setRegion(r)} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${region === r ? 'bg-[#0A0A0B] text-white' : 'text-black/50 hover:text-black'}`}>
                {r === 'eg' ? (ar ? 'مصر (جنيه)' : 'Egypt (EGP)') : (ar ? 'الخليج (دولار)' : 'Gulf (USD)')}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {packages.map(pkg => {
            const p = price(pkg.egp, pkg.usd)
            const dark = pkg.featured
            return (
              <article key={pkg.id} className={`flex flex-col rounded-[26px] border p-6 sm:p-7 ${dark ? 'border-[#0A0A0B] bg-[#101112] text-white shadow-[0_32px_90px_-58px_rgba(10,10,11,0.7)]' : 'border-border bg-white'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${dark ? 'text-[#fe8c58]' : 'text-accent'}`}>{pkg.name}</p>
                  {dark ? <span className="rounded-full bg-[#fe8c58]/15 px-2.5 py-1 text-[10px] font-semibold text-[#fe8c58]">{ar ? 'الأكثر طلباً' : 'Most requested'}</span> : null}
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{pkg.title}</h3>
                <p className={`mt-2 text-xs leading-relaxed ${dark ? 'text-white/55' : 'text-muted-fg'}`}><span className="font-semibold">{ar ? 'مناسب لـ: ' : 'Best for: '}</span>{pkg.bestFor}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="font-serif text-[2.9rem] leading-[0.85]" dir="ltr">{p.value}</span>
                  {region === 'gulf' && pkg.usd ? null : <span className={`pb-0.5 text-sm ${dark ? 'text-white/50' : 'text-muted-fg'}`}>{p.unit}</span>}
                </div>
                <p className={`mt-3 text-xs ${dark ? 'text-white/50' : 'text-muted-fg'}`}>
                  {pkg.priceNote ? pkg.priceNote : (ar ? 'سعر ثابت للمشروع' : 'Fixed project price')}
                  {region === 'gulf' && !pkg.usd ? (ar ? ' · بالجنيه المصري' : ' · priced in EGP') : ''}
                </p>
                <p className={`mt-5 border-y py-3 text-xs font-semibold ${dark ? 'border-white/10 text-white/80' : 'border-border text-[#0A0A0B]'}`}>{ar ? 'التسليم: ' : 'Delivery: '}{pkg.delivery}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {pkg.items.map(item => <li key={item} className={`flex gap-2.5 text-sm leading-snug ${dark ? 'text-white/75' : 'text-[#0A0A0B]/80'}`}><Check size={15} className={`mt-0.5 shrink-0 ${dark ? 'text-[#fe8c58]' : 'text-[#1E7E48]'}`} />{item}</li>)}
                </ul>
                <a href={bookCallLink(ar, pkg.name)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${dark ? 'bg-[#fe8c58] text-[#111214]' : 'bg-[#1E7E48] text-white'}`}>
                  <MessageCircle size={16} /> {ar ? 'احجز مكالمة' : 'Book a call'}
                </a>
                {pkg.id === 'membership' ? <a href="#pricing" className={`mt-3 inline-flex items-center justify-center gap-1 text-xs font-semibold ${dark ? 'text-white/60' : 'text-muted-fg'} hover:text-accent`}>{ar ? 'تفاصيل عرض التأسيس' : 'Founding offer details'} <ArrowUpRight size={13} /></a> : null}
              </article>
            )
          })}
        </div>

        <div className="mt-12 grid gap-8 rounded-[30px] border border-border bg-[#EFECE4] p-7 sm:p-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow text-accent">{ar ? 'اختياري' : 'Optional'}</p>
            <h3 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-[1] tracking-[-0.04em]">{ar ? 'خطط شهرية، لو حابب.' : 'Monthly plans, only if you want them.'}</h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-fg">{ar ? 'كل باقة بتتسلم كاملة. الخطة الشهرية لو عايزنا نكمل متابعة وتحسين، من ٢٬٥٠٠ لـ ١٢٬٠٠٠ جنيه في الشهر.' : 'Every package is handed over in full. Add a monthly plan if you want us to keep improving it, from EGP 2,500 to 12,000 a month.'}</p>
          </div>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {monthly.map(plan => {
              const p = price(plan.egp, plan.usd)
              return (
                <div key={plan.name} className="grid gap-2 py-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-6">
                  <p className="font-display text-lg font-bold">{plan.name}</p>
                  <p className="text-sm leading-relaxed text-muted-fg">{plan.body}</p>
                  <p className="whitespace-nowrap text-sm font-semibold"><span dir="ltr">{p.value}</span>{region === 'gulf' ? '' : ` ${p.unit}`}<span className="font-normal text-muted-fg">{ar ? ' / شهرياً' : ' / month'}</span></p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 rounded-[30px] bg-[#1B3B2B] p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-[#fe8c58]">{ar ? 'مكالمة قصيرة على واتساب' : 'A short WhatsApp call'}</p>
            <h3 className="mt-3 max-w-2xl font-display text-[clamp(1.8rem,3.8vw,2.8rem)] font-bold leading-[1] tracking-[-0.04em]">{ar ? 'مش متأكد أنهي باقة تناسبك؟ نختارها سوا.' : 'Not sure which package fits? We will pick it together.'}</h3>
            <p className="mt-3 text-sm text-white/60">{ar ? 'أو ابعت على:' : 'Or message'}{ar ? <><br /><span dir="ltr" className="font-mono">{SITE.whatsappDisplay}</span></> : <> <span dir="ltr" className="font-mono">{SITE.whatsappDisplay}</span></>}</p>
          </div>
          <a href={bookCallLink(ar)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#1B3B2B] transition-transform hover:-translate-y-0.5">
            <MessageCircle size={17} /> {ar ? 'احجز مكالمة على واتساب' : 'Book a call on WhatsApp'}
          </a>
        </div>
      </div>
    </section>
  )
}
