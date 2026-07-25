/**
 * Custom-domain hostname validation — a security boundary, not a UX nicety.
 * Every write path (api/domains/index.ts's POST) must route through this
 * before a hostname ever reaches the database: a merchant must never be able
 * to claim a hostname that resolves to our own app or to another merchant's
 * free `{slug}.autoleadss.site` subdomain.
 *
 * `FUNNEL_ROOT` is duplicated (not imported) from src/saas/publish/host.ts on
 * purpose — that file reads `import.meta.env.VITE_FUNNEL_DOMAIN`, a Vite-only
 * construct that doesn't exist in this Node/Vercel serverless runtime.
 */
const FUNNEL_ROOT = 'autoleadss.site'

const RESERVED_EXACT = new Set(['autoleadss.com', 'www.autoleadss.com', FUNNEL_ROOT, 'vercel.app'])
const RESERVED_SUFFIXES = [`.${FUNNEL_ROOT}`, '.vercel.app']

/** DNS label: 1-63 chars, letters/digits/hyphens, no leading/trailing hyphen.
 * ASCII-only — an IDN homograph (e.g. Cyrillic а look­alike) simply isn't in
 * this charset and is rejected as an invalid hostname, same as any other
 * non-ASCII input. */
const LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/

export type HostnameValidation = { ok: true; hostname: string } | { ok: false; error: string }

/**
 * Lowercases + validates a candidate custom-domain hostname. Returns the
 * normalized (lowercased, trimmed) hostname on success, or a truthful reason
 * on failure. Never silently normalizes away something a bypass attempt could
 * exploit (e.g. a trailing dot) — an invalid shape is simply rejected.
 */
export function validateHostname(input: unknown): HostnameValidation {
  if (typeof input !== 'string') return { ok: false, error: 'Hostname is required.' }
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: 'Hostname is required.' }
  if (/\s/.test(trimmed)) return { ok: false, error: 'Hostname cannot contain whitespace.' }
  if (trimmed.endsWith('.')) return { ok: false, error: 'Hostname cannot end with a dot.' }
  if (trimmed.includes('://')) return { ok: false, error: 'Enter a bare hostname, not a URL — no scheme.' }
  if (trimmed.includes('/')) return { ok: false, error: 'Hostname cannot contain a path.' }
  if (trimmed.includes(':')) return { ok: false, error: 'Hostname cannot contain a port.' }
  if (trimmed.includes('*')) return { ok: false, error: 'Wildcard hostnames are not supported.' }

  const hostname = trimmed.toLowerCase()
  if (IPV4_RE.test(hostname)) return { ok: false, error: 'IP addresses cannot be used as a custom domain.' }
  if (hostname === 'localhost') return { ok: false, error: 'localhost cannot be used as a custom domain.' }

  const labels = hostname.split('.')
  if (labels.length < 2) return { ok: false, error: 'Enter a full hostname, e.g. shop.yourbrand.com.' }
  if (hostname.length > 253) return { ok: false, error: 'Hostname is too long.' }
  if (!labels.every((l) => LABEL_RE.test(l))) return { ok: false, error: 'Hostname contains invalid characters.' }

  if (RESERVED_EXACT.has(hostname) || RESERVED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return { ok: false, error: 'This hostname is reserved and cannot be used as a custom domain.' }
  }

  return { ok: true, hostname }
}
