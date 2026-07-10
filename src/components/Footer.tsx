import { BriefcaseBusiness, Camera, Music2, MessageCircle } from 'lucide-react'
import { useT } from '../i18n/LocaleProvider'
import Logo from './Logo'
import MbaiBadge from './MbaiBadge'

const socials = [
  { icon: Camera, href: 'https://instagram.com/autoleadss', label: 'Instagram' },
  { icon: BriefcaseBusiness, href: 'https://linkedin.com/company/autoleadss', label: 'LinkedIn' },
  { icon: Music2, href: 'https://tiktok.com/@autoleadss', label: 'TikTok' },
  { icon: MessageCircle, href: 'https://wa.me/201100054278', label: 'WhatsApp' },
]

export default function Footer() {
  const t = useT()
  const columns: ('Services' | 'Company')[] = ['Services', 'Company']
  return (
    <footer style={{ background: '#0A0A0B' }} className="relative overflow-hidden text-white">
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-64 w-[70%] blur-3xl opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,92,42,0.4) 0%, transparent 70%)' }}
      />
      <div className="content-width relative z-10 flex flex-col gap-12 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto_auto] md:gap-20">
          <div className="flex max-w-xs flex-col gap-4">
            <Logo variant="dark" size={34} />
            <p className="text-sm leading-relaxed text-[#8A857D]">{t.footer.tagline}</p>
            <ul className="mt-1 flex flex-col gap-1.5 text-sm text-[#8A857D]">
              <li>
                <a href="https://wa.me/201100054278" className="transition-colors hover:text-white">{t.footer.waLabel}</a>
              </li>
              <li>
                <a href="mailto:info@autoleadss.com" className="transition-colors hover:text-white">info@autoleadss.com</a>
              </li>
            </ul>
            <div className="mt-2 flex items-center gap-3">
              {socials.map(s => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition-all duration-300 hover:bg-accent hover:-translate-y-0.5"
                  >
                    <Icon size={16} className="text-[#8A857D] transition-colors group-hover:text-white" />
                  </a>
                )
              })}
            </div>
          </div>

          {columns.map(col => (
            <div key={col} className="flex flex-col gap-4">
              <p className="eyebrow text-[#8A857D]">{t.footer.headings[col]}</p>
              <ul className="flex flex-col gap-2.5">
                {t.footer[col].map((item, i) => (
                  <li key={i}>
                    <a href={item.href} className="text-sm text-[#8A857D] transition-colors duration-200 hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-[#8A857D]">{t.footer.copyright}</p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <p className="flex items-center gap-1.5 text-xs text-[#8A857D]">
              <span className="h-1 w-1 rounded-full bg-accent" />
              {t.footer.cities}
            </p>
            <MbaiBadge variant="dark" />
          </div>
        </div>
      </div>
    </footer>
  )
}
