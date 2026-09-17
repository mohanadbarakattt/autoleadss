import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { translations, type Locale, type Dict } from './translations'

const LOCALE_KEY = 'mbai-locale'

type Ctx = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: Dict
  isRTL: boolean
  switchLocale: (next: Locale) => void
  localePath: (path?: string) => string
}

const LocaleContext = createContext<Ctx | null>(null)

const HTML_LANG: Record<Locale, string> = { en: 'en', ar: 'ar' }
const LOCALE_ROUTE_RE = /^\/(en|ar)/

/**
 * `persist` saves the language for later visits. The bare "/" route passes
 * persist={false} so its hardcoded "en" default never overwrites a stored choice.
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
      /* ignore */
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
        /* ignore */
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
