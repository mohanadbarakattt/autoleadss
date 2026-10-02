import { Helmet } from 'react-helmet-async'
import { Check } from 'lucide-react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MembershipFlowDemo from '../components/MembershipFlowDemo'
import { useLocale } from '../i18n/LocaleProvider'
import { SITE } from '../site'

export default function MembershipFlowDemoPage() {
  const { locale, isRTL } = useLocale()
  const title = isRTL ? 'عرض نظام العضويات | أوتوليدز' : 'Membership system demo | AutoLeadss'
  const description = isRTL ? 'شاهد رحلة العضوية من شراء الباقة حتى الخصم وتحديث لوحة المالك.' : 'See the complete membership journey from package purchase to QR redemption and dashboard update.'
  const outcomes = isRTL
    ? ['تحصيل قيمة الاشتراك مقدماً', 'بطاقة QR واضحة للعميل', 'خصم سريع للموظف', 'تحديث فوري للوحة المالك']
    : ['Collect the term upfront', 'A clear customer QR pass', 'Fast staff redemption', 'An instantly updated dashboard']

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Helmet defer={false}>
        <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE.origin}/${locale}/demo/membership-flow`} />
      </Helmet>
      <Navigation />
      <main className="content-width pb-28 pt-32 sm:pt-40">
        <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#fe8c58]">{isRTL ? 'عرض تفاعلي' : 'Interactive demo'}</p>
            <h1 className="mt-4 max-w-xl font-display text-[clamp(3rem,6vw,5.8rem)] font-bold leading-[0.9] tracking-[-0.06em]">
              {isRTL ? 'شوف الرحلة كاملة.' : 'See the whole flow.'}
            </h1>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-white/55 lg:justify-self-end">{description}</p>
        </div>

        <div className="mt-10"><MembershipFlowDemo mode="full" /></div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.map(item => (
            <div key={item} className="flex items-start gap-3 bg-[#111113] p-5"><Check size={15} className="mt-0.5 shrink-0 text-[#fe8c58]" /><p className="text-sm leading-relaxed text-white/65">{item}</p></div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
