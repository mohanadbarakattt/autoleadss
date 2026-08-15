import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { translations, type Locale, type Dict } from './translations'

/** localStorage key for the visitor's chosen language.
 *
 * This used to be imported from src/saas/i18n.tsx so the marketing site and the
 * self-serve app shared one key. The SaaS was removed on 2026-08-15, so the
 * constant is inlined here — the VALUE is deliberately unchanged, because
 * returning visitors already have their choice stored under this exact key and
 * renaming it would silently reset everyone to English. */
const LOCALE_KEY = 'autoleadss:locale'

type Ctx = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: Dict
  isRTL: boolean
  switchLocale: (next: Locale) => void
  localePath: (path?: string) => string
}

const LocaleContext = createContext<Ctx | null>(null)

const LOCALE_ROUTE_RE = /^\/(en|ar)/

/**
 * `persist` stores the visitor's language choice so it survives a reload and a
 * later visit. Defaults to true for the explicit `/en`, `/ar` routes and
 * `switchLocale`; the bare `/` fallback route passes `persist={false}` so it
 * never clobbers an already-stored preference with its hardcoded "en" default.
 */
export function LocaleProvider({ locale, persist = true, children }: { locale: Locale; persist?: boolean; children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const isRTL = dir === 'rtl'

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', locale)
    html.setAttribute('dir', dir)
  }, [locale, dir])

  useEffect(() => {
    if (!persist) return
    try {
      window.localStorage.setItem(LOCALE_KEY, locale)
    } catch {
      /* ignore quota/storage errors */
    }
  }, [locale, persist])

  const value = useMemo<Ctx>(() => ({
    locale,
    dir,
    isRTL,
    t: translations[locale],
    switchLocale: (next) => {
      try {
        window.localStorage.setItem(LOCALE_KEY, next)
      } catch {
        /* ignore quota/storage errors */
      }
      const rest = location.pathname.replace(LOCALE_ROUTE_RE, '') || ''
      navigate(`/${next}${rest}${location.hash}`, { replace: true })
    },
    localePath: (path = '') => `/${locale}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`,
  }), [locale, dir, isRTL, location.pathname, location.hash, navigate])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}

export function useT() {
  return useLocale().t
}