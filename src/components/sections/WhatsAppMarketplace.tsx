import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import SectionHeading from '../SectionHeading'

/**
 * Replaces the old generic contact form (name/business/phone/email/country/
 * industry/budget/message → a Supabase edge function) with a WhatsApp-first
 * connector: each service we offer is a "listing" with its own prefilled wa.me
 * deep link, so a visitor can go straight into a real conversation about the
 * thing they actually want instead of filling out a form and waiting.
 *
 * Reuses `services.demos` (already fully translated EN/AR/Franco) as the listed
 * offers rather than inventing new marketplace copy.
 *
 * needsUser: WhatsApp number is the one already used site-wide (Footer, CTABanner,
 * WhatsAppButton) — no new/placeholder numbers were introduced here.
 */
const WHATSAPP_NUMBER = '201100054278'

function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function WhatsAppMarketplace() {
  const t = useT()

  const infoItems = [
    { icon: MapPin, text: t.contact.addr },
    { icon: Phone, text: '+20 110 005 4278' },
    { icon: Mail, text: 'info@autoleadss.com' },
    { icon: Clock, text: '24/7' },
  ]

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="content-width">
        <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} sub={t.contact.sub} center />

        <div className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {infoItems.map((item, i) => {
            const ItemIcon = item.icon
            return (
              <div key={i} className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-muted-fg">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(255,92,42,0.1)' }}>
                  <ItemIcon size={14} className="text-accent" />
                </span>
                <span className="truncate" dir="ltr">{item.text}</span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.services.demos.map((demo, i) => (
            <motion.a
              key={i}
              href={waLink(`${t.contact.waPrefix} ${demo.tag}`)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="card-hover flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <span className="eyebrow text-accent">{demo.tag}</span>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-fg">{demo.body}</p>
              <span
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{ background: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white" aria-hidden>
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 11.6 11.6 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.3.7-2 1-2.2a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c0 .2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6a8.8 8.8 0 0 0 1.6 2 8 8 0 0 0 2.3 1.4c.3.2.5.1.6 0l1-1.1c.2-.3.4-.2.6-.1l2 .9c.2.1.4.2.4.3 0 .2 0 .7-.1 1.3Z" />
                </svg>
                {t.contact.waCta}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
