import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { translations, type Locale, type Dict } from './translations'
import { LOCALE_KEY } from '../saas/i18n'

type Ctx = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: Dict
  isRTL: boolean
  switchLocale: (next: Locale) => void
  localePath: (path?: string) => string
}

const LocaleContext = createContext<Ctx | null>(null)

/** BCP-47 `lang` values per locale. Franco is Egyptian Arabic content in Latin
 * script — "ar-Latn" is the correct BCP-47 tag for that (not "fr-eg", which would
 * misleadingly read as French). */
const HTML_LANG: Record<Locale, string> = { en: 'en', ar: 'ar', 'fr-eg': 'ar-Latn' }
const LOCALE_ROUTE_RE = /^\/(en|ar|fr-eg)/

/**
 * `persist` bridges this choice into the SaaS app (`src/saas/i18n.tsx` reads the
 * same `LOCALE_KEY`), so a language picked on the marketing site carries into
 * /signup and /app instead of silently resetting to English. Defaults to true for
 * the explicit `/en`, `/ar`, `/fr-eg` routes and `switchLocale`; the bare `/`
 * fallback route passes `persist={false}` so it never clobbers an already-stored
 * preference with its hardcoded "en" default.
 */
export function LocaleProvider({ locale, persist = true, children }: { locale: Locale; persist?: boolean; children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const isRTL = dir === 'rtl'

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', HTML_LANG[locale])
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