import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { useLocale, useT } from '../i18n/LocaleProvider'
import Logo from './Logo'
import MbaiBadge from './MbaiBadge'
import { SITE, waLink } from '../site'

export default function Footer() {
  const t = useT()
  const { localePath } = useLocale()
  const wa = waLink(t.hero.waText)
  return (
    <footer style={{ background: '#0A0A0B' }} className="relative overflow-hidden text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[70%] -translate-x-1/2 opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(255,92,42,0.4) 0%, transparent 70%)' }}
      />
      <div className="content-width relative z-10 flex flex-col gap-12 py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo variant="dark" size={34} />
            <p className="text-sm leading-relaxed text-[#8A857D]">{t.footer.tagline}</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#8A857D] transition-colors hover:text-white">
              <MessageCircle size={16} />
              {SITE.whatsappDisplay}
            </a>
          </div>

          <a
            href={SITE.mbai}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex max-w-md items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-accent/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 font-serif text-lg text-white">M</span>
            <div>
            <p className="text-sm leading-relaxed text-white/80">
              {t.footer.advanced}{' '}
              <span className="inline-flex items-center gap-1 font-medium text-accent" dir="ltr">
                mbai-group.com
                <ArrowUpRight size={14} />
              </span>
            </p>
            <div className="mt-4">
              <MbaiBadge variant="dark" />
            </div>
            </div>
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p className="text-xs text-[#8A857D]">{t.footer.copyright}</p>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-4">
              <a href={localePath('/privacy')} className="text-xs text-[#8A857D] hover:text-white">{t.footer.privacy}</a>
              <a href={localePath('/terms')} className="text-xs text-[#8A857D] hover:text-white">{t.footer.terms}</a>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-[#8A857D]">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {t.footer.cities}
          </p>
        </div>
      </div>
    </footer>
  )
}
