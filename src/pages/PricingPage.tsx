import { Helmet } from 'react-helmet-async'
import { Check } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ActionDock from '../components/ActionDock'
import CookieConsent from '../components/CookieConsent'
import ServiceTiers from '../components/ServiceTiers'
import { useLocale } from '../i18n/LocaleProvider'
import { SITE } from '../site'

export default function PricingPage() {
  const { locale, isRTL } = useLocale()
  const title = isRTL ? 'أسعار نظام العضويات | أوتوليدز' : 'Membership system pricing | AutoLeadss'
  const description = isRTL ? 'سعر واضح لبناء وتسليم نظام عضويات باسم نشاطك.' : 'Clear pricing to design, build and hand over a branded membership system for your business.'
  const path = locale === 'ar' ? '/se3r' : '/pricing'
  const included = isRTL ? ['واجهة بيع عربي وإنجليزي', '٣ باقات بمدد متعددة', 'بطاقة QR وتدفق موظف', 'لوحة مالك مركزة', 'PWA وتدريب وتسليم'] : ['Arabic and English storefront', 'Three plans with multiple terms', 'Customer QR and staff flow', 'Focused owner dashboard', 'PWA, training and handoff']
  return <div className="min-h-screen bg-[#F5F2EA] text-[#11110F]">
    <Helmet><html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}/><title>{title}</title><meta name="description" content={description}/><link rel="canonical" href={`${SITE.origin}/${locale}${path}`}/><link rel="alternate" hrefLang="en" href={`${SITE.origin}/en/pricing`}/><link rel="alternate" hrefLang="ar" href={`${SITE.origin}/ar/se3r`}/></Helmet><Navigation/>
    <main><section className="bg-[#0A0A0B] px-5 pb-24 pt-40 text-white md:px-8 md:pb-28"><div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1fr_420px] lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#FE8C58]">{isRTL ? 'سعر واضح · تسليم واضح' : 'Clear price · clear handoff'}</p><h1 className="mt-6 max-w-4xl font-display text-[clamp(3.3rem,7.5vw,6.8rem)] font-bold leading-[.9] tracking-[-.065em]">{isRTL ? 'نظام تملكه. وليس اشتراكاً تدفعه لنا.' : 'A system you own. Not software rent.'}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/58">{description}</p></div><div className="rounded-[26px] border border-white/12 bg-white/[.05] p-6"><p className="text-[10px] uppercase tracking-[.16em] text-white/38">{isRTL ? 'الأساسي في كل تنفيذ' : 'Core deliverables'}</p><ul className="mt-5 space-y-3">{included.map(item=><li key={item} className="flex gap-3 text-sm text-white/72"><Check size={16} className="shrink-0 text-[#FE8C58]"/>{item}</li>)}</ul></div></div></section><section className="px-5 pb-24 md:px-8 md:pb-32"><div className="mx-auto max-w-[1200px]"><ServiceTiers/></div></section></main>
    <Footer/><ActionDock/><CookieConsent/>
  </div>
}
