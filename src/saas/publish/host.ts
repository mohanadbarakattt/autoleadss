// Host-based funnel routing. Published funnels can live on {slug}.autoleadss.site
// (free subdomain) or a mapped custom domain. When the app is loaded on such a
// host, the whole site IS the funnel (served at "/").

export const FUNNEL_ROOT = (import.meta.env.VITE_FUNNEL_DOMAIN as string) || 'autoleadss.site'

const APP_HOSTS = ['autoleadss.com', 'www.autoleadss.com', 'localhost', '127.0.0.1']

export function currentHost(): string {
  return typeof window !== 'undefined' ? window.location.hostname : ''
}

/** The main app / marketing host (or a Vercel preview) — normal routing. */
export function isAppHost(): boolean {
  const h = currentHost()
  return !h || APP_HOSTS.includes(h) || h.endsWith('.vercel.app')
}

/** Extract the slug from a `{slug}.autoleadss.site` host, else null. */
export function subdomainSlug(): string | null {
  const h = currentHost()
  const suffix = '.' + FUNNEL_ROOT
  if (h.endsWith(suffix)) {
    const s = h.slice(0, -suffix.length)
    return s && s !== 'www' ? s : null
  }
  return null
}

/** True when the current host should render a funnel (subdomain or custom domain). */
export function isFunnelHost(): boolean {
  const h = currentHost()
  if (!h || isAppHost()) return false
  if (h.endsWith('.' + FUNNEL_ROOT)) return true
  return h !== FUNNEL_ROOT // any other non-app host = potential custom domain
}
