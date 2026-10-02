import { BarChart3, CreditCard, QrCode, Store, type LucideIcon } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'

type Step = { n: string; title: string; body: string; icon: LucideIcon }

export default function MembershipFlow() {
  const { isRTL } = useLocale()
  const copy = isRTL
    ? { eyebrow: 'المنتج', title: 'من زيارة عابرة إلى عميل شهري.', sub: 'تجربة واحدة مترابطة للعميل والكاشير وصاحب النشاط — من غير تطبيق معقد.', steps: [
        { n: '01', title: 'صفحة تليق بالبراند', body: 'العميل يفهم الباقات ويختار ويدفع من الموبايل.', icon: Store },
        { n: '02', title: 'اشتراك ودفع', body: 'كروت ومحافظ عبر حساب التاجر، مع تسجيل كاش أو إنستاباي.', icon: CreditCard },
        { n: '03', title: 'QR عند الاستخدام', body: 'الموظف يمسح الكود ويخصم زيارة مسجلة وآمنة.', icon: QrCode },
        { n: '04', title: 'أرقام واضحة', body: 'المشتركين والإيراد والاستخدام والباقات في لوحة واحدة.', icon: BarChart3 },
      ] as Step[] }
    : { eyebrow: 'The product', title: 'Turn a walk-in into monthly revenue.', sub: 'One connected experience for the customer, the counter and the owner—without a complicated app.', steps: [
        { n: '01', title: 'A storefront worth the brand', body: 'Customers understand the plans, choose and pay from their phone.', icon: Store },
        { n: '02', title: 'Subscribe and pay', body: 'Cards and wallets through the merchant, plus recorded cash or InstaPay.', icon: CreditCard },
        { n: '03', title: 'Scan at every visit', body: 'Staff scan the member QR and redeem one secure, recorded use.', icon: QrCode },
        { n: '04', title: 'See what is working', body: 'Members, revenue, usage and packages in one calm dashboard.', icon: BarChart3 },
      ] as Step[] }

  return (
    <section id="product" className="section-padding bg-[#EFECE4]">
      <div className="content-width">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div><p className="eyebrow text-accent">{copy.eyebrow}</p><h2 className="mt-3 max-w-xl font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.035em]">{copy.title}</h2></div>
          <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{copy.sub}</p>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {copy.steps.map(({ n, title, body, icon: Icon }) => (
            <article key={n} className="group rounded-2xl border border-border bg-white p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-wider text-accent">{n}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18372b] text-white transition-transform duration-300 group-hover:rotate-3"><Icon size={18} /></span></div>
              <h3 className="mt-8 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-fg">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
