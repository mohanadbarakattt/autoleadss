import { Check, ArrowUpRight } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import { waLink } from '../site'

type Tier = {
  name: string
  fit: string
  price: string
  timing: string
  items: string[]
  featured?: boolean
}

export default function ServiceTiers() {
  const { isRTL } = useLocale()
  const tiers: Tier[] = isRTL
    ? [
        {
          name: 'Founding',
          fit: 'عرض أول خمس أنشطة مقابل السماح لنا بعرض النتيجة كشهادة حالة.',
          price: '٢٠٬٠٠٠ جنيه لأول ٥ عملاء',
          timing: '١٠ آلاف للبدء · ١٠ آلاف عند التسليم · أسبوعان',
          items: ['صفحة بيع عربي وإنجليزي', '٣ باقات ومدة ١/٣/٦/١٢ شهر', 'بطاقة QR وديمو تشغيل للموظفين', 'لوحة مالك أساسية', 'ربط دومين وتسليم وتدريب'],
        },
        {
          name: 'Standard',
          fit: 'النظام الأساسي بعد اكتمال أول خمس مشاريع.',
          price: 'يبدأ من ٣٥٬٠٠٠ جنيه',
          timing: '٥٠٪ للبدء · ٥٠٪ عند التسليم المقبول',
          featured: true,
          items: ['واجهة مصممة لهوية النشاط', 'صفحة عربي وإنجليزي و٣ باقات', 'QR وتدفق موظف ولوحة مالك', 'ربط حساب الدفع المعتمد', 'PWA وتدريب وتسليم الكود'],
        },
        {
          name: 'Custom',
          fit: 'لفروع متعددة أو تسجيل دخول أو قواعد تشغيل خاصة.',
          price: 'عرض مخصص',
          timing: 'خطة مراحل واضحة قبل التعاقد',
          items: ['فروع وموظفون متعددون', 'قواعد توصيل أو رصيد أو استخدام متقدمة', 'تكاملات مخصصة مع أدوات التشغيل', 'ترحيل بيانات أو لوحة تقارير خاصة', 'اختبارات وتشغيل مرحلي'],
        },
      ]
    : [
        {
          name: 'Founding',
          fit: 'For the first five businesses, in exchange for permission to document the result as a case study.',
          price: '20,000 EGP for the first 5 clients',
          timing: '10,000 to start · 10,000 at handoff · two weeks',
          items: ['Custom Arabic + English storefront', '3 packages with 1/3/6/12-month terms', 'Customer QR pass and staff redemption', 'Focused owner dashboard', 'Domain connection, training and handoff'],
        },
        {
          name: 'Standard',
          fit: 'The core system after the first five projects are complete.',
          price: 'Starts at 35,000 EGP',
          timing: '50% to start · 50% at accepted handoff',
          featured: true,
          items: ['A storefront designed around your identity', 'Arabic, English and three plans', 'QR, staff flow and owner dashboard', 'Approved merchant-payment connection', 'PWA, training and source handoff'],
        },
        {
          name: 'Custom',
          fit: 'For multiple branches, authentication or specialised operating rules.',
          price: 'Custom proposal',
          timing: 'Phased plan agreed before contract',
          items: ['Multiple branches and staff roles', 'Advanced delivery, allowance or redemption rules', 'Custom operations integrations', 'Data migration or tailored reporting', 'Staged rollout and acceptance testing'],
        },
      ]

  return (
    <section aria-labelledby="service-levels-title" className="mt-12">
      <div className="max-w-3xl">
        <p className="eyebrow text-accent">{isRTL ? 'مستويات الخدمة' : 'Service levels'}</p>
        <h2 id="service-levels-title" className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.035em]">
          {isRTL ? 'سعر البداية واضح. والنطاق لا يختبئ.' : 'A clear entry price. A visible scope.'}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-fg">{isRTL ? 'تدفع مرة مقابل التصميم والبناء والتسليم. مفيش اشتراك شهري إجباري لأوتوليدز.' : 'You pay once for design, build and handoff. There is no mandatory monthly AutoLeadss subscription.'}</p>
      </div>

      <div className="mt-9 grid gap-5 lg:grid-cols-3">
        {tiers.map(tier => (
          <article key={tier.name} className={`flex min-h-full flex-col rounded-3xl border p-6 sm:p-7 ${tier.featured ? 'border-[#1b3b2b] bg-[#1b3b2b] text-white shadow-[0_28px_70px_-42px_rgba(27,59,43,0.8)]' : 'border-border bg-white'}`}>
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-bold">{tier.name}</h3>
                {tier.featured && <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider">{isRTL ? 'الأكثر اكتمالاً' : 'Operational'}</span>}
              </div>
              <p className={`mt-3 min-h-12 text-sm leading-relaxed ${tier.featured ? 'text-white/68' : 'text-muted-fg'}`}>{tier.fit}</p>
              <p className={`mt-7 font-display text-2xl font-bold ${tier.featured ? 'text-[#fe8c58]' : 'text-accent'}`}>{tier.price}</p>
              <p className={`mt-1 text-xs ${tier.featured ? 'text-white/50' : 'text-muted-fg'}`}>{tier.timing}</p>
            </div>
            <ul className={`mt-7 flex-1 space-y-3 border-t pt-6 text-sm ${tier.featured ? 'border-white/12 text-white/82' : 'border-border text-muted-fg'}`}>
              {tier.items.map(item => <li key={item} className="flex gap-2.5"><Check size={16} className={`mt-0.5 shrink-0 ${tier.featured ? 'text-[#fe8c58]' : 'text-[#1E7E48]'}`} /><span>{item}</span></li>)}
            </ul>
            <a href={waLink(isRTL ? `أهلاً أوتوليدز — مهتم بمستوى ${tier.name} لنظام اشتراكات لنشاطي. عايز أعرف الخطوة الجاية.` : `Hi AutoLeadss — I’m interested in the ${tier.name} membership-system package for my business. What is the next step?`)} target="_blank" rel="noopener noreferrer" className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium ${tier.featured ? 'bg-white text-[#121110]' : 'bg-[#121110] text-white'}`}>
              {isRTL ? 'كلّمنا مباشرة' : 'Talk to us directly'} <ArrowUpRight size={16} className={isRTL ? 'rotate-[-90deg]' : ''} />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-[#EFECE4] p-6 md:grid-cols-2">
        <div><p className="font-display text-lg font-bold">{isRTL ? 'مصاريف خارج عرض التأسيس' : 'Costs outside the setup fee'}</p><p className="mt-2 text-sm leading-relaxed text-muted-fg">{isRTL ? 'الدومين والاستضافة ورسائل البريد أو SMS ورسوم بوابة الدفع وأي اشتراك لطرف ثالث تُدفع لمقدم الخدمة مباشرة.' : 'Domain, hosting, email or SMS usage, payment fees and other third-party subscriptions are paid directly to their providers.'}</p></div>
        <div><p className="font-display text-lg font-bold">{isRTL ? 'رعاية شهرية اختيارية' : 'Optional monthly care'}</p><p className="mt-2 text-sm leading-relaxed text-muted-fg">{isRTL ? 'تحديث محتوى وتحليلات ودعم حملات وصيانة بعد الضمان بعقد منفصل. طلبات التغيير خارج النطاق تتسعر قبل التنفيذ.' : 'Content updates, analytics, campaign support and post-warranty maintenance are available separately. Out-of-scope changes are quoted before work begins.'}</p></div>
      </div>
    </section>
  )
}
