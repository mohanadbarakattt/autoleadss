import { Check, MessageCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'
import { AUDIT_COPY, auditLink } from '../../content/audit'
import { trackLeadFormConversion } from '../../analytics'

/** The free missed-leads audit: the first, no-risk step for a new client. */
export default function AuditOffer() {
  const { locale } = useLocale()
  const c = AUDIT_COPY[locale]

  return (
    <section id="audit" className="scroll-mt-36 bg-[#0A0A0B] py-20 text-white sm:py-28">
      <div className="content-width">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="eyebrow text-[#fe8c58]">{c.eyebrow}</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em]">{c.title}</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60">{c.body}</p>
            <ol className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {c.steps.map(([title, body], index) => (
                <li key={title} className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr]">
                  <span className="font-mono text-xs text-[#fe8c58]">0{index + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.04] p-7 sm:p-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-white/45">{c.youGet}</p>
            <ul className="mt-6 space-y-4">
              {c.gets.map(item => (
                <li key={item} className="flex gap-3 text-base text-white/85">
                  <Check size={18} className="mt-0.5 shrink-0 text-[#fe8c58]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={auditLink(locale)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackLeadFormConversion}
              data-track-location="audit_section"
              className="mt-9 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1E7E48] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle size={16} /> {c.cta}
            </a>
            <p className="mt-4 text-center text-xs text-white/45">{c.note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
