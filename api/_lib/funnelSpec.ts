import { isValidGa4, isValidPixel } from '../../src/saas/lib/tracking'
import { isValidHttpsUrl } from '../../src/saas/lib/agencyBrand'
import type { Funnel } from '../../src/saas/types'

/**
 * Strips any field that fails format validation before a funnel spec is ever
 * persisted — the server-side half of the stored-XSS fix for tracking ids
 * (GA4/Pixel — spliced into an inline <script> body) and the thank-you CTA
 * link (spliced into an <a href>). Render-time checks exist too (Published.tsx
 * for tracking, FunnelRenderer.tsx for ctaHref) — both ends must hold, since
 * this is the only server-side gate a caller hitting the API directly (not
 * through the Editor) would ever pass through. Used by both funnel write
 * paths: api/funnels/index.ts (create) and api/funnels/[id].ts (patch).
 */
export function sanitizeFunnelSpec(spec: Funnel['spec']): Funnel['spec'] {
  let out = spec

  if (out.tracking) {
    const tracking = { ...out.tracking }
    if (tracking.ga4Id !== undefined && !isValidGa4(tracking.ga4Id)) delete tracking.ga4Id
    if (tracking.metaPixelId !== undefined && !isValidPixel(tracking.metaPixelId)) delete tracking.metaPixelId
    out = { ...out, tracking }
  }

  const thankYou = out.page?.thankYou
  if (thankYou?.ctaHref !== undefined && !isValidHttpsUrl(thankYou.ctaHref)) {
    out = { ...out, page: { ...out.page, thankYou: { ...thankYou, ctaHref: undefined } } }
  }

  return out
}
