import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Bell, CheckCircle2, ChevronDown, CreditCard, LayoutDashboard, Menu, MoreHorizontal, Package, QrCode, Search, Settings, TrendingUp, Users, X } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'
import { pilotBySlug } from '../pilots/data'
import NotFound from './NotFound'

const PETSIKA_LOGO = 'https://petsika.com/cdn/shop/files/Asset_76.svg?v=1785428145&width=300'

const metricsByPilot: Record<string, { revenue: number; members: number; due: number; renewal: number }> = {
  'jo-x': { revenue: 48750, members: 41, due: 12, renewal: 88 },
  '212-car-wash': { revenue: 35600, members: 37, due: 16, renewal: 84 },
  'wash-and-wash': { revenue: 62250, members: 53, due: 9, renewal: 90 },
  petsika: { revenue: 84620, members: 38, due: 7, renewal: 92 },
  '741-cafe': { revenue: 57900, members: 64, due: 21, renewal: 86 },
}

const members = [
  { name: 'Luna’s Home', initials: 'LH', plan: 'Balanced Medium', status: 'Active', value: 2690, next: '30 Sep', action: 'Delivery scheduled' },
  { name: 'Rocky · Ahmed M.', initials: 'RA', plan: 'Rita Fresh 30', status: 'Active', value: 1390, next: '01 Oct', action: 'Basket renewed' },
  { name: 'Coco · Salma T.', initials: 'CS', plan: 'Complete Medium', status: 'Due', value: 3390, next: 'Today', action: 'Payment retry' },
  { name: 'Milo · Karim H.', initials: 'MK', plan: 'Balanced Medium', status: 'Active', value: 2690, next: '04 Oct', action: 'Plan upgraded' },
  { name: 'Bella · Nour A.', initials: 'BN', plan: 'Rita Fresh 30', status: 'Paused', value: 1390, next: '15 Oct', action: 'Paused by member' },
]

const chart = [42, 48, 45, 57, 61, 68, 73, 85, 82, 91, 96, 100]

function money(value: number) { return `${value.toLocaleString('en-US')} EGP` }

export default function PilotAdmin() {
  const { slug } = useParams()
  const { locale, switchLocale } = useLocale()
  const pilot = pilotBySlug(slug)
  const [nav, setNav] = useState('overview')
  const [scanner, setScanner] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [range, setRange] = useState('30d')
  const isAr = locale === 'ar'
  if (!pilot) return <NotFound />
  const isPetsika = pilot.slug === 'petsika'
  const logo = isPetsika ? PETSIKA_LOGO : pilot.logoImage
  const metrics = metricsByPilot[pilot.slug]
  const operationalWord = isPetsika ? (isAr ? 'التوصيلات القادمة' : 'Deliveries due') : (isAr ? 'زيارات اليوم' : 'Visits today')
  const adminMembers = isPetsika ? members : members.map((m, i) => ({ ...m, name: ['Omar H.','Ahmed M.','Mariam A.','Nour E.','Karim S.'][i], plan: pilot.plans[i % pilot.plans.length].name[locale], action: ['Visit redeemed','Membership renewed','Plan upgraded','QR pass opened','Paused by member'][i] }))
  const performancePlans = isPetsika ? [
    { name: { en: 'Rita Fresh 30', ar: 'ريتا فريش ٣٠' }, price: 1390 },
    { name: { en: 'Balanced Medium', ar: 'متوازن للكلاب المتوسطة' }, price: 2690 },
    { name: { en: 'Complete Medium', ar: 'متكامل للكلاب المتوسطة' }, price: 3390 },
  ] : pilot.plans
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, en: 'Overview', ar: 'نظرة عامة' },
    { id: 'members', icon: Users, en: 'Members', ar: 'الأعضاء', count: metrics.members },
    { id: 'plans', icon: CreditCard, en: 'Plans', ar: 'الباقات' },
    { id: 'activity', icon: BarChart3, en: isPetsika ? 'Deliveries' : 'Redemptions', ar: isPetsika ? 'التوصيلات' : 'الاستخدامات', count: metrics.due },
    { id: 'settings', icon: Settings, en: 'Settings', ar: 'الإعدادات' },
  ]

  return <div className="min-h-screen bg-[#F4F5F2] text-[#191A18]">
    <Helmet defer={false}><title>{pilot.name} Admin · Private demo</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 start-0 z-50 flex w-[248px] flex-col border-e border-black/7 bg-white p-4 transition-transform lg:translate-x-0 ${mobileNav ? 'translate-x-0' : isAr ? 'translate-x-full' : '-translate-x-full'} rtl:lg:translate-x-0`}>
        <div className="flex h-14 items-center justify-between px-2"><Link to={`/${locale}/pilot/${pilot.slug}`} className="flex items-center gap-3">{logo ? <img src={logo} alt={pilot.name} className="h-8 w-auto max-w-[120px] object-contain" /> : <strong className="text-lg tracking-[-.05em]">{pilot.name}</strong>}</Link><button onClick={() => setMobileNav(false)} className="rounded-lg p-2 lg:hidden"><X size={18}/></button></div>
        <div className="mt-5 rounded-2xl bg-[#F4F5F2] p-3"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-black/35">{isAr ? 'مساحة العمل' : 'Workspace'}</p><div className="mt-2 flex items-center justify-between"><div><p className="text-sm font-semibold">{pilot.name}</p><p className="mt-0.5 text-[10px] text-black/40">{isAr ? 'حساب تجريبي' : 'Demo account'}</p></div><ChevronDown size={15} className="text-black/35"/></div></div>
        <nav className="mt-5 space-y-1">{navItems.map(({id,icon:Icon,en,ar,count}) => <button key={id} onClick={() => { setNav(id); setMobileNav(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${nav === id ? 'bg-[#191A18] text-white' : 'text-black/50 hover:bg-black/[.035] hover:text-black'}`}><Icon size={17}/><span>{isAr ? ar : en}</span>{count !== undefined && <span className={`ms-auto rounded-full px-2 py-0.5 text-[10px] ${nav === id ? 'bg-white/12' : 'bg-black/5'}`}>{count}</span>}</button>)}</nav>
        <div className="mt-auto rounded-2xl border border-black/7 p-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDF4CA] text-xs font-bold">MB</div><div className="min-w-0"><p className="truncate text-xs font-semibold">Store owner</p><p className="truncate text-[10px] text-black/40">owner@{pilot.slug}.demo</p></div><MoreHorizontal size={16} className="ms-auto text-black/35"/></div></div>
      </aside>

      <div className="min-w-0 flex-1 lg:ms-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-black/6 bg-[#F4F5F2]/90 px-4 backdrop-blur-xl md:px-7"><div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-xl border border-black/7 bg-white p-2.5 lg:hidden"><Menu size={18}/></button><div><p className="text-xs text-black/38">{isAr ? 'لوحة تحكم' : 'Admin panel'}</p><h1 className="text-lg font-semibold tracking-[-.025em]">{isAr ? 'صباح الخير 👋' : 'Good morning 👋'}</h1></div></div><div className="flex items-center gap-2"><div className="relative hidden md:block"><Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-black/30"/><input className="w-52 rounded-xl border border-black/7 bg-white py-2.5 pe-3 ps-9 text-xs outline-none focus:border-black/20" placeholder={isAr ? 'ابحث عن عضو...' : 'Search members...'} /></div><button onClick={() => switchLocale(isAr ? 'en' : 'ar')} className="rounded-xl border border-black/7 bg-white px-3 py-2.5 text-xs font-bold">{isAr ? 'EN' : 'AR'}</button><button className="relative rounded-xl border border-black/7 bg-white p-2.5"><Bell size={17}/><span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FF6B4A]"/></button><button onClick={() => { setScanner(true); setScanDone(false) }} className="hidden items-center gap-2 rounded-xl bg-[#191A18] px-4 py-2.5 text-xs font-bold text-white sm:flex"><QrCode size={16}/>{isAr ? 'مسح QR' : 'Scan QR'}</button></div></header>

        <main className="mx-auto max-w-[1440px] p-4 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.13em] text-black/35">{isAr ? 'الأداء' : 'Performance'}</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.04em]">{isAr ? 'ملخص النشاط' : 'Business overview'}</h2></div><div className="flex rounded-xl border border-black/7 bg-white p-1">{[['7d','7D'],['30d','30D'],['90d','90D']].map(([id,label])=><button key={id} onClick={()=>setRange(id)} className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${range===id?'bg-[#191A18] text-white':'text-black/35'}`}>{label}</button>)}</div></div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            { label: isAr ? 'الإيراد الشهري المتكرر' : 'Monthly recurring revenue', value: money(metrics.revenue), change: '+12.4%', icon: CreditCard, color: '#DDF4CA' },
            { label: isAr ? 'الأعضاء النشطون' : 'Active members', value: metrics.members.toString(), change: '+5', icon: Users, color: '#E4E8FF' },
            { label: operationalWord, value: metrics.due.toString(), change: isPetsika ? (isAr ? 'هذا الأسبوع' : 'this week') : (isAr ? 'اليوم' : 'today'), icon: isPetsika ? Package : QrCode, color: '#FFE7D8' },
            { label: isAr ? 'معدل التجديد' : 'Renewal rate', value: `${metrics.renewal}%`, change: '+2.1%', icon: TrendingUp, color: '#FFF2C7' },
          ].map(({label,value,change,icon:Icon,color})=><article key={label} className="rounded-2xl border border-black/6 bg-white p-5"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{background:color}}><Icon size={18}/></span><span className="flex items-center gap-1 rounded-full bg-[#E7F5E8] px-2 py-1 text-[10px] font-bold text-[#287A35]">{change.startsWith('+') && <ArrowUpRight size={11}/>} {change}</span></div><p className="mt-5 text-[11px] font-medium text-black/42">{label}</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em]">{value}</p></article>)}</section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_.85fr]">
            <article className="rounded-2xl border border-black/6 bg-white p-5 md:p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{isAr ? 'نمو الإيرادات' : 'Revenue growth'}</p><p className="mt-1 text-[11px] text-black/38">{isAr ? 'الإيراد المتكرر خلال ١٢ شهراً' : 'Recurring revenue over 12 months'}</p></div><span className="rounded-lg bg-[#E7F5E8] px-2.5 py-1.5 text-[10px] font-bold text-[#287A35]">+36.8%</span></div><div className="mt-8 flex h-48 items-end gap-2 border-b border-black/8">{chart.map((height,i)=><div key={i} className="group relative h-full flex-1"><div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#C8EFB0] transition-colors group-hover:bg-[#8EDB68]" style={{height:`${height}%`}}/><span className="absolute left-1/2 hidden -translate-x-1/2 rounded bg-black px-1.5 py-1 text-[8px] text-white group-hover:block" style={{bottom:`calc(${height}% + 6px)`}}>{money(28_000+i*4_900)}</span></div>)}</div><div className="mt-3 flex justify-between text-[9px] font-medium uppercase text-black/28"><span>Oct</span><span>Jan</span><span>Apr</span><span>Jul</span><span>Sep</span></div></article>

            <article className="rounded-2xl border border-black/6 bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{isAr ? 'أداء الباقات' : 'Plan performance'}</p><p className="mt-1 text-[11px] text-black/38">{isAr ? 'الأعضاء حسب الباقة' : 'Members by package'}</p></div><button className="rounded-lg p-2 text-black/30 hover:bg-black/5"><MoreHorizontal size={17}/></button></div><div className="mt-6 space-y-5">{performancePlans.map((plan,i)=>{const values=[46,34,20]; return <div key={plan.name.en}><div className="flex items-center justify-between text-xs"><span className="font-semibold">{plan.name[locale]}</span><span className="text-black/38">{values[i]}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full" style={{width:`${values[i]}%`,background:i===0?'#8EDB68':i===1?'#A9B6FF':'#FFB58E'}}/></div><p className="mt-1.5 text-[10px] text-black/35">{Math.round(metrics.members*values[i]/100)} {isAr?'عضو':'members'} · {money(plan.price)}</p></div>})}</div></article>
          </section>

          <section className="mt-4 overflow-hidden rounded-2xl border border-black/6 bg-white"><div className="flex flex-col justify-between gap-3 border-b border-black/6 p-5 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">{isAr ? 'نشاط الأعضاء' : 'Member activity'}</p><p className="mt-1 text-[11px] text-black/38">{isAr ? 'آخر التجديدات والتحديثات' : 'Latest renewals and account updates'}</p></div><button onClick={()=>setNav('members')} className="flex items-center gap-1.5 text-xs font-semibold text-black/50">{isAr?'عرض الكل':'View all'}{isAr?<ArrowLeft size={14}/>:<ArrowRight size={14}/>}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-start"><thead><tr className="border-b border-black/5 text-[9px] uppercase tracking-[.11em] text-black/30"><th className="px-5 py-3 text-start font-semibold">{isAr?'العضو':'Member'}</th><th className="px-4 py-3 text-start font-semibold">{isAr?'الباقة':'Plan'}</th><th className="px-4 py-3 text-start font-semibold">{isAr?'الحالة':'Status'}</th><th className="px-4 py-3 text-start font-semibold">{isAr?'القيمة':'Value'}</th><th className="px-4 py-3 text-start font-semibold">{isAr?'التالي':'Next'}</th><th className="px-4 py-3 text-start font-semibold">{isAr?'آخر تحديث':'Latest activity'}</th></tr></thead><tbody>{adminMembers.map((member)=><tr key={member.name} className="border-b border-black/[.04] last:border-0 hover:bg-black/[.015]"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF0EB] text-[10px] font-bold">{member.initials}</span><span className="text-xs font-semibold">{member.name}</span></div></td><td className="px-4 py-3.5 text-xs text-black/55">{member.plan}</td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${member.status==='Active'?'bg-[#E7F5E8] text-[#287A35]':member.status==='Due'?'bg-[#FFF0E8] text-[#B34E20]':'bg-black/5 text-black/45'}`}><span className="h-1 w-1 rounded-full bg-current"/>{member.status}</span></td><td className="px-4 py-3.5 text-xs font-semibold">{money(member.value)}</td><td className="px-4 py-3.5 text-xs text-black/45">{member.next}</td><td className="px-4 py-3.5 text-xs text-black/45">{member.action}</td></tr>)}</tbody></table></div></section>
        </main>
      </div>
    </div>

    {scanner && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true"><div className="relative w-full max-w-md rounded-[28px] bg-white p-6"><button onClick={()=>setScanner(false)} className="absolute end-4 top-4 rounded-full bg-black/5 p-2"><X size={18}/></button><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#191A18] text-white"><QrCode size={21}/></div><h2 className="mt-5 text-2xl font-semibold tracking-[-.04em]">{isPetsika?(isAr?'تأكيد استلام الطلب':'Confirm package collection'):(isAr?'استخدام زيارة':'Redeem a visit')}</h2><p className="mt-2 text-sm leading-6 text-black/45">{isAr?'وجّه الكاميرا إلى بطاقة QR الخاصة بالعضو.':'Point the camera at the member’s QR pass.'}</p><div className="relative mx-auto mt-6 aspect-square max-w-[260px] overflow-hidden rounded-3xl bg-[#171815]"><div className="absolute inset-6 rounded-2xl border border-white/20"/><span className="absolute left-6 top-6 h-12 w-12 border-l-2 border-t-2 border-[#8EDB68]"/><span className="absolute right-6 top-6 h-12 w-12 border-r-2 border-t-2 border-[#8EDB68]"/><span className="absolute bottom-6 left-6 h-12 w-12 border-b-2 border-l-2 border-[#8EDB68]"/><span className="absolute bottom-6 right-6 h-12 w-12 border-b-2 border-r-2 border-[#8EDB68]"/><div className="absolute left-10 right-10 top-1/2 h-px bg-[#8EDB68] shadow-[0_0_14px_#8EDB68]"/><QrCode size={80} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20"/></div>{scanDone?<div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#E7F5E8] p-4 text-[#287A35]"><CheckCircle2 size={22}/><div><p className="text-sm font-bold">{isAr?'تم التأكيد':'Confirmed successfully'}</p><p className="mt-0.5 text-[11px] opacity-70">{isPetsika?'Balanced Medium · Luna’s Home':'One visit redeemed · Omar H.'}</p></div></div>:<button onClick={()=>setScanDone(true)} className="mt-5 w-full rounded-full bg-[#191A18] py-3.5 text-sm font-bold text-white">{isAr?'محاكاة المسح':'Simulate scan'}</button>}</div></div>}
  </div>
}
