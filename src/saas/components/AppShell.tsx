import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, Plus, CreditCard, MessageCircle, Building2, PanelLeftClose, PanelLeftOpen, Clock, Sparkles, Menu, X, Megaphone } from 'lucide-react'
import Logo from '../../components/Logo'
import { useI18n, toContentLocale } from '../i18n'
import { useSession, useAgency, useFunnels } from '../store'
import { planName } from '../pricing'
import { entitlementFor } from '../entitlements'
import { useUpgrade } from '../billing/UpgradeContext'
import LogoutButton from '../auth/LogoutButton'
import AuthGate from '../auth/authReady'
import SaasFooter from './SaasFooter'
import LocaleSwitcher from './LocaleSwitcher'

const SIDEBAR_KEY = 'autoleadss:sidebar:collapsed'

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale, isRTL } = useI18n()
  const session = useSession()
  const agency = useAgency()
  const funnels = useFunnels()
  const openUpgrade = useUpgrade()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore quota/storage errors */
    }
  }, [collapsed])

  const isAgency = session ? entitlementFor(session.workspace.plan).whiteLabel : false
  const activeSub = agency.subAccounts.find((s) => s.id === agency.activeSubAccountId)
  // dwy/whitelabel are contact-sales tiers, not part of the self-serve upgrade ladder — no CTA for them.
  const canUpgrade = session ? session.workspace.plan === 'starter' || session.workspace.plan === 'growth' : false
  const recents = [...funnels].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)

  const nav = [
    { label: t.nav.dashboard, href: '/app', icon: LayoutGrid },
    { label: t.common.new, href: '/app/new', icon: Plus },
    { label: t.adSuite.navLabel, href: '/app/ads', icon: Megaphone },
    { label: 'WhatsApp', href: '/app/connect', icon: MessageCircle },
    ...(isAgency ? [{ label: isRTL ? 'الوكالة' : 'Agency', href: '/app/agency', icon: Building2 }] : []),
    { label: isRTL ? 'الأسعار' : 'Pricing', href: '/pricing', icon: CreditCard },
  ]

  /** Shared between the desktop sidebar and the mobile drawer. `onNavigate` is only
   * passed for the drawer (closes it on tap) — its presence also means "always show
   * full content", since the collapsed icon-only mode is a desktop-only affordance. */
  function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
    const expanded = !collapsed || !!onNavigate
    return (
      <>
        <Link to="/app" onClick={onNavigate} className={`mb-8 px-2 ${expanded ? '' : 'flex justify-center px-0'}`}>
          <Logo size={30} withWordmark={expanded} />
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.href
            const I = n.icon
            return (
              <Link
                key={n.href}
                to={n.href}
                onClick={onNavigate}
                aria-label={n.label}
                title={expanded ? undefined : n.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-accent/10 text-accent' : 'text-muted-fg hover:bg-muted hover:text-foreground'} ${expanded ? '' : 'justify-center px-0'}`}
              >
                <I size={17} className="shrink-0" /> {expanded && n.label}
              </Link>
            )
          })}
        </nav>

        {/* Recents — real persisted funnels, most recently updated first */}
        {expanded && (
          <div className="mt-6">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg/70">
              {isRTL ? 'الأخيرة' : 'Recents'}
            </p>
            {recents.length === 0 ? (
              <p className="mt-2 px-3 text-xs text-muted-fg">{t.dash.empty}</p>
            ) : (
              <div className="mt-1 flex flex-col gap-0.5">
                {recents.map((f) => (
                  <Link
                    key={f.id}
                    to={`/app/funnel/${f.id}`}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Clock size={14} className="shrink-0 opacity-60" />
                    <span className="truncate">{f.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-4">
          {canUpgrade && expanded && (
            <button
              type="button"
              onClick={() => { onNavigate?.(); openUpgrade('maxFunnels') }}
              className="flex flex-col items-start gap-1 rounded-xl border border-accent/30 bg-accent/[0.06] p-3 text-start transition-colors hover:bg-accent/10"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-accent"><Sparkles size={13} /> {isRTL ? 'رقِّ باقتك' : 'Upgrade plan'}</span>
              <span className="text-[11px] text-muted-fg">{isRTL ? 'افتح المزيد من الأقماع والمزايا' : 'Unlock more funnels & features'}</span>
            </button>
          )}

          {expanded ? (
            <div className="rounded-xl border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-fg">{session?.workspace.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {session && planName(session.workspace.plan, toContentLocale(locale))} · {session?.workspace.region === 'egypt' ? '🇪🇬' : '🇦🇪'}
              </p>
              {isAgency && activeSub && <p className="mt-1 truncate text-[11px] font-medium text-accent">▸ {activeSub.name}</p>}
            </div>
          ) : (
            <div className="flex justify-center rounded-xl border border-border bg-muted/50 py-2">
              <span
                title={session?.workspace.name}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent"
              >
                {session?.workspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {expanded && <LocaleSwitcher locale={locale} setLocale={setLocale} />}
          {expanded && <LogoutButton label={isRTL ? 'خروج' : 'Log out'} />}
        </div>
      </>
    )
  }

  return (
    <AuthGate>
      {session && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="min-h-screen bg-background lg:grid"
          style={{ gridTemplateColumns: collapsed ? '76px 1fr' : '260px 1fr' }}
        >
          <aside className="sticky top-0 relative hidden h-screen flex-col border-e border-border bg-card p-5 lg:flex">
            <SidebarBody />
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? (isRTL ? 'توسيع الشريط الجانبي' : 'Expand sidebar') : (isRTL ? 'طيّ الشريط الجانبي' : 'Collapse sidebar')}
              className="absolute -end-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-fg shadow-sm transition-colors hover:text-foreground"
            >
              {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
            </button>
          </aside>

          <div className="flex flex-col">
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-5 py-3 backdrop-blur lg:hidden">
              <button type="button" onClick={() => setDrawerOpen(true)} aria-label={isRTL ? 'فتح القائمة' : 'Open menu'} className="text-foreground">
                <Menu size={22} />
              </button>
              <Link to="/app"><Logo size={26} /></Link>
              <div className="flex items-center gap-2">
                <LocaleSwitcher locale={locale} setLocale={setLocale} size="sm" />
                <Link to="/app/new" className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white">{t.common.new}</Link>
              </div>
            </div>

            <main className="min-w-0 flex-1">{children}</main>

            <SaasFooter />
          </div>

          {/* mobile drawer — full nav + recents + account, unreachable otherwise below lg */}
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                  onClick={() => setDrawerOpen(false)}
                />
                <motion.div
                  initial={{ x: isRTL ? '100%' : '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: isRTL ? '100%' : '-100%' }}
                  transition={{ type: 'tween', duration: 0.26 }}
                  className={`fixed inset-y-0 z-50 flex w-72 flex-col bg-card p-5 lg:hidden ${isRTL ? 'right-0 border-s border-border' : 'left-0 border-e border-border'}`}
                >
                  <button type="button" onClick={() => setDrawerOpen(false)} aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'} className="absolute end-4 top-4 text-muted-fg hover:text-foreground">
                    <X size={20} />
                  </button>
                  <SidebarBody onNavigate={() => setDrawerOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </AuthGate>
  )
}
