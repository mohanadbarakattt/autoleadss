import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { PILOTS } from '../pilots/data'
import { useLocale } from '../i18n/LocaleProvider'

export default function PilotsIndex() {
  const { locale, switchLocale } = useLocale()
  const isAr = locale === 'ar'
  return <div className="min-h-screen bg-[#0A0A0B] text-white">
    <Helmet><title>{isAr ? 'نماذج مدينتي الخمسة | أوتوليدز' : 'Five Madinaty pilot concepts | AutoLeadss'}</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <header className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-6 md:px-8"><Link to={`/${locale}`} className="text-lg font-bold">AutoLeadss<span className="text-[#FF5C2A]">.</span></Link><button onClick={() => switchLocale(isAr ? 'en' : 'ar')} className="rounded-full border border-white/15 px-4 py-2 text-xs">{isAr ? 'EN' : 'AR'}</button></header>
    <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-14 md:px-8 md:pt-24">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-[#FF7950]"><Sparkles size={14}/>{isAr ? 'نماذج زيارة اليوم · مدينتي' : 'Today’s visit kit · Madinaty'}</p>
      <h1 className="mt-6 max-w-5xl text-[clamp(3.4rem,8vw,8rem)] font-semibold leading-[.9] tracking-[-.075em]">{isAr ? 'خمس أفكار. خمس طرق للدخل المتكرر.' : 'Five businesses. Five recurring-revenue ideas.'}</h1>
      <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55">{isAr ? 'كل نموذج يستخدم هوية وصوراً عامة للنشاط، وباقات مصممة لطريقة عمله. افتحه على موبايلك أمام صاحب المحل.' : 'Each private concept uses the business’s public brand material and a subscription model shaped around how it actually operates. Open one on your phone when you meet the owner.'}</p>
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        {PILOTS.map((pilot, index) => <Link key={pilot.slug} to={`/${locale}/pilot/${pilot.slug}`} className={`group relative min-h-[460px] overflow-hidden rounded-[34px] border border-white/10 ${index === 4 ? 'md:col-span-2' : ''}`}>
          <img src={pilot.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 md:p-9"><div className="flex items-end justify-between gap-5"><div><span className="rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[.15em]" style={{ background: pilot.accent, color: '#111' }}>0{index + 1} · {pilot.category[locale]}</span><h2 className="mt-5 text-4xl font-semibold tracking-[-.05em] md:text-5xl">{pilot.name}</h2><p className="mt-3 flex items-center gap-2 text-sm text-white/60"><MapPin size={14}/>{pilot.location[locale]}</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{isAr ? <ArrowLeft size={19}/> : <ArrowRight size={19}/>}</span></div></div>
        </Link>)}
      </div>
      <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[.04] p-6 text-sm leading-6 text-white/45">{isAr ? 'هذه تصورات خاصة للبيع وليست مواقع رسمية للأنشطة. أكد الأسعار والخدمات والصور مع صاحب كل نشاط قبل النشر.' : 'These are private sales concepts, not official business websites. Confirm packages, prices, services and image permissions with each owner before anything is published.'}</div>
    </main>
  </div>
}
