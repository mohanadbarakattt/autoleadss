import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import FunnelRenderer from '../components/FunnelRenderer'
import { LogoMark } from '../../components/Logo'
import { getFunnelBySlug, recordVisit, addLead, useAgency } from '../store'
import { getPublishedFunnel, recordVisitRemote, captureLeadRemote } from '../db/api'
import { subdomainSlug, isFunnelHost } from '../publish/host'
import type { Funnel } from '../types'

export default function Published() {
  const { slug: routeSlug } = useParams()
  const [funnel, setFunnel] = useState<Funnel | null | undefined>(undefined)
  const [backendReachable, setBackendReachable] = useState(false)
  const { settings: brand } = useAgency()
  /** Which store the currently-shown funnel came from — decides where a captured
   * lead goes. Set once per load so a read/write split-brain can't happen. */
  const source = useRef<'remote' | 'local'>('local')

  // Slug source: /p/:slug param, or a {slug}.autoleadss.site subdomain.
  const subSlug = subdomainSlug()
  const slug = routeSlug ?? subSlug ?? ''
  // On a custom-domain host with no slug, resolve the host itself. Host-based lookup
  // has no Neon-backed equivalent yet (custom domains weren't migrated in Phase 2 —
  // see src/saas/db/domains.ts) so this path always falls through to local lookup.
  const byHost = !slug && isFunnelHost()

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!byHost) {
        // Always try the shared Neon backend first — there's no client-side signal
        // for whether it's configured (server-only secrets), so we just attempt the
        // call. If it responds at all (found or not), trust it and stop — only an
        // actual failure (network error, 501 not configured, ...) falls through to
        // localStorage below. This fixes same-browser-only publishing whenever the
        // backend *is* reachable.
        try {
          const f = await getPublishedFunnel(slug)
          if (!cancelled) {
            setBackendReachable(true)
            source.current = 'remote'
            setFunnel(f ?? null)
          }
          if (f) recordVisitRemote(f.slug).catch(() => {})
          return
        } catch {
          /* backend unreachable/unconfigured — fall back to localStorage below */
        }
      }
      const f = getFunnelBySlug(slug)
      if (!cancelled) {
        source.current = 'local'
        setFunnel(f ?? null)
      }
      if (f) recordVisit(slug)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, byHost])

  function handleLead(d: { name: string; phone: string; extra?: string }) {
    const targetSlug = funnel?.slug ?? slug
    if (source.current === 'remote') {
      captureLeadRemote(targetSlug, { name: d.name, phone: d.phone, message: d.extra, source: 'page' }).catch(() => {})
    } else {
      addLead(targetSlug, { name: d.name, phone: d.phone, message: d.extra, source: 'page' })
    }
  }

  if (funnel === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
  }

  if (!funnel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0B] px-6 text-center text-white">
        <LogoMark size={44} />
        <h1 className="font-display text-2xl font-bold">This funnel isn’t published here yet</h1>
        <p className="max-w-md text-sm text-white/60">
          {backendReachable
            ? 'This link has no published funnel. Publish one from your dashboard to see it live.'
            : 'Published funnels are stored in the browser that created them (demo mode). Generate one and publish it to see it live.'}
        </p>
        <Link to="/signup" className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">Build one with AutoLeadss</Link>
      </div>
    )
  }

  const hero = funnel.spec.page.hero
  return (
    <div className="relative">
      <Helmet defer={false}>
        <html lang={funnel.language} dir={funnel.language === 'ar' ? 'rtl' : 'ltr'} />
        <title>{funnel.name} — {hero.eyebrow}</title>
        <meta name="description" content={hero.subhead} />
        <meta property="og:title" content={`${funnel.name} — ${hero.headline}`} />
        <meta property="og:description" content={hero.subhead} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://autoleadss.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={funnel.accent} />
      </Helmet>
      <FunnelRenderer spec={funnel.spec} accent={funnel.accent} onLead={handleLead} />
      {(() => {
        const b = funnel.brand ?? brand
        return !b?.hideBadge &&
        (b?.brandName ? (
          <span className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-[#0A0A0B] px-3 py-2 text-[11px] font-medium text-white shadow-lg">
            Made with {b.brandName}
          </span>
        ) : (
          <a href="https://autoleadss.com" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-[#0A0A0B] px-3 py-2 text-[11px] font-medium text-white shadow-lg">
            <LogoMark size={16} /> Made with AutoLeadss
          </a>
        ))
      })()}
    </div>
  )
}
