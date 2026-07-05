import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useT } from '../i18n/LocaleProvider'
import Logo from './Logo'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'

export default function Navigation() {
  const t = useT()
  const { locale, switchLocale, isRTL } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')

  const navLinks = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.work, href: '#work' },
    { label: t.nav.process, href: '#process' },
    { label: t.nav.contact, href: '#contact' },
  ]

  useEffect(() => {
    const ids = navLinks.map(l => l.href.slice(1))
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 pt-4 px-4">
        <div
          className={`mx-auto flex h-16 max-w-[1200px] items-center justify-between rounded-2xl px-5 transition-all duration-300 ${
            scrolled
              ? 'glass-dark shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]'
              : 'border border-transparent'
          }`}
        >
          <a href="#" aria-label="AutoLeadss home">
            <Logo variant="dark" size={34} />
          </a>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition-colors duration-200 ${
                  active === link.href.slice(1) ? 'text-accent' : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
                {active === link.href.slice(1) && (
                  <motion.span layoutId="nav-underline" className="absolute -bottom-1.5 h-0.5 w-full rounded-full bg-accent" style={{ insetInlineStart: 0 }} />
                )}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => switchLocale(locale === 'ar' ? 'en' : 'ar')}
              aria-label="Switch language"
              className="rounded-full border border-white/20 px-3 py-1.5 font-sans text-xs font-bold tracking-wider text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              {locale === 'ar' ? 'EN' : 'العربية'}
            </button>
            <a
              href="/login"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {locale === 'ar' ? 'دخول' : 'Log in'}
            </a>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-[0_10px_28px_-8px_rgba(255,92,42,0.7)] hover:-translate-y-0.5"
            >
              {locale === 'ar' ? 'جرّب المنشئ' : 'Try the builder'}
            </a>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => switchLocale(locale === 'ar' ? 'en' : 'ar')}
              aria-label="Switch language"
              className="rounded-full border border-white/20 px-2.5 py-1 font-sans text-xs font-bold tracking-wider text-white/80"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>
            <button className="p-2 text-white" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className={`fixed inset-y-0 z-50 flex w-72 flex-col gap-6 p-8 md:hidden ${
              isRTL ? 'left-0 border-r' : 'right-0 border-l'
            }`}
            style={{ background: '#0A0A0B', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between">
              <Logo variant="dark" size={28} />
              <button className="p-1 text-white/60" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-xl font-semibold text-white transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <a
                href="/signup"
                className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-white"
              >
                {locale === 'ar' ? 'جرّب المنشئ' : 'Try the builder'}
              </a>
              <a
                href={CAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-medium text-white/90"
              >
                {t.nav.bookCall}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
