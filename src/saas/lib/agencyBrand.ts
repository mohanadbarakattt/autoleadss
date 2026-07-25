/**
 * Shared validators for agency white-label branding (Phase 6): accent colour,
 * logo URL, brand name. `logoUrl` in particular is rendered as an <img src>
 * on public /p/:slug pages (see Published.tsx) and persisted via
 * api/agency/settings.ts, so every entry point that accepts it validates by
 * format here — reject anything that doesn't match rather than trying to
 * sanitize it (defect class SEC1 — see
 * mbai-ecosystem/docs/DEFECT-CLASS-REGISTRY.md, same discipline as
 * src/saas/lib/tracking.ts's GA4/Pixel id validators).
 *
 * `isValidHttpsUrl` is the general form, reused everywhere else the same
 * defect class shows up: the funnel thank-you CTA link (FunnelRenderer.tsx,
 * api/_lib/funnelSpec.ts) and product `imageUrl` (StorefrontRenderer.tsx,
 * api/products/*.ts) — one validator, not three copies of the same regex.
 */

const ACCENT_RE = /^#[0-9a-fA-F]{6}$/
export const MAX_BRAND_NAME_LEN = 80

export function isValidAccent(v: string): boolean {
  return ACCENT_RE.test(v)
}

/** https:// only — rejects javascript:, data:, vbscript:, protocol-relative
 * (`//evil.com`, which has no scheme for `new URL` to resolve without a base
 * and so throws), and plain http:. Public-page content is not a place to
 * accept an executable or embedded payload. */
export function isValidHttpsUrl(v: string): boolean {
  try {
    return new URL(v).protocol === 'https:'
  } catch {
    return false
  }
}

/** Alias kept for existing call sites (Agency.tsx, api/agency/settings.ts) —
 * identical to isValidHttpsUrl. */
export const isValidLogoUrl = isValidHttpsUrl

export function isValidBrandName(v: string): boolean {
  const trimmed = v.trim()
  return trimmed.length > 0 && trimmed.length <= MAX_BRAND_NAME_LEN
}

// --- self-check — run with `npx tsx src/saas/lib/agencyBrand.ts` ---
const isCli =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] != null &&
  /agencyBrand(\.ts|\.js)?$/.test(process.argv[1])

if (isCli) {
  function check(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg)
  }
  try {
    check(!isValidHttpsUrl('javascript:alert(1)'), 'https validator should reject javascript:')
    check(!isValidHttpsUrl('data:text/html,<script>alert(1)</script>'), 'https validator should reject data:')
    check(!isValidHttpsUrl('vbscript:msgbox(1)'), 'https validator should reject vbscript:')
    check(!isValidHttpsUrl('//evil.com/payload'), 'https validator should reject a protocol-relative URL')
    check(!isValidHttpsUrl('http://example.com/logo.png'), 'https validator should reject plain http:')
    check(!isValidHttpsUrl('not a url'), 'https validator should reject garbage')
    check(isValidHttpsUrl('https://cdn.example.com/logo.png'), 'https validator should accept a real https URL')
    check(isValidLogoUrl === isValidHttpsUrl, 'isValidLogoUrl should be the same validator as isValidHttpsUrl')
    check(!isValidAccent('red'), 'accent validator should reject a named colour')
    check(!isValidAccent('#FFF'), 'accent validator should reject a short hex')
    check(isValidAccent('#FF5C2A'), 'accent validator should accept a 6-digit hex')
    check(!isValidBrandName(''), 'brand name validator should reject empty')
    check(!isValidBrandName('x'.repeat(MAX_BRAND_NAME_LEN + 1)), 'brand name validator should reject oversized names')
    check(isValidBrandName('Acme Agency'), 'brand name validator should accept a normal name')
    console.log('agencyBrand.ts self-check passed')
  } catch (err) {
    console.error('agencyBrand.ts self-check FAILED:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}
