import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { translations, type Locale, type Dict } from './translations'

type Ctx = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: Dict
  isRTL: boolean
  switchLocale: (next: Locale) => void
  localePath: (path?: string) => string
}

const LocaleContext = createContext<Ctx | null>(null)

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const isRTL = dir === 'rtl'

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', locale)
    html.setAttribute('dir', dir)
  }, [locale, dir])

  const value = useMemo<Ctx>(() => ({
    locale,
    dir,
    isRTL,
    t: translations[locale],
    switchLocale: (next) => {
      const rest = location.pathname.replace(/^\/(en|ar)/, '') || ''
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