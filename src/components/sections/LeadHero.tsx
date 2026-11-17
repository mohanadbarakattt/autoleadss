import { Check, MessageCircle } from 'lucide-react'
import { useLocale, useT } from '../../i18n/LocaleProvider'
import { trackLeadFormConversion } from '../../analytics'
import { bookCallLink } from './ServicesPricing'

function ChatMock({ ar }: { ar: boolean }) {
  const msgs = ar
    ? [
        { me: false, t: 'السلام عليكم، سعر تبييض الأسنان كام؟ وفي مواعيد بكرة؟', time: '11:48 م' },
        { me: true, t: 'أهلاً بحضرتك! السعر النهائي الدكتور بيأكده في أول كشف. بكرة متاح ٦:٠٠ أو ٨:٣٠ مساءً مع د. سارة. أحجزلك أنهي؟', time: '11:48 م' },
        { me: false, t: '٨:٣٠ لو سمحت', time: '11:49 م' },
        { me: true, t: 'تم الحجز بكرة ٨:٣٠ مساءً. هبعتلك تذكير ولوكيشن العيادة قبلها.', time: '11:49 م' },
      ]
    : [
        { me: false, t: 'Hi, how much is teeth whitening? Any slots tomorrow?', time: '11:48 PM' },
        { me: true, t: 'Hi! The doctor confirms the final plan and price at the first visit. Tomorrow we have 6:00 or 8:30 PM with Dr. Sara. Which one should I book?', time: '11:48 PM' },
        { me: false, t: '8:30 please', time: '11:49 PM' },
        { me: true, t: 'Booked for tomorrow at 8:30 PM. I will send a reminder and the clinic location before your visit.', time: '11:49 PM' },
      ]
  return (
    <div className="relative mx-auto w-full max-w-md" aria-label={ar ? 'مثال محادثة واتساب' : 'Example WhatsApp chat'}>
      <div className="overflow-hidden rounded-[30px] border border-white/12 bg-[#111214] shadow-[0_40px_120px_-50px_rgba(255,92,42,0.45)]">
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#1B3B2B] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-sm font-bold">{ar ? 'ع' : 'C'}</span>
          <div>
            <p className="text-sm font-semibold">{ar ? 'عيادة أسنان (مثال)' : 'Dental clinic (example)'}</p>
            <p className="text-[11px] text-white/55">{ar ? 'وكيل AI · متصل' : 'AI agent · online'}</p>
          </div>
        </div>
        <div className="space-y-3 bg-[#0d0e0f] px-4 py-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${m.me ? 'bg-[#1E7E48] text-white' : 'bg-white/[0.08] text-white/85'}`}>
                {m.t}
                <span className="mt-1 block text-end text-[10px] text-white/45">{m.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-5 start-4 flex items-center gap-2 rounded-2xl border border-white/12 bg-[#EFECE4] px-4 py-3 text-xs font-semibold text-[#0A0A0B] shadow-xl">
        <Check size={14} className="text-[#1E7E48]" />
        {ar ? 'عميل مؤهل · اتحجز · اتبعت للفريق' : 'Qualified · booked · sent to your team'}
      </div>
    </div>
  )
}

export default function LeadHero() {
  const { isRTL } = useLocale()
  const t = useT()
  const ar = isRTL
  const steps = ar
    ? ['رد في ثواني', 'تأهيل العميل', 'حجز الكشف أو المعاينة', 'متابعة تلقائية']
    : ['Reply in seconds', 'Qualify the lead', 'Book the visit or viewing', 'Follow up automatically']

  return (
    <>
      <section className="relative overflow-hidden bg-[#0A0A0B] text-white">
        <div aria-hidden className="absolute inset-0 grain-overlay opacity-70" />
        <div aria-hidden className="absolute -end-32 -top-48 h-[620px] w-[620px] rounded-full bg-[#ff5c2a]/20 blur-[120px]" />
        <div className="content-width relative grid items-center gap-14 pb-20 pt-28 sm:pt-32 lg:min-h-[720px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-24 lg:pt-36">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{ar ? 'أوتوليدز / القاهرة · دبي' : 'AutoLeadss / Cairo · Dubai'}</p>
            <p className="eyebrow mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {t.hero.eyebrow}
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,5.2vw,4.9rem)] font-bold leading-[0.95] tracking-[-0.055em]">
              {t.hero.titleA}
              <span className="mt-1 block font-serif font-normal italic text-[#fe8c58]">{t.hero.titleB}</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/62 sm:text-lg">{t.hero.body}</p>
            <ul className="mt-7 grid max-w-lg gap-2 sm:grid-cols-2">
              {t.hero.pills.map(pill => (
                <li key={pill} className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-3 py-2.5 text-sm font-medium text-white">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fe8c58]/15 text-[#fe8c58]"><Check size={13} strokeWidth={2.5} /></span>
                  <span>{pill}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={bookCallLink(ar)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1E7E48] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                <MessageCircle size={16} /> {ar ? 'احجز مكالمة على واتساب' : 'Book a call on WhatsApp'}
              </a>
              <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#fe8c58] px-6 text-sm font-semibold text-[#111214] transition-transform hover:-translate-y-0.5">
                {ar ? 'شوف الباقات والأسعار' : 'See packages and prices'}
              </a>
            </div>
            <p className="mt-6 text-xs text-white/45">{ar ? '+٢٠٠ عميل محتمل اتولّد عبر ٣ أسواق في الشرق الأوسط وشمال أفريقيا' : '200+ leads generated across 3 MENA markets'}</p>
          </div>
          <div className="pb-6">
            <ChatMock ar={ar} />
          </div>
        </div>
      </section>

      <section id="offer" className="scroll-mt-36 border-y border-black/10 bg-[#EFECE4]">
        <div className="content-width grid sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
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
