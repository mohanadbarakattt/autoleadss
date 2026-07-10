import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutGrid, Plus, CreditCard, MessageCircle, Building2 } from 'lucide-react'
import Logo from '../../components/Logo'
import { useI18n, toContentLocale } from '../i18n'
import { useSession, useAgency } from '../store'
import { planName } from '../pricing'
import { entitlementFor } from '../entitlements'
import LogoutButton from '../auth/LogoutButton'
import SaasFooter from './SaasFooter'
import LocaleSwitcher from './LocaleSwitcher'

export default function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale, isRTL } = useI18n()
  const session = useSession()
  const agency = useAgency()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted && !session) navigate('/login', { replace: true })
  }, [mounted, session, navigate])

  if (!mounted || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  const isAgency = entitlementFor(session.workspace.plan).whiteLabel
  const activeSub = agency.subAccounts.find((s) => s.id === agency.activeSubAccountId)
  const nav = [
    { label: t.nav.dashboard, href: '/app', icon: LayoutGrid },
    { label: t.common.new, href: '/app/new', icon: Plus },
    { label: 'WhatsApp', href: '/app/connect', icon: MessageCircle },
    ...(isAgency ? [{ label: isRTL ? 'الوكالة' : 'Agency', href: '/app/agency', icon: Building2 }] : []),
    { label: isRTL ? 'الأسعار' : 'Pricing', href: '/pricing', icon: CreditCard },
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-border bg-card p-5 lg:flex">
        <Link to="/app" className="mb-8 px-2">
          <Logo size={30} />
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.href
            const I = n.icon
            return (
              <Link key={n.href} to={n.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-accent/10 text-accent' : 'text-muted-fg hover:bg-muted hover:text-foreground'}`}>
                <I size={17} /> {n.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="rounded-xl border border-border bg-muted/50 p-3">
            <p className="text-xs text-muted-fg">{session.workspace.name}</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{planName(session.workspace.plan, toContentLocale(locale))} · {session.workspace.region === 'egypt' ? '🇪🇬' : '🇦🇪'}</p>
            {isAgency && activeSub && <p className="mt-1 truncate text-[11px] font-medium text-accent">▸ {activeSub.name}</p>}
          </div>
          <LocaleSwitcher locale={locale} setLocale={setLocale} />
          <LogoutButton label={isRTL ? 'خروج' : 'Log out'} />
        </div>
      </aside>

      <div className="flex flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-5 py-3 backdrop-blur lg:hidden">
          <Link to="/app"><Logo size={26} /></Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} setLocale={setLocale} size="sm" />
            <Link to="/app/new" className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white">{t.common.new}</Link>
          </div>
        </div>

        <main className="min-w-0 flex-1">{children}</main>

        <SaasFooter />
      </div>
    </div>
  )
}
