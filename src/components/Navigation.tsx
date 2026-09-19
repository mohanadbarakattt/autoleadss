import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useLocale, useT } from '../i18n/LocaleProvider'
import type { Locale } from '../i18n/translations'
import Logo from './Logo'
import { SITE, waLink } from '../site'

const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', ar: 'AR' }
const LOCALES: Locale[] = ['en', 'ar']

function LocaleSwitcher({ locale, switchLocale, size = 'md' }: { locale: Locale; switchLocale: (l: Locale) => void; size?: 'md' | 'sm' }) {
  return (
    <div className={`flex items-center gap-0.5 rounded-full border border-white/15 bg-black/20 ${size === 'sm' ? 'p-0.5' : 'p-1'}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          aria-label={`Switch language to ${LOCALE_LABEL[l]}`}
          aria-current={locale === l ? 'true' : undefined}
          className={`rounded-full font-sans font-bold tracking-wider transition-colors ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${
            locale === l ? 'bg-white text-[#0A0A0B]' : 'text-white/65 hover:text-white'
          }`}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  )
}

export default function Navigation() {
  const t = useT()
  const { locale, switchLocale, localePath } = useLocale()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const wa = waLink(t.hero.waText)
  const forceGlass = /privacy|terms|pricing|se3r/.test(location.pathname)

  const home = localePath()
  const navLinks = [
    { label: t.nav.offer, href: `${home}#offer`, id: 'offer' },
    { label: t.nav.examples, href: `${home}#examples`, id: 'examples' },
    { label: t.nav.work, href: `${home}#work`, id: 'work' },
    { label: t.nav.pricing, href: `${home}#pricing`, id: 'pricing' },
    { label: t.nav.process, href: `${home}#process`, id: 'process' },
  ]

  useEffect(() => {
    const ids = navLinks.map(l => l.id)
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const y = window.scrollY + 140
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [locale])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 pt-4 px-3 sm:px-4">
        <div
          className={`mx-auto flex h-[4.25rem] max-w-[1180px] items-center justify-between gap-3 rounded-full px-2.5 ps-2.5 pe-2.5 transition-all duration-300 ${
            scrolled || forceGlass
              ? 'border border-white/12 bg-[#0A0A0B]/78 shadow-[0_22px_50px_-22px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl'
              : 'border border-white/10 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl'
          }`}
        >
          <a href={localePath()} aria-label="AutoLeadss home" className="flex items-center rounded-full bg-white/10 py-1 pe-3.5 ps-1">
            <Logo variant="dark" size={32} />
            <span className="ms-2 hidden font-mono text-[9px] uppercase tracking-[0.14em] text-white/45 sm:inline" dir="ltr">
              {SITE.cities}
            </span>
          </a>

          <nav className="relative hidden items-center rounded-full bg-black/30 p-1 lg:flex">
            {navLinks.map(link => {
              const on = active === link.id
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative z-10 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    on ? 'text-white' : 'text-white/55 hover:text-white/90'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <LocaleSwitcher locale={locale} switchLocale={switchLocale} />
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_28px_-8px_rgba(30,126,72,0.55)] transition-transform hover:-translate-y-0.5"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {t.nav.cta}
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden me-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-4 top-[5.5rem] z-30 rounded-3xl border border-white/10 bg-[#0A0A0B]/95 p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-lg text-white/80 hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex items-center justify-between gap-3">
                <LocaleSwitcher locale={locale} switchLocale={switchLocale} size="sm" />
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-medium text-white"
                >
                  {t.nav.cta}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
