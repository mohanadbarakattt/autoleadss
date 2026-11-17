import { Building2, Check, MessageCircle, Sparkles, Stethoscope } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'
import { trackLeadFormConversion } from '../../analytics'
import { waLink } from '../../site'

const nicheLink = (ar: boolean, niche: string) =>
  waLink(ar ? `أهلاً أوتوليدز، عندي نشاط في ${niche} وعايز أحجز مكالمة عن وكيل واتساب.` : `Hi AutoLeadss, I run a business in ${niche.toLowerCase()} and I'd like to book a call about a WhatsApp lead agent.`)

type Niche = {
  id: string
  icon: LucideIcon
  name: string
  where: string
  pain: string
  build: string[]
  qualified: string
  pkg: string
}

export default function Niches() {
  const { isRTL } = useLocale()
  const ar = isRTL

  const niches: Niche[] = ar
    ? [
        {
          id: 'clinics', icon: Stethoscope, name: 'العيادات', where: 'أسنان، جلدية وليزر، تجميل · مصر والسعودية والإمارات',
          pain: 'المريض بيبعت بالليل يسأل عن السعر والميعاد، محدش بيرد غير الصبح، فيحجز في عيادة تانية.',
          build: ['رد فوري على السعر والعنوان والمواعيد', 'حجز الكشف وتذكير قبل الميعاد', 'تحويل أي سؤال طبي للعيادة'],
          qualified: 'مريض في منطقتك، سأل عن خدمة بتقدمها، وحجز ميعاد أو طلب مكالمة.',
          pkg: 'Growth',
        },
        {
          id: 'real-estate', icon: Building2, name: 'العقارات', where: 'وسطاء ومطورين · القاهرة ودبي والرياض',
          pain: 'ليدز الإعلانات بتوصل بالعشرات، والسيلز بيرد بعد ساعات، وساعتها العميل ممكن يكون بيكلم شركة تانية.',
          build: ['رد في ثواني على ليدز الإعلانات والبورتالات', 'أسئلة الميزانية والمنطقة والتوقيت', 'حجز معاينة وتسليم الليد للسيلز بملخص'],
          qualified: 'ميزانية في رينج مشاريعك، منطقة بتبيع فيها، ونية شراء أو إيجار خلال ٦ شهور.',
          pkg: 'Growth / Scale',
        },
        {
          id: 'beauty', icon: Sparkles, name: 'التجميل والصالونات', where: 'صالونات، رموش وحواجب، سبا · مصر والخليج',
          pain: 'الحجز كله رسايل إنستجرام وواتساب، والعميلة اللي بترجع كل شهر مالهاش باقة تدفعها مقدماً.',
          build: ['حجز من إنستجرام وواتساب في مكان واحد', 'متابعة العملاء اللي ماحجزوش', 'باقات شهرية بـ QR مع متجر العضويات'],
          qualified: 'عميلة في نطاق الخدمة، طلبت خدمة معينة، وحجزت أو اشترت باقة.',
          pkg: 'Launch / Membership',
        },
      ]
    : [
        {
          id: 'clinics', icon: Stethoscope, name: 'Clinics', where: 'Dental, derma and laser, cosmetic · Egypt, KSA, UAE',
          pain: 'Patients message at night asking for prices and slots. Nobody replies until morning, so they book somewhere else.',
          build: ['Instant replies on price, location and slots', 'Booking plus reminders before the visit', 'Medical questions handed to your staff'],
          qualified: 'A patient in your area who asked about a service you offer and booked a slot or asked for a call.',
          pkg: 'Growth',
        },
        {
          id: 'real-estate', icon: Building2, name: 'Real estate', where: 'Brokers and developers · Cairo, Dubai, Riyadh',
          pain: 'Ad leads arrive by the dozen, sales replies hours later, and by then the buyer may already be talking to another agency.',
          build: ['Replies in seconds to ad and portal leads', 'Asks budget, area, unit type and timeline', 'Books the viewing and hands over a summary'],
          qualified: 'Budget inside your project range, an area you sell in, and intent to buy or rent within 6 months.',
          pkg: 'Growth / Scale',
        },
        {
          id: 'beauty', icon: Sparkles, name: 'Beauty and salons', where: 'Salons, lash and brow studios, spas · Egypt and the Gulf',
          pain: 'Every booking is an Instagram or WhatsApp thread, and the client who comes back every month has no plan to prepay.',
          build: ['Instagram and WhatsApp bookings in one place', 'Follow-up for people who asked but did not book', 'Monthly QR plans with the membership storefront'],
          qualified: 'A client in your service area who asked for a specific service and booked or bought a plan.',
          pkg: 'Launch / Membership',
        },
      ]

  return (
    <section id="who-we-help" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
      <div className="content-width">
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="eyebrow text-accent">{ar ? 'بنشتغل مع مين' : 'Who we build for'}</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[#0A0A0B]">{ar ? 'ثلاث أنشطة. مشكلة واحدة: رسايل من غير رد.' : 'Three industries. One problem: messages that wait.'}</h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-fg lg:justify-self-end">{ar ? 'الأنشطة دي بتدفع على الإعلانات وعملاءها بيسألوا على واتساب وإنستجرام. كل رسالة من غير رد سريع فلوس إعلان راحت. إحنا بنقفل الفجوة دي.' : 'These businesses pay for ads and their customers ask on WhatsApp and Instagram. Every message that waits is ad money lost. We close that gap.'}</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {niches.map(n => (
            <article key={n.id} id={n.id} className="flex scroll-mt-36 flex-col rounded-[26px] border border-border bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E7E48]/10 text-[#1E7E48]"><n.icon size={20} /></span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent" dir="ltr">{n.pkg}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">{n.name}</h3>
              <p className="mt-1 text-xs text-muted-fg">{n.where}</p>
              <p className="mt-5 rounded-2xl bg-[#EFECE4] p-4 text-sm leading-relaxed text-[#0A0A0B]/80">{n.pain}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {n.build.map(b => <li key={b} className="flex gap-2.5 text-sm leading-snug text-[#0A0A0B]/80"><Check size={15} className="mt-0.5 shrink-0 text-[#1E7E48]" />{b}</li>)}
              </ul>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{ar ? 'العميل المؤهل عندنا' : 'What a qualified lead means'}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-fg">{n.qualified}</p>
              </div>
              <a href={nicheLink(ar, n.name)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1E7E48] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                <MessageCircle size={16} /> {ar ? 'احجز مكالمة' : 'Book a call'}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
