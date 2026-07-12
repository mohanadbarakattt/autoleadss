/**
 * Shared validators for user-supplied ad-tracking IDs (GA4 Measurement ID, Meta
 * Pixel ID). These get spliced into inline <script> bodies on the public
 * /p/:slug page (see Published.tsx) and persisted via api/funnels/[id].ts, so
 * every entry point that accepts them validates by format here — reject
 * anything that doesn't match rather than trying to escape it, since these
 * values are never meant to contain anything but the ID.
 */

const GA4_RE = /^G-[A-Z0-9]{4,12}$/i
const PIXEL_RE = /^\d{6,20}$/

export function isValidGa4(id: string): boolean {
  return GA4_RE.test(id)
}

export function isValidPixel(id: string): boolean {
  return PIXEL_RE.test(id)
}

// --- self-check — run with `npx tsx src/saas/lib/tracking.ts` ---
const isCli =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] != null &&
  /tracking(\.ts|\.js)?$/.test(process.argv[1])

if (isCli) {
  function check(cond: boolean, msg: string) {
    if (!cond) throw new Error(msg)
  }
  try {
    const xssPayload = "XSS'); window.__xss_fired=true; //"
    check(!isValidGa4(xssPayload), 'GA4 validator should reject the XSS payload')
    check(!isValidPixel(xssPayload), 'Pixel validator should reject the XSS payload')
    check(isValidGa4('G-ABC123'), 'GA4 validator should accept a real GA4 id')
    check(isValidPixel('123456789'), 'Pixel validator should accept a real Pixel id')
    console.log('tracking.ts self-check passed')
  } catch (err) {
    console.error('tracking.ts self-check FAILED:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}
