import { Helmet } from 'react-helmet-async'
import { ArrowUpRight, CheckCircle2, Coffee, Dog, Scissors, Shirt, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ActionDock from '../components/ActionDock'
import { useLocale } from '../i18n/LocaleProvider'
import { waLink } from '../site'

type Template = { name: string; category: [string, string]; promise: [string, string]; plan: [string, string]; accent: string; icon: LucideIcon }

const TEMPLATES: Template[] = [
  { name: 'Line & Lather', category: ['Barber', 'حلاقة'], promise: ['Stay sharp all month.', 'حلاقتك محسوبة طول الشهر.'], plan: ['2 cuts + beard care', 'حلاقتان + عناية بالدقن'], accent: '#F2C078', icon: Scissors },
  { name: 'Clean Mile', category: ['Car wash', 'غسيل سيارات'], promise: ['A clean car, already covered.', 'عربيتك نضيفة ومدفوعة مقدماً.'], plan: ['4 off-peak washes', '٤ غسلات في الأوقات الهادئة'], accent: '#67C7ED', icon: Waves },
  { name: 'Fold House', category: ['Laundry', 'مغسلة'], promise: ['The weekly load, handled.', 'غسيل الأسبوع متظبط.'], plan: ['20 kg + 2 pickups', '٢٠ كجم + استلام مرتين'], accent: '#A8D7C5', icon: Shirt },
  { name: 'Good Dog Club', category: ['Pet care', 'رعاية حيوانات'], promise: ['Food and care on schedule.', 'الأكل والعناية في ميعادهم.'], plan: ['Dry + fresh + grooming', 'جاف + فريش + جروومينج'], accent: '#F2A07D', icon: Dog },
  { name: 'Daily Cup', category: ['Café', 'كافيه'], promise: ['Your regular, without the queue.', 'قهوتك اليومية من غير انتظار.'], plan: ['20 drinks · one daily', '٢٠ مشروباً · واحد يومياً'], accent: '#D6B58C', icon: Coffee },
]

function TemplateCard({ item, ar }: { item: Template; ar: boolean }) {
  const Icon = item.icon
  return <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
    <div className="relative aspect-[16/10] overflow-hidden p-6" style={{ background: `linear-gradient(145deg, ${item.accent} 0%, #11110f 72%)` }}>
      <div className="absolute -end-16 -top-20 h-52 w-52 rounded-full border border-white/20" />
      <div className="relative flex h-full flex-col justify-between rounded-[22px] border border-white/16 bg-black/35 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between"><span className="font-display text-lg font-bold">{item.name}</span><Icon size={18}/></div>
        <div><p className="text-[10px] uppercase tracking-[.16em] text-white/45">{item.category[ar ? 1 : 0]} · Membership</p><h3 className="mt-2 max-w-xs font-display text-3xl font-bold leading-[.95]">{item.promise[ar ? 1 : 0]}</h3><p className="mt-4 w-fit rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-black">{item.plan[ar ? 1 : 0]}</p></div>
      </div>
    </div>
    <div className="flex items-center justify-between p-5"><div><p className="text-sm font-semibold">{item.category[ar ? 1 : 0]} {ar ? 'قالب' : 'template'}</p><p className="mt-1 text-xs text-white/38">{ar ? 'هوية ومحتوى قابلان للتخصيص' : 'Customisable identity and content'}</p></div><ArrowUpRight size={17} className="text-white/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"/></div>
  </article>
}

export default function WorkIndex() {
  const { locale, localePath } = useLocale()
  const ar = locale === 'ar'
  const copy = ar ? {
    title: 'شغل حقيقي. وقوالب تبيع الفكرة.', body: 'نعرض المشاريع الحية باسمها، ونفصلها بوضوح عن قوالب العضويات التجريبية. كل قالب قابل للتخصيص لهوية النشاط ومحتواه.', work: 'مشاريع مختارة', templates: 'قوالب عضويات', templateBody: 'أمثلة وهمية توضح مستوى التصميم والبنية—وليست مواقع رسمية لأي نشاط حقيقي.', proof: 'كل قالب يثبت الرحلة كاملة', points: ['صفحة بيع ثنائية اللغة', 'مدد ١ و٣ و٦ و١٢ شهراً', 'دفع، بطاقة QR، استخدام ولوحة مالك'], cta: 'شوف النظام وهو يعمل', talk: 'ابدأ مشروعك',
  } : {
    title: 'Real work. Templates that sell the idea.', body: 'Live projects are named honestly and kept separate from fictional membership templates. Every template is adapted to the merchant’s identity and content.', work: 'Selected work', templates: 'Membership templates', templateBody: 'Fictional examples that demonstrate the design and system standard—not official sites for real businesses.', proof: 'Every template proves the full journey', points: ['A bilingual sales storefront', '1, 3, 6 and 12-month terms', 'Payment, QR pass, redemption and owner dashboard'], cta: 'Watch the system work', talk: 'Start your project',
  }
  const projects = [
    { name: 'TUT', label: ar ? 'منتج حي' : 'Live product', image: '/work/tut.png', href: 'https://tutapp.co' },
    { name: 'Lash Cartel', label: ar ? 'ديمو عميل' : 'Client demo', image: `/demos/lashes/${ar ? 'ar' : 'en'}-hero.png`, href: localePath('/demo/lashes'), internal: true },
    { name: 'MBAI Group', label: ar ? 'موقع المجموعة' : 'Group website', image: '/work/mbai.png', href: 'https://mbai-group.com' },
  ]
  return <div className="min-h-screen bg-[#F4F1E9] text-[#11110F]">
    <Helmet><title>{ar ? 'أعمال وقوالب أوتوليدز' : 'AutoLeadss work and membership templates'}</title><meta name="description" content={copy.body}/></Helmet><Navigation/>
    <main>
      <section className="bg-[#0A0A0B] px-5 pb-24 pt-40 text-white md:px-8 md:pb-32"><div className="mx-auto max-w-[1200px]"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#FE8C58]">AutoLeadss · Work</p><h1 className="mt-6 max-w-5xl font-display text-[clamp(3.4rem,8vw,7rem)] font-bold leading-[.9] tracking-[-.07em]">{copy.title}</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/58">{copy.body}</p></div></section>
      <section className="px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-[1200px]"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#1E7E48]">01</p><h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{copy.work}</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{projects.map(project => { const content = <><div className="overflow-hidden border-b border-black/10 bg-white"><img src={project.image} alt={`${project.name} website`} className="aspect-[16/10] w-full object-contain object-top transition-transform duration-500 group-hover:scale-[1.015]"/></div><div className="flex items-center justify-between p-5"><div><p className="font-mono text-[9px] uppercase tracking-[.15em] text-[#1E7E48]">{project.label}</p><h3 className="mt-2 font-display text-2xl font-bold">{project.name}</h3></div><ArrowUpRight size={18}/></div></>; return project.internal ? <Link key={project.name} to={project.href} className="group overflow-hidden rounded-[26px] border border-black/10 bg-white">{content}</Link> : <a key={project.name} href={project.href} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[26px] border border-black/10 bg-white">{content}</a> })}</div></div></section>
      <section className="bg-[#0A0A0B] px-5 py-20 text-white md:px-8 md:py-28"><div className="mx-auto max-w-[1200px]"><div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#FE8C58]">02</p><h2 className="mt-3 font-display text-5xl font-bold tracking-[-.05em] md:text-7xl">{copy.templates}</h2></div><p className="text-sm leading-7 text-white/50">{copy.templateBody}</p></div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{TEMPLATES.map(item => <TemplateCard key={item.name} item={item} ar={ar}/>)}</div><div className="mt-14 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-2"><h3 className="font-display text-4xl font-bold">{copy.proof}</h3><div><ul className="space-y-3">{copy.points.map(point => <li key={point} className="flex gap-3 text-sm text-white/65"><CheckCircle2 size={17} className="shrink-0 text-[#FE8C58]"/>{point}</li>)}</ul><div className="mt-7 flex flex-wrap gap-3"><Link to={localePath('/demo/membership-flow')} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">{copy.cta}</Link><a href={waLink(ar ? 'أهلاً أوتوليدز — عايز أبدأ نظام عضويات لنشاطي.' : 'Hi AutoLeadss — I want to start a membership system for my business.')} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold">{copy.talk}</a></div></div></div></div></section>
    </main><Footer/><ActionDock/>
  </div>
}
