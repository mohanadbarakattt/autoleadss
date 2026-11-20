import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { SITE } from '../site'

/** Routes that share a page with another URL point their canonical at the main one. */
const CANONICAL_ALIASES: Record<string, string> = {
  '/': '/en',
  '/ar/pricing': '/ar/se3r',
}

/**
 * Pages kept out of search: private client previews, access-code demos and
 * thin vertical pages that do not match the WhatsApp agent offer yet.
 */
const NOINDEX_PATTERNS = [
  /^\/(en|ar)\/demo\/lashes$/,
  /^\/(en|ar)\/pilots?(\/|$)/,
  /^\/en\/(dentist-websites|salon-websites|restaurant-booking-websites|gym-websites|website-design-cairo|website-design-dubai)$/,
]

export function canonicalPath(pathname: string) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return CANONICAL_ALIASES[clean] ?? clean
}

export function isNoindex(pathname: string) {
  const clean = canonicalPath(pathname)
  return NOINDEX_PATTERNS.some(re => re.test(clean))
}

/**
 * Site-wide defaults rendered before every page. Each page's own <Helmet>
 * renders later and overrides title, description and social tags, so every
 * URL always ends up with exactly one self-referencing canonical.
 */
export default function RouteHead() {
  const { pathname } = useLocation()
  const url = `${SITE.origin}${canonicalPath(pathname)}`

  return (
    <Helmet>
      <title>AI WhatsApp agents for clinics and real estate in Egypt and the Gulf | AutoLeadss</title>
      <meta name="description" content="AutoLeadss builds AI WhatsApp agents that reply in seconds in Arabic and English, qualify leads and book visits, for clinics, real estate and beauty businesses in Egypt and the Gulf." />
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:image" content={`${SITE.origin}/og-image.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${SITE.origin}/og-image.png`} />
      {isNoindex(pathname) ? <meta name="robots" content="noindex, follow" /> : null}
    </Helmet>
  )
}
