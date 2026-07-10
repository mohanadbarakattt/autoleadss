import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Check, Clock } from 'lucide-react'
import { z } from 'zod'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

/**
 * The marketing site's contact form predates the SaaS product (see the original
 * "Complete rebuild" commit) and is unrelated to the SaaS funnel/lead persistence
 * migrated to the shared Neon backend in Phase 2 (see docs/SETUP.md) — it's kept on
 * its own small Supabase project (just this one edge function, `send-contact-email`,
 * for outbound email) rather than the `@supabase/supabase-js` SDK, which was removed
 * as part of that migration. A plain `fetch` is all `functions.invoke` ever was.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

async function sendContactEmail(body: unknown): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Contact form isn’t configured (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY unset).')
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok || result?.error) throw new Error(typeof result?.error === 'string' ? result.error : 'Send failed')
}

type FormData = {
  name: string
  businessName: string
  phone: string
  email: string
  country: 'UAE' | 'Egypt' | 'Other'
  industry: 'Real Estate' | 'E-commerce' | 'Other'
  budget: string
  message?: string
  whatsappOptIn: boolean
}

const initial: FormData = {
  name: '', businessName: '', phone: '', email: '',
  country: 'UAE', industry: 'Real Estate',
  budget: '', message: '', whatsappOptIn: true,
}

function phonePlaceholder(country: FormData['country']) {
  if (country === 'Egypt') return '+20 1XX XXX XXXX'
  if (country === 'UAE') return '+971 5X XXX XXXX'
  return '+...'
}

export default function Contact() {
  const t = useT()
  const [form, setForm] = useState<FormData>(initial)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const schema = z.object({
    name: z.string().trim().min(1, t.contact.errors.name).max(100),
    businessName: z.string().trim().min(1, t.contact.errors.business).max(120),
    phone: z.string().trim().min(5, t.contact.errors.phone).max(30),
    email: z.string().trim().email(t.contact.errors.email).max(255),
    country: z.enum(['UAE', 'Egypt', 'Other']),
    industry: z.enum(['Real Estate', 'E-commerce', 'Other']),
    budget: z.string().min(1, t.contact.errors.budget),
    message: z.string().max(2000).optional(),
    whatsappOptIn: z.boolean(),
  })

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t.contact.errors.generic)
      return
    }
    setLoading(true)
    try {
      await sendContactEmail(parsed.data)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError(t.contact.errors.send)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-fg/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-card transition-all duration-200'

  const infoItems = [
    { icon: MapPin, text: t.contact.addr },
    { icon: Phone, text: '+20 110 005 4278' },
    { icon: Mail, text: 'info@autoleadss.com' },
    { icon: Clock, text: '24/7' },
  ]

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="content-width">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[42%_58%] md:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 md:sticky md:top-28"
          >
            <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} sub={t.contact.sub} />

            <div className="-mt-8 grid grid-cols-2 gap-3">
              {infoItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-muted-fg">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(255,92,42,0.1)' }}>
                      <Icon size={14} className="text-accent" />
                    </span>
                    <span className="truncate" dir="ltr">{item.text}</span>
                  </div>
                )
              })}
            </div>

            <a
              href="https://wa.me/201100054278"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(37,211,102,0.5)]"
              style={{ background: '#25D366' }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 11.6 11.6 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.3.7-2 1-2.2a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c0 .2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6a8.8 8.8 0 0 0 1.6 2 8 8 0 0 0 2.3 1.4c.3.2.5.1.6 0l1-1.1c.2-.3.4-.2.6-.1l2 .9c.2.1.4.2.4.3 0 .2 0 .7-.1 1.3Z" />
              </svg>
              {t.contact.sentCta}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-7 shadow-[0_24px_60px_-30px_rgba(10,10,11,0.25)] md:p-9"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10"
                >
                  <Check size={30} className="text-accent" />
                </motion.div>
                <h3 className="font-display text-xl font-bold text-foreground">{t.contact.sent}</h3>
                <p className="max-w-sm text-sm text-muted-fg">{t.contact.sentSub}</p>
                <a
                  href="https://wa.me/201100054278"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  {t.contact.sentCta}
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.name}</label>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder={t.contact.namePh} required className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.business}</label>
                    <input type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder={t.contact.businessPh} required className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.phone}</label>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder={phonePlaceholder(form.country)} required className={inputClass} dir="ltr" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.email}</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder={t.contact.emailPh} required className={inputClass} dir="ltr" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.country}</label>
                    <select value={form.country} onChange={e => update('country', e.target.value as FormData['country'])} required className={inputClass}>
                      <option value="UAE">{t.contact.countries.UAE}</option>
                      <option value="Egypt">{t.contact.countries.Egypt}</option>
                      <option value="Other">{t.contact.countries.Other}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.industry}</label>
                    <select value={form.industry} onChange={e => update('industry', e.target.value as FormData['industry'])} required className={inputClass}>
                      <option value="Real Estate">{t.contact.industries['Real Estate']}</option>
                      <option value="E-commerce">{t.contact.industries['E-commerce']}</option>
                      <option value="Other">{t.contact.industries.Other}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-fg">{t.contact.budget}</label>
                  <select value={form.budget} onChange={e => update('budget', e.target.value)} required className={inputClass}>
                    <option value="" disabled>{t.contact.budgetPh}</option>
                    {t.contact.budgets.map(b => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-fg">
                    {t.contact.message} <span className="text-muted-fg/70">{t.contact.optional}</span>
                  </label>
                  <textarea value={form.message} onChange={e => update('message', e.target.value)} placeholder={t.contact.messagePh} rows={4} className={`${inputClass} resize-none`} />
                </div>

                <label className="flex cursor-pointer select-none items-start gap-3 text-sm text-muted-fg">
                  <input type="checkbox" checked={form.whatsappOptIn} onChange={e => update('whatsappOptIn', e.target.checked)} className="mt-1 h-4 w-4 rounded border-border accent-accent" style={{ accentColor: '#FF5C2A' }} />
                  <span>{t.contact.whatsappOk}</span>
                </label>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-accent py-4 text-sm font-medium text-white transition-all duration-300 hover:shadow-[0_12px_36px_-8px_rgba(255,92,42,0.6)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loading ? t.contact.submitting : t.contact.submit}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
