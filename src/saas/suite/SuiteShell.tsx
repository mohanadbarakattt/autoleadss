import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe } from 'lucide-react'
import './theme.css'
import { useI18n } from '../i18n'
import { useSession, setMarketRegion } from '../store'
import AuthGate from '../auth/authReady'
import LogoutButton from '../auth/LogoutButton'
import LocaleSwitcher from '../components/LocaleSwitcher'

/** The dark-luxe top bar for the whole suite (al-hub.html `.bar`). Every
 * routed SaaS page now mounts this (Phase 7a finished the migration off
 * `AppShell`, which stays in the repo unreferenced in case it's needed again).
 *
 * `minimal` hides the nav links (Home/Tools/Clients/Pricing) — used by the
 * onboarding page (Start.tsx), which isn't part of that nav flow yet. The bar
 * still shows logo + region pill + account either way. */
export default function SuiteShell({ children, minimal = false }: { children: ReactNode; minimal?: boolean }) {
  const { t, locale, setLocale, isRTL } = useI18n()
  const session = useSession()
  const { pathname } = useLocation()
  const h = t.hub

  const nav = [
    { label: h.nav.home, href: '/app' },
    { label: h.nav.tools, href: '/app#tools' },
    { label: h.nav.clients, href: '/app/agency' },
    { label: h.nav.pricing, href: '/pricing' },
  ]

  return (
    <AuthGate>
      {session && (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="theme-suite">
          <header className="flex items-center justify-between gap-4 border-b border-suite-line px-[30px] py-[18px]">
            <Link to="/app" className="font-luxe text-2xl font-semibold tracking-wide text-suite-text">
              Auto<span className="text-suite-gold">Leadss</span>
            </Link>
            {!minimal && (
              <nav className="hidden items-center gap-[26px] text-sm text-suite-muted min-[861px]:flex">
                {nav.map((n) => {
                  const active = pathname === n.href.split('#')[0]
                  return (
                    <Link key={n.href} to={n.href} className={active ? 'text-suite-text' : 'text-suite-muted transition-colors hover:text-suite-text'}>
                      {n.label}
                    </Link>
                  )
                })}
              </nav>
            )}
            <div className="flex items-center gap-4">
              <RegionSwitch />
              <LocaleSwitcher locale={locale} setLocale={setLocale} variant="suite" size="sm" />
              <span
                aria-hidden
                title={session.workspace.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-suite-line bg-gradient-to-br from-[#2b2d36] to-[#191a20] text-xs font-semibold text-suite-gold-l"
              >
                {session.workspace.name.charAt(0).toUpperCase()}
              </span>
              <LogoutButton label={isRTL ? 'خروج' : 'Log out'} variant="suite" />
            </div>
          </header>

          <main>{children}</main>
        </div>
      )}
    </AuthGate>
  )
}

function RegionSwitch() {
  const { t } = useI18n()
  const session = useSession()
  const region = session?.workspace.marketRegion ?? 'gulf'

  return (
    <div role="group" aria-label={t.hub.region.label} className="inline-flex items-center gap-0.5 rounded-full border border-suite-line py-1 ps-2.5 pe-1 text-suite-gold-l">
      <Globe size={13} strokeWidth={1.7} aria-hidden />
      {(['gulf', 'global'] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setMarketRegion(r)}
          aria-pressed={region === r}
          className={`ms-1 rounded-full px-2 py-0.5 text-[12px] font-medium transition-colors ${region === r ? 'bg-suite-panel2 text-suite-gold-l' : 'text-suite-muted hover:text-suite-text'}`}
        >
          {r === 'gulf' ? t.hub.region.gulf : t.hub.region.global}
        </button>
      ))}
    </div>
  )
}
