import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Check } from 'lucide-react'
import { useI18n } from '../i18n'
import { useSession } from '../store'
import { entitlementFor, nextPlanFor, type Feature } from '../entitlements'
import { planName, TIERS, priceFor } from '../pricing'

type Reason = Feature | 'maxFunnels'

const COPY: Record<Reason, { en: [string, string]; ar: [string, string] }> = {
  maxFunnels: { en: ['You’ve hit your funnel limit', 'Upgrade to build more funnels and scale your pipeline.'], ar: ['وصلت إلى حدّ القمم', 'رقِّ باقتك لبناء المزيد من القمم وتوسيع مبيعاتك.'] },
  whatsappBot: { en: ['WhatsApp AI bot is a Growth feature', 'Answer every lead in seconds, 24/7 — upgrade to switch it on.'], ar: ['بوت واتساب من مزايا Growth', 'ردّ على كل عميل خلال ثوانٍ، 24/7 — رقِّ لتفعيله.'] },
  removeBadge: { en: ['Remove the AutoLeadss badge', 'Make published funnels fully yours — available on Growth and up.'], ar: ['أزل شارة AutoLeadss', 'اجعل قممك المنشورة لك بالكامل — متاح من Growth فأعلى.'] },
  adSocialGen: { en: ['Ad & social generation is a Growth feature', 'Generate ready-to-run ads and social posts — upgrade to unlock.'], ar: ['توليد الإعلانات والسوشيال من Growth', 'ولّد إعلانات ومنشورات جاهزة — رقِّ لفتحها.'] },
  priorityAI: { en: ['Priority AI is a Pro feature', 'Faster generations and advanced analytics — upgrade to Pro.'], ar: ['الذكاء الاصطناعي بأولوية من Pro', 'توليد أسرع وتحليلات متقدّمة — رقِّ إلى Pro.'] },
}

const Ctx = createContext<{ openUpgrade: (r: Reason) => void } | null>(null)

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const { t, locale, isRTL } = useI18n()
  const session = useSession()
  const navigate = useNavigate()
  const [reason, setReason] = useState<Reason | null>(null)

  const plan = session?.workspace.plan ?? 'starter'
  const region = session?.workspace.region ?? 'gulf'
  const target = reason ? nextPlanFor(reason, plan) : 'growth'
  const tier = TIERS.find((x) => x.id === target)
  const copy = reason ? COPY[reason][locale] : ['', '']

  return (
    <Ctx.Provider value={{ openUpgrade: setReason }}>
      {children}
      <AnimatePresence>
        {reason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setReason(null)}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              <div className="relative overflow-hidden px-8 pt-8 pb-6" style={{ background: '#0A0A0B' }}>
                <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse at 70% 0%, rgba(255,92,42,0.4), transparent 65%)' }} />
                <button onClick={() => setReason(null)} className="absolute end-4 top-4 text-white/50 hover:text-white"><X size={18} /></button>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20"><Sparkles size={20} className="text-accent" /></span>
                <h3 className="relative mt-4 font-display text-xl font-bold text-white">{copy[0]}</h3>
                <p className="relative mt-2 text-sm text-white/70">{copy[1]}</p>
              </div>

              {tier && (
                <div className="px-8 py-6">
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-lg font-bold">{planName(target, locale)}</p>
                    <p className="font-display text-2xl font-bold">{priceFor(tier, region)}<span className="text-sm font-normal text-muted-fg">{t.pricing.mo}</span></p>
                  </div>
                  <ul className="mt-4 flex flex-col gap-2">
                    {tier.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground"><Check size={15} className="text-accent" /> {f[locale]}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setReason(null); navigate('/pricing') }}
                    className="mt-6 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  >
                    {isRTL ? `الترقية إلى ${planName(target, locale)}` : `Upgrade to ${planName(target, locale)}`}
                  </button>
                  <button onClick={() => setReason(null)} className="mt-2 w-full text-center text-xs text-muted-fg hover:text-foreground">
                    {isRTL ? 'ليس الآن' : 'Maybe later'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

export function useUpgrade() {
  const ctx = useContext(Ctx)
  return ctx?.openUpgrade ?? (() => {})
}

/** Current plan's entitlements (reactive to the session). */
export function useEntitlements() {
  const session = useSession()
  return entitlementFor(session?.workspace.plan ?? 'starter')
}
