import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import FunnelRenderer from '../components/FunnelRenderer'
import StorefrontRenderer from '../storefront/StorefrontRenderer'
import FunnelCookieConsent, { hasFunnelAnalyticsConsent } from '../components/FunnelCookieConsent'
import { LogoMark } from '../../components/Logo'
import { getFunnelBySlug, recordVisit, addLead, useAgency, useProducts } from '../store'
import { getPublishedFunnel, getPublishedFunnelByHost, recordVisitRemote, captureLeadRemote, getPublishedProducts, placeOrder } from '../db/api'
import { subdomainSlug, isFunnelHost, currentHost, FUNNEL_ROOT } from '../publish/host'
import { isValidGa4, isValidPixel } from '../lib/tracking'
import { reportIncident } from '../lib/reportIncident'
import type { Funnel, Product, PublicProduct } from '../types'

/** Demo/local products (from useProducts()) carry the full merchant `Product`
 * shape (including raw `stock`, `status`, ...) — narrow to the same
 * display-safe shape api/published/products.ts returns for a remote site, so
 * StorefrontRenderer never has to special-case which mode it's fed. */
function toPublicProduct(p: Product): PublicProduct {
  return { id: p.id, name: p.name, description: p.description, imageUrl: p.imageUrl, priceMinor: p.priceMinor, currency: p.currency, inStock: p.stock > 0 }
}

export default function Published() {
  const { slug: routeSlug } = useParams()
  const [funnel, setFunnel] = useState<Funnel | null | undefined>(undefined)
  const [backendReachable, setBackendReachable] = useState(false)
  const { settings: brand } = useAgency()
  // Phase 4b: a sell-mode site's public catalogue. Demo/local products come
  // straight from the store (below); remote products are fetched once the
  // funnel resolves (see the effect further down).
  const [remoteProducts, setRemoteProducts] = useState<PublicProduct[]>([])
  // Demo/local sites have no gateway connection concept at all (see
  // handleCheckout's doc below) so they never accept payments; remote sites
  // report the real, server-computed value (see the effect further down).
  const [remoteAcceptsPayments, setRemoteAcceptsPayments] = useState(false)
  const demoProducts = useProducts()
  /** Which store the currently-shown funnel came from — decides where a captured
   * lead goes. Set once per load so a read/write split-brain can't happen. */
  const source = useRef<'remote' | 'local'>('local')

  // Slug source: /p/:slug param, or a {slug}.autoleadss.site subdomain.
  const subSlug = subdomainSlug()
  const slug = routeSlug ?? subSlug ?? ''
  // On a custom-domain host with no slug, resolve the host itself (Phase 4c: a
  // real lookup through a VERIFIED autoleadss.domains row — see
  // api/published/index.ts's `?host=` path and db/api.ts's
  // getPublishedFunnelByHost). There is no local/demo equivalent for a custom
  // domain — it can only ever resolve remotely.
  const byHost = !slug && isFunnelHost()

  // GA4/Pixel scripts are the funnel owner's tracking — gate them behind analytics
  // consent (GDPR/PePP-EU). Seeded from a prior decision so returning opted-in
  // visitors aren't re-prompted; re-read if the slug changes (SPA nav between funnels).
  const [analyticsOk, setAnalyticsOk] = useState(() => hasFunnelAnalyticsConsent(slug))
  useEffect(() => {
    setAnalyticsOk(hasFunnelAnalyticsConsent(slug))
  }, [slug])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (byHost) {
        // A custom domain only ever resolves remotely (through a verified
        // autoleadss.domains row) — there's no localStorage equivalent to
        // fall back to, unlike the slug path below.
        try {
          const f = await getPublishedFunnelByHost(currentHost())
          if (!cancelled) {
            setBackendReachable(true)
            source.current = 'remote'
            setFunnel(f ?? null)
          }
          if (f) recordVisitRemote(f.slug).catch(() => {})
        } catch {
          if (!cancelled) setFunnel(null)
        }
        return
      }

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

  // Phase 4b: once a remote sell-mode site resolves, fetch its public
  // catalogue. Demo/local sell-mode sites need no fetch — their products are
  // already live via useProducts() above (same localStorage blob as the
  // merchant's own /app/products).
  useEffect(() => {
    if (!funnel || funnel.spec.mode !== 'sell' || source.current !== 'remote') return
    let cancelled = false
    getPublishedProducts(funnel.slug)
      .then(({ products, acceptsPayments }) => {
        if (!cancelled) {
          setRemoteProducts(products)
          setRemoteAcceptsPayments(acceptsPayments)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteProducts([])
          setRemoteAcceptsPayments(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [funnel])

  /**
   * Captures a lead. MUST NOT swallow — a lead is this product's revenue
   * event, and this page runs in the VISITOR's browser, so there is no local
   * fallback that would ever reach the funnel owner (localStorage here
   * belongs to the visitor). Previously this ended in `.catch(() => {})`, so
   * a failed capture silently destroyed the lead while the form still showed
   * a thank-you. Now a failure propagates to FunnelRenderer, which keeps the
   * form up so the visitor can retry. One transparent retry first, since the
   * common case is a transient blip. (Defect class C9 — see mbai-ecosystem
   * docs/DEFECT-CLASS-REGISTRY.md.)
   */
  async function handleLead(d: { name: string; phone: string; extra?: string }) {
    const targetSlug = funnel?.slug ?? slug
    const payload = { name: d.name, phone: d.phone, message: d.extra, source: 'page' as const }

    if (source.current !== 'remote') {
      // Demo/local mode: the funnel came from this browser's storage, so the
      // owner IS this browser and a local write is the real capture.
      addLead(targetSlug, payload)
      return
    }

    try {
      await captureLeadRemote(targetSlug, payload)
    } catch (first) {
      try {
        await captureLeadRemote(targetSlug, payload)
      } catch (err) {
        console.error(
          '[lead-capture][LEAD-DROP] remote capture failed twice — lead NOT saved, visitor asked to retry',
          { slug: targetSlug, err },
        )
        reportIncident('LEAD-DROP', 'remote lead capture failed twice — lead not saved', {
          slug: targetSlug,
          error: err instanceof Error ? err.message : String(err),
        })
        throw err
      }
    }
  }

  /**
   * Places an order on a sell-mode site. Demo/local sites have no gateway
   * connection to check (there's no local payment_connections equivalent —
   * see the design spec §7), so they always resolve to the same fail-closed
   * "not accepting payments yet" state a real gateway gate would produce,
   * WITHOUT ever hitting the network or creating anything — never a
   * simulated purchase. Remote sites hit the real, server-computed checkout
   * (api/published/order.ts), which independently re-enforces this gate no
   * matter what the client believes.
   */
  async function handleCheckout(input: { items: { productId: string; quantity: number }[]; buyer: { name: string; email?: string; phone: string } }) {
    if (source.current !== 'remote') throw new Error('payments_not_connected')
    return placeOrder({ slug: funnel?.slug ?? slug, ...input })
  }

  if (funnel === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Helmet defer={false}>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!funnel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0B] px-6 text-center text-white">
        <Helmet defer={false}>
          <meta name="robots" content="noindex" />
        </Helmet>
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
  const tracking = funnel.spec.tracking
  // Format-validate before ever splicing these into a <script> body below — an
  // invalid id (e.g. a stored XSS payload) is simply omitted, never rendered.
  const ga4Id = tracking?.ga4Id && isValidGa4(tracking.ga4Id) ? tracking.ga4Id : undefined
  const metaPixelId = tracking?.metaPixelId && isValidPixel(tracking.metaPixelId) ? tracking.metaPixelId : undefined

  // The site's real published home — the free subdomain, unless it was
  // actually reached through a verified custom domain, in which case that's
  // the canonical address the merchant wants indexed.
  const canonicalHost = byHost && source.current === 'remote' ? currentHost() : `${funnel.slug}.${FUNNEL_ROOT}`
  const canonicalUrl = `https://${canonicalHost}/`

  const activeProducts = source.current === 'remote' ? remoteProducts : demoProducts.filter((p) => p.status === 'active').map(toPublicProduct)
  // Never fabricate an OG image for a merchant's page — only a real one (a
  // sell-mode site's own product photo) qualifies; omit the tag otherwise
  // rather than showing AutoLeadss's own generic marketing image on a
  // merchant's storefront/funnel.
  const ogImage = funnel.spec.mode === 'sell' ? activeProducts.find((p) => p.imageUrl)?.imageUrl : undefined

  return (
    <div className="relative">
      <Helmet defer={false}>
        <html lang={funnel.language} dir={funnel.language === 'ar' ? 'rtl' : 'ltr'} />
        <title>{hero.eyebrow ? `${funnel.name} — ${hero.eyebrow}` : funnel.name}</title>
        <meta name="description" content={hero.subhead} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${funnel.name} — ${hero.headline}`} />
        <meta property="og:description" content={hero.subhead} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content={funnel.accent} />
        {analyticsOk && ga4Id && (
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
        )}
        {analyticsOk && ga4Id && (
          <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4Id}');`}</script>
        )}
        {analyticsOk && metaPixelId && (
          <script>{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</script>
        )}
      </Helmet>
      {analyticsOk && metaPixelId && (
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
        </noscript>
      )}
      {funnel.spec.mode === 'sell' ? (
        <StorefrontRenderer
          spec={funnel.spec}
          slug={funnel.slug}
          products={activeProducts}
          acceptsPayments={source.current === 'remote' && remoteAcceptsPayments}
          onCheckout={handleCheckout}
        />
      ) : (
        <FunnelRenderer spec={funnel.spec} accent={funnel.accent} onLead={handleLead} />
      )}
      {(() => {
        // Server-provided branding (api/published/index.ts) is the funnel
        // OWNER's real white-label settings — the only trustworthy source
        // once a visitor (who is not the owner) loads this page. `brand`
        // (from `useAgency()`) is the VISITOR's own browser state and must
        // never leak into what a different visitor sees; it's a legitimate
        // fallback only in demo mode, where the funnel came from THIS same
        // browser's localStorage (source.current !== 'remote'), so the
        // visitor and the owner are provably the same person. This is the
        // fix for the Phase 6 headline bug — see Funnel.brand's doc in
        // types.ts.
        const b = funnel.brand ?? (source.current !== 'remote' ? brand : undefined)
        return !b?.hideBadge &&
        (b?.brandName ? (
          <span className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-[#0A0A0B] px-3 py-2 text-[11px] font-medium text-white shadow-lg">
            {b.logoUrl && <img src={b.logoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />}
            Made with {b.brandName}
          </span>
        ) : (
          <a href="https://autoleadss.com" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-[#0A0A0B] px-3 py-2 text-[11px] font-medium text-white shadow-lg">
            <LogoMark size={16} /> Made with AutoLeadss
          </a>
        ))
      })()}
      <FunnelCookieConsent slug={slug} accent={funnel.accent} language={funnel.language} onDecision={setAnalyticsOk} />
    </div>
  )
}
