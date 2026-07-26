/**
 * Custom-domain hostname validation — a security boundary, not a UX nicety.
 * Every write path (api/domains/index.ts's POST) must route through this
 * before a hostname ever reaches the database: a merchant must never be able
 * to claim a hostname that resolves to our own app or to another merchant's
 * free `{slug}.autoleadss.site` subdomain.
 *
 * `FUNNEL_ROOT` and `PLATFORM_APEX` are hardcoded here (not imported from
 * src/saas/publish/host.ts) on purpose, for two reasons: that file reads
 * `import.meta.env.VITE_FUNNEL_DOMAIN`, a Vite-only construct that doesn't
 * exist in this Node/Vercel serverless runtime; and this reserved set must
 * NOT track a client-configurable env var at all — `VITE_FUNNEL_DOMAIN` ships
 * to the browser, so if the guard ever read it, setting that var would move
 * (or narrow) what's reserved out from under this server-side check. The
 * platform's real domains are fixed values known only to the server.
 */
const FUNNEL_ROOT = 'autoleadss.site'
const PLATFORM_APEX = 'autoleadss.com'

const RESERVED_EXACT = new Set([PLATFORM_APEX, `www.${PLATFORM_APEX}`, FUNNEL_ROOT, 'vercel.app'])
// A suffix match reserves EVERY subdomain of these roots, not just the exact
// names above — e.g. app.autoleadss.com, api.autoleadss.com — so a merchant
// can never claim a hostname under our own apex domain (defect class: platform-
// domain hijack via subdomain).
const RESERVED_SUFFIXES = [`.${FUNNEL_ROOT}`, '.vercel.app', `.${PLATFORM_APEX}`]

/** DNS label: 1-63 chars, letters/digits/hyphens, no leading/trailing hyphen.
 * ASCII-only, which rejects a raw IDN homograph (Cyrillic а lookalike) as
 * invalid characters — but NOT its punycode encoding, which is pure ASCII.
 * See `PUNYCODE_PREFIX` below; ASCII-only is necessary, not sufficient. */
const LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

/**
 * An `xn--` label is punycode: a pure-ASCII encoding of a Unicode label, which
 * the LABEL_RE above therefore accepts. That was a real bypass of this file's
 * own homograph protection — `аutoleadss.com` (Cyrillic а) is rejected, while
 * its identical-meaning encoding `xn--utoleadss-zyh.com` was accepted, and a
 * browser renders that back as `аutoleadss.com`. A merchant could claim a
 * domain visually indistinguishable from the platform's.
 *
 * Rather than decode and re-run the lookalike check (which would need a
 * confusables table we do not have and cannot fake), custom domains simply do
 * not support IDNs: they are rejected outright, with a truthful reason. If IDN
 * support is ever wanted, it needs a real confusable-detection pass, not a
 * decode-and-compare.
 */
const PUNYCODE_PREFIX = 'xn--'
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
  if (labels.some((l) => l.startsWith(PUNYCODE_PREFIX))) {
    return { ok: false, error: 'Internationalised (punycode) domains are not supported as custom domains.' }
  }

  if (RESERVED_EXACT.has(hostname) || RESERVED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return { ok: false, error: 'This hostname is reserved and cannot be used as a custom domain.' }
  }

  return { ok: true, hostname }
}
