import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, MessageCircle } from 'lucide-react'
import ServicesPricing from './ServicesPricing'
import LeadHero from './LeadHero'
import Niches from './Niches'
import AuditOffer from './AuditOffer'
import SectionIntro from './SectionIntro'
import { PAGE_FAQ } from '../../seo/pageFaq'
import { useLocale } from '../../i18n/LocaleProvider'
import { ON_CALL_COPY } from '../../content/onCall'
import { AUDIT_COPY, auditLink } from '../../content/audit'
import { trackLeadFormConversion } from '../../analytics'

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

function Work() {
  const { isRTL, locale, localePath } = useLocale()
  const [activeWork, setActiveWork] = useState(0)
  const items = [
    { name: 'TUT', domain: 'tutapp.co', label: isRTL ? 'منتج حي' : 'Live product', body: isRTL ? 'منتج سفر لمصر مبني على إجابات موثقة ومصادر واضحة.' : 'An Egypt travel product built around sourced, verifiable answers.', image: '/work/tut.png', href: 'https://tutapp.co', external: true, aspect: 'aspect-[2467/1297]', surface: 'bg-[#f4eddc]' },
    { name: 'Lash Cartel Cosmetics', domain: 'lashcartelcosmetics.com', label: isRTL ? 'مشروع عميل · أستراليا' : 'Client project · Australia', body: isRTL ? 'المتجر الإلكتروني الكامل لبراند رموش أسترالي بيصمم ويشحن من أستراليا. الموقع شغال على lashcartelcosmetics.com.' : 'The full online store for an Australian beauty brand that designs and ships its lashes from Australia. Live at lashcartelcosmetics.com.', built: isRTL ? ['متجر ودفع أونلاين عن طريق Stripe', 'اختبار من ٥ أسئلة يرشح الرموش المناسبة', 'شات بوت للأسئلة الشائعة', 'فورم طلبات للموزعين وماكينات البيع', 'إيميلات تلقائية للطلب والسلة المتروكة ورجوع المنتج', 'لوحة إدارة للمخزون والشحن'] : ['Shop and Stripe checkout', 'Five-question lash match quiz', 'FAQ chatbot', 'Stockist and vending machine enquiry forms', 'Automated order, abandoned cart and back-in-stock emails', 'Stock and dispatch admin dashboard'], image: '/work/lashcartel.png', href: 'https://lashcartelcosmetics.com', external: true, aspect: 'aspect-[2467/1297]', surface: 'bg-[#f5d6d2]' },
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
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-display text-3xl font-bold">{activeItem.name}</h3><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">{activeItem.body}</p>{'built' in activeItem && activeItem.built ? <div className="mt-5"><p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#fe8c58]">{isRTL ? 'اللي بنيناه' : 'What we built'}</p><ul className="mt-3 grid max-w-2xl gap-x-6 gap-y-2 sm:grid-cols-2">{activeItem.built.map(point => <li key={point} className="flex gap-2 text-sm text-white/70"><Check size={15} className="mt-0.5 shrink-0 text-[#fe8c58]" />{point}</li>)}</ul></div> : null}{activeItem.name === 'Lash Cartel Cosmetics' ? <Link to={localePath('/on-call')} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#fe8c58] hover:underline">{ON_CALL_COPY[locale].lashLink} <ArrowUpRight size={15} /></Link> : null}</div>{projectLink}</div>
      </div>
    </section>
  )
}

function OtherServices() {
  const { isRTL, localePath } = useLocale()
  const cards = isRTL
    ? [
        { href: localePath('/packages'), eyebrow: 'متجر العضويات', title: 'باقات شهرية مدفوعة مقدماً للأنشطة اللي العميل بيرجعلها.', body: 'صفحة بيع وQR للعميل ولوحة للمالك. للصالونات وغسيل السيارات والكافيهات.' },
        { href: localePath('/on-call'), eyebrow: 'أون كول', title: 'فريق رقمي شهري للمتاجر الإلكترونية.', body: 'تعديلات المتجر ورفع المنتجات والتصميمات والأتمتة الصغيرة، بباقة شهرية.' },
      ]
    : [
        { href: localePath('/packages'), eyebrow: 'Membership storefronts', title: 'Prepaid monthly plans for repeat-visit businesses.', body: 'Sales page, customer QR pass and owner dashboard for salons, car washes and cafés.' },
        { href: localePath('/on-call'), eyebrow: 'On Call', title: 'A monthly digital team for online stores.', body: 'Store edits, product uploads, designs and small automations on a monthly plan.' },
      ]

  return (
    <section id="more" className="scroll-mt-36 bg-[#EFECE4] py-16 sm:py-20">
      <div className="content-width">
        <p className="eyebrow text-accent">{isRTL ? 'كمان من أوتوليدز' : 'Also from AutoLeadss'}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {cards.map(card => (
            <Link key={card.href} to={card.href} className="group flex flex-col rounded-[24px] border border-black/10 bg-white p-6 transition-shadow hover:shadow-[0_24px_60px_-40px_rgba(0,0,0,0.45)] sm:p-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.17em] text-black/40">{card.eyebrow}</span>
              <span className="mt-3 font-display text-2xl font-bold leading-tight">{card.title}</span>
              <span className="mt-3 text-sm leading-relaxed text-muted-fg">{card.body}</span>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">{isRTL ? 'التفاصيل' : 'Learn more'} <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqAndContact() {
  const { isRTL, locale } = useLocale()
  const audit = AUDIT_COPY[locale]
  const questions = PAGE_FAQ[locale].map(item => [item.q, item.a] as const)

  return (
    <section id="faq" className="scroll-mt-36 bg-[#FAFAF7] py-20 sm:py-28">
      <div className="content-width grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-accent">{isRTL ? 'قبل ما نبدأ' : 'Before we start'}</p>
          <h2 className="mt-3 font-display text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{isRTL ? 'واضح من البداية.' : 'Clear from day one.'}</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-fg">{isRTL ? 'نبيع مشروع محدد، بسعر واضح، وتسليم واضح. أول مكالمة هدفها نعرف بييجيلك كام رسالة، منين، وإيه اللي بيضيع منها.' : 'A defined project, a visible price and a clear handoff. The first call maps how many messages you get, where they come from and where they are lost.'}</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {questions.map(([question, answer], index) => <details key={question} className="group py-1" open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 font-display text-lg font-bold"><span>{question}</span><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-accent transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-6 pe-12 text-sm leading-relaxed text-muted-fg">{answer}</p></details>)}
        </div>
      </div>

      <div className="content-width mt-20">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0A0A0B] px-7 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="absolute -end-24 -top-32 h-80 w-80 rounded-full bg-[#ff5c2a]/25 blur-[90px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="eyebrow text-[#fe8c58]">{audit.eyebrow}</p><h2 className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5.5vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.05em]">{isRTL ? 'كام رسالة جاتلك امبارح ومحدش رد عليها؟' : 'How many messages waited for a reply yesterday?'}</h2><p className="mt-4 max-w-xl text-sm text-white/55">{isRTL ? 'هنقيسها لك ببلاش، وتعرف الرقم الحقيقي قبل ما تقرر أي حاجة.' : 'We will measure it for free, so you see the real number before you decide anything.'}</p></div>
            <div className="flex flex-col items-center gap-3"><a href={auditLink(locale)} target="_blank" rel="noopener noreferrer" onClick={trackLeadFormConversion} data-track-location="final_cta" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#1E7E48] px-7 text-sm font-semibold text-white"><MessageCircle size={16} /> {audit.cta}</a><span className="text-xs text-white/45">{audit.note}</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePageSystem() {
  return (
    <>
      <LeadHero />
      <Niches />
      <AuditOffer />
      <ServicesPricing />
      <TrustStrip />
      <Work />
      <FaqAndContact />
      <OtherServices />
    </>
  )
}
