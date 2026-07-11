import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Logo from '../../components/Logo'
import { useI18n, toContentLocale } from '../i18n'
import { TIERS, TOPUP_PACKS, priceFor } from '../pricing'
import { useSession, setPlan, setRegion } from '../store'
import { billingEnabled, startCheckout } from '../billing/checkout'
import { useEntitlements } from '../billing/UpgradeContext'
import { purchaseTopup } from '../billing/usage'
import type { Region } from '../types'
import LocaleSwitcher from '../components/LocaleSwitcher'

export default function Pricing() {
  const { t, locale, isRTL, setLocale } = useI18n()
  const contentLocale = toContentLocale(locale)
  const session = useSession()
  const navigate = useNavigate()
  const ent = useEntitlements()
  const [region, setRegionState] = useState<Region>(session?.workspace.region ?? 'gulf')
  const [bought, setBought] = useState<Set<string>>(new Set())

  function buyTopup(id: (typeof TOPUP_PACKS)[number]['id']) {
    // Demo-mode only — see purchaseTopup's doc comment in billing/usage.ts for why
    // this doesn't call a backend endpoint.
    purchaseTopup(session?.user.id, id)
    setBought((s) => new Set(s).add(id))
    setTimeout(() => setBought((s) => { const n = new Set(s); n.delete(id); return n }), 2400)
  }

  async function choose(id: (typeof TIERS)[number]['id'], contact?: boolean) {
    if (contact) {
      window.open('https://wa.me/201100054278', '_blank')
      return
    }
    if (!session) {
      navigate('/signup')
      return
    }
    if (billingEnabled) {
      const url = await startCheckout(id, region, session.user.id)
      if (url) {
        window.location.href = url
        return
      }
    }
    // demo / billing-not-configured: set the plan locally
    setRegion(region)
    setPlan(id)
    navigate('/app')
  }

  const isFranco = locale === 'fr-eg'
  const title = isRTL ? 'الأسعار — AutoLeadss' : isFranco ? 'El As3ar — AutoLeadss' : 'Pricing — AutoLeadss'
  const description = isRTL
    ? 'أسعار AutoLeadss لمنشئ القمع بالذكاء الاصطناعي — باقات لمصر والخليج، من التجربة المجانية إلى وضع الوكالة.'
    : isFranco
      ? 'As3ar AutoLeadss lel funnel builder bel AI — plans le Masr w El Khaleeg, men ebda2 majjany le agency white-label.'
      : 'AutoLeadss pricing for the self-serve AI funnel builder — plans for Egypt and the Gulf, from a free start to white-label agency.'
  const htmlLang = isRTL ? 'ar' : isFranco ? 'ar-Latn' : 'en'

  // Only the tiers with a fixed, published price (not "contact us" tiers) go into
  // structured data — no fabricated/estimated prices for the done-with-you or
  // white-label tiers, which are scoped per engagement.
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'AutoLeadss — AI funnel builder',
    description: 'Self-serve AI funnel builder: landing pages, ads, WhatsApp bot, and social content generated from a short wizard.',
    brand: { '@type': 'Brand', name: 'AutoLeadss' },
    offers: TIERS.filter((t) => !t.contact).map((t) => ({
      '@type': 'Offer',
      name: t.name.en,
      priceCurrency: 'USD',
      price: t.priceGulf.replace(/[^0-9.]/g, ''),
      url: 'https://autoleadss.com/pricing',
    })),
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background">
      <Helmet defer={false}>
        <html lang={htmlLang} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://autoleadss.com/pricing" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://autoleadss.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://autoleadss.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>
      {/* header */}
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
        <div className="glass-dark mx-auto flex h-14 max-w-[1200px] items-center justify-between rounded-2xl px-5">
          <Link to="/"><Logo variant="dark" size={28} /></Link>
          <div className="flex items-center gap-3">
            <LocaleSwitcher locale={locale} setLocale={setLocale} variant="dark" />
            <Link to={session ? '/app' : '/login'} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white">{session ? t.nav.dashboard : t.nav.login}</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0A0A0B] pb-24 pt-36">
        <div aria-hidden className="absolute inset-0 grid-bg-dark" style={{ maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 70%)' }} />
        <div aria-hidden className="absolute left-1/2 top-0 h-[50%] w-[60%] -translate-x-1/2 opacity-40 blur-3xl" style={{ background: 'radial-gradient(ellipse, rgba(255,92,42,0.3), transparent 70%)' }} />
        <div className="content-width relative z-10 text-center">
          <h1 className="font-display font-bold text-white" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', letterSpacing: '-0.03em' }}>{t.pricing.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">{t.pricing.sub}</p>
          <div className="mt-8 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
            {(['gulf', 'egypt'] as Region[]).map((r) => (
              <button key={r} onClick={() => setRegionState(r)} className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${region === r ? 'bg-accent text-white' : 'text-white/70 hover:text-white'}`}>
                {r === 'gulf' ? `🇦🇪 ${t.pricing.gulf}` : `🇪🇬 ${t.pricing.egypt}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="content-width">
          <div className="grid gap-5 md:grid-cols-3">
            {TIERS.slice(0, 3).map((tier, i) => (
              <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className={`relative flex flex-col rounded-2xl border bg-card p-7 ${tier.popular ? 'border-accent shadow-[0_24px_60px_-30px_rgba(255,92,42,0.5)]' : 'border-border'}`}>
                {tier.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold text-white">{t.pricing.popular}</span>}
                <p className="font-display text-lg font-bold">{tier.name[contentLocale]}</p>
                <p className="mt-1 text-sm text-muted-fg">{tier.tagline[contentLocale]}</p>
                <p className="mt-5 font-display text-4xl font-bold">
                  {priceFor(tier, region)}
                  <span className="text-base font-normal text-muted-fg">{t.pricing.mo}</span>
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" /> {f[contentLocale]}
                    </li>
                  ))}
                </ul>
                <button onClick={() => choose(tier.id)} className={`mt-7 rounded-full py-3 text-sm font-medium transition-all hover:-translate-y-0.5 ${tier.popular ? 'bg-accent text-white hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)]' : 'border border-border text-foreground hover:border-accent'}`}>
                  {session?.workspace.plan === tier.id ? t.pricing.current : t.pricing.choose}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {TIERS.slice(3).map((tier) => (
              <div key={tier.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-[#0A0A0B] p-7 text-white sm:flex-row sm:items-center">
                <div>
                  <p className="font-display text-lg font-bold">{tier.name[contentLocale]}</p>
                  <p className="mt-1 text-sm text-white/60">{tier.tagline[contentLocale]}</p>
                  <p className="mt-3 font-display text-2xl font-bold text-gradient-accent">{priceFor(tier, region)}</p>
                </div>
                <button onClick={() => choose(tier.id, true)} className="shrink-0 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  {t.pricing.contact}
                </button>
              </div>
            ))}
          </div>

          {session && (ent.whatsappCap || ent.aiActionCap) && (
            <div className="mt-14">
              <div className="text-center">
                <p className="font-display text-xl font-bold">{isRTL ? 'باقات إضافية' : 'Top-up packs'}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-fg">
                  {isRTL ? 'وصلت لحدّك الشهري؟ اشترِ محادثات واتساب وتوليدات إضافية تُستخدم خلال 90 يوماً.' : isFranco ? 'Wasalt le limit el shahr? Eshtery mokalmat WhatsApp w generations extra, sale7a le 90 youm.' : 'Hit your monthly cap? Buy extra WhatsApp-AI conversations and AI generations, valid for 90 days.'}
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {TOPUP_PACKS.map((pack) => (
                  <div key={pack.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                    <p className="font-display font-semibold">{pack.name[contentLocale]}</p>
                    <p className="mt-2 font-display text-2xl font-bold">{region === 'egypt' ? pack.priceEgypt : pack.priceGulf}</p>
                    <ul className="mt-3 flex flex-1 flex-col gap-1.5 text-sm text-muted-fg">
                      <li>+{pack.whatsapp} {isRTL ? 'محادثة واتساب' : 'WhatsApp conversations'}</li>
                      <li>+{pack.aiAction.toLocaleString()} {isRTL ? 'توليد ذكاء اصطناعي' : 'AI generations'}</li>
                      <li>{isRTL ? `صالحة ${pack.expiryDays} يوماً` : `valid ${pack.expiryDays} days`}</li>
                    </ul>
                    <button onClick={() => buyTopup(pack.id)} className="mt-4 rounded-full border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent">
                      {bought.has(pack.id) ? (isRTL ? 'تمّت الإضافة ✓' : 'Added ✓') : (isRTL ? 'شراء' : 'Buy')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/" className="text-sm text-muted-fg hover:text-foreground">← {isRTL ? 'العودة إلى AutoLeadss' : isFranco ? 'Erga3 le AutoLeadss' : 'Back to AutoLeadss'}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
