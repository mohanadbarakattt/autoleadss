import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import FunnelRenderer from '../components/FunnelRenderer'
import { LogoMark } from '../../components/Logo'
import { getFunnelBySlug, recordVisit, addLead, useAgency } from '../store'
import { remoteEnabled } from '../config'
import { getAnonSupabase } from '../db/client'
import { getPublishedFunnel, getPublishedFunnelByHost, recordVisitRemote, captureLeadRemote } from '../db/remote'
import { subdomainSlug, isFunnelHost, currentHost } from '../publish/host'
import type { Funnel } from '../types'

export default function Published() {
  const { slug: routeSlug } = useParams()
  const [funnel, setFunnel] = useState<Funnel | null | undefined>(undefined)
  const { settings: brand } = useAgency()
  const sb = useMemo(() => (remoteEnabled ? getAnonSupabase() : null), [])

  // Slug source: /p/:slug param, or a {slug}.autoleadss.site subdomain.
  const subSlug = subdomainSlug()
  const slug = routeSlug ?? subSlug ?? ''
  // On a custom-domain host with no slug, resolve the host itself.
  const byHost = !slug && isFunnelHost()

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (sb) {
        try {
          const f = byHost ? await getPublishedFunnelByHost(sb, currentHost()) : await getPublishedFunnel(sb, slug)
          if (!cancelled) setFunnel(f ?? null)
          if (f) recordVisitRemote(sb, f.slug).catch(() => {})
        } catch {
          if (!cancelled) setFunnel(null)
        }
      } else {
        const f = getFunnelBySlug(slug)
        setFunnel(f ?? null)
        if (f) recordVisit(slug)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, byHost, sb])

  function handleLead(d: { name: string; phone: string; extra?: string }) {
    const targetSlug = funnel?.slug ?? slug
    if (sb) {
      captureLeadRemote(sb, targetSlug, { name: d.name, phone: d.phone, message: d.extra, source: 'page' }).catch(() => {})
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
          {remoteEnabled
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
      <Helmet>
        <html lang={funnel.language} dir={funnel.language === 'ar' ? 'rtl' : 'ltr'} />
        <title>{funnel.name} — {hero.eyebrow}</title>
        <meta name="description" content={hero.subhead} />
        <meta property="og:title" content={`${funnel.name} — ${hero.headline}`} />
        <meta property="og:description" content={hero.subhead} />
        <meta property="og:type" content="website" />
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
