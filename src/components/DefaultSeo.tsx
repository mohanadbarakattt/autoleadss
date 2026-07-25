import { Helmet } from 'react-helmet-async'

/**
 * The app-wide default <head> SEO tags, and the other half of a two-part fix —
 * read this together with the `data-rh="true"` markers in index.html.
 *
 * THE BUG: react-helmet-async only ever reconciles tags carrying its own
 * `data-rh` marker (`updateTags` in its source does
 * `head.querySelectorAll(\`${type}[data-rh]\`)`). index.html's static SEO tags
 * carry no marker, so Helmet could never see them — every route that set a
 * description or og:title just APPENDED a second tag beside the static one.
 * Crawlers, social unfurlers and any naive `querySelector` read the first match
 * in document order, which was always the generic marketing copy — so per-route
 * SEO silently did nothing on real published merchant pages, while looking
 * perfectly correct in devtools.
 *
 * WHY BOTH HALVES ARE REQUIRED:
 *  - Marking index.html's tags `data-rh="true"` alone is not enough: when a
 *    route's computed Helmet state contains NO tags of a type, `updateTags`
 *    deletes every `[data-rh]` tag of that type. The static defaults would be
 *    removed and nothing would replace them, leaving pages with no description
 *    at all.
 *  - Rendering these defaults in Helmet alone is not enough either: a crawler
 *    that doesn't execute JS only ever sees raw index.html, so the real values
 *    must physically remain in the HTML.
 * Together: the static tags stay in index.html for no-JS crawlers, and because
 * they are marked, Helmet adopts and REPLACES them instead of duplicating.
 *
 * These values are deliberately byte-identical to index.html's. Helmet keeps an
 * existing node when `isEqualNode` matches, so on first paint this is a no-op —
 * no removal, no re-append, no flicker — and it only diverges once a route
 * overrides a tag (Helmet resolves meta by name/property, later mount wins).
 *
 * ONLY tags listed here may carry `data-rh` in index.html. Marking a tag that
 * nothing re-asserts (charset, viewport, icons, hreflang, fonts) would get it
 * deleted on the first Helmet render.
 */

const TITLE = 'AutoLeadss — Growth & Sales Systems for UAE & Egypt'
const DESCRIPTION =
  'We build and run complete sales systems for UAE & Egypt: sales funnels, landing pages, Google Ads, social media, AI chatbots, and SEO/GEO.'
const URL = 'https://autoleadss.com'
const IMAGE = 'https://autoleadss.com/og-image.png'

export default function DefaultSeo() {
  return (
    <Helmet defer={false}>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={URL} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={IMAGE} />
    </Helmet>
  )
}
