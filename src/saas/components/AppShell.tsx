import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutGrid, Plus, CreditCard, Globe, MessageCircle } from 'lucide-react'
import Logo from '../../components/Logo'
import { useI18n } from '../i18n'
import { useSession } from '../store'
import { planName } from '../pricing'
import LogoutButton from '../auth/LogoutButton'

export default function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale, isRTL } = useI18n()
  const session = useSession()
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

  const nav = [
    { label: t.nav.dashboard, href: '/app', icon: LayoutGrid },
    { label: t.common.new, href: '/app/new', icon: Plus },
    { label: 'WhatsApp', href: '/app/connect', icon: MessageCircle },
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
            <p className="mt-0.5 text-sm font-semibold text-foreground">{planName(session.workspace.plan, locale)} · {session.workspace.region === 'egypt' ? '🇪🇬' : '🇦🇪'}</p>
          </div>
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:bg-muted hover:text-foreground">
            <Globe size={17} /> {t.lang.switch}
          </button>
          <LogoutButton label={isRTL ? 'خروج' : 'Log out'} />
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-5 py-3 backdrop-blur lg:hidden">
        <Link to="/app"><Logo size={26} /></Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-muted-fg">{t.lang.label === 'EN' ? 'AR' : 'EN'}</button>
          <Link to="/app/new" className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white">{t.common.new}</Link>
        </div>
      </div>

      <main className="min-w-0">{children}</main>
    </div>
  )
}
