/**
 * The work showcase — UGC videos, social posts and website redesigns.
 *
 * HOW TO ADD YOUR WORK
 * --------------------
 * 1. Drop the file into `src/assets/showcase/`.
 * 2. `import` it at the top of this file.
 * 3. Add an entry to the matching array below.
 *
 * That is the whole job. Any category left empty renders labelled placeholder
 * slots on the site instead of disappearing, so the section keeps its shape
 * while you fill it — and so an empty category is visibly empty rather than
 * silently missing.
 *
 * TWO RULES, both the same rule really:
 *
 *  - Only put work here that AutoLeadss actually produced. This section is the
 *    proof behind the pitch; borrowed or generated "examples" would make it a
 *    lie, and the site's whole claims discipline (src/i18n/claims.test.ts)
 *    exists to stop exactly that.
 *  - Only put a client's name or logo here with their permission. Where you do
 *    not have it, leave `client` undefined — the card renders fine without it.
 *
 * NO METRICS FIELD EXISTS ON PURPOSE. A "+312%" slot on a card is an empty box
 * demanding to be filled, and an empty box is what turns into an invented
 * number. Results belong in a case study with a source behind them
 * (see src/components/sections/Work.tsx).
 */

// ---- Lash Cartel Cosmetics — UGC, published with the owner's permission ----
import ugcUnboxing from '../assets/showcase/ugc-unboxing.mp4'
import ugcUnboxingPoster from '../assets/showcase/ugc-unboxing.jpg'
import ugcApplication from '../assets/showcase/ugc-application.mp4'
import ugcApplicationPoster from '../assets/showcase/ugc-application.jpg'
import ugcDemo from '../assets/showcase/ugc-demo.mp4'
import ugcDemoPoster from '../assets/showcase/ugc-demo.jpg'
import ugcProductPen from '../assets/showcase/ugc-product-pen.mp4'
import ugcProductPenPoster from '../assets/showcase/ugc-product-pen.jpg'
import ugcCloseup from '../assets/showcase/ugc-closeup.mp4'
import ugcCloseupPoster from '../assets/showcase/ugc-closeup.jpg'
import ugcTestimonial from '../assets/showcase/ugc-testimonial.mp4'
import ugcTestimonialPoster from '../assets/showcase/ugc-testimonial.jpg'

export type ShowcaseVideo = {
  /** Imported .mp4/.webm. Vertical, 9:16. */
  src: string
  /** Imported poster frame — shown before the video plays. Strongly recommended. */
  poster?: string
  /** What the viewer is looking at. Also the accessible label. */
  title: string
  /** Client name — ONLY with their permission. */
  client?: string
}

export type ShowcasePost = {
  /** Imported image, square. */
  src: string
  /** Describes the post for screen readers and Google Images. Be specific. */
  alt: string
  /** The format, e.g. 'UGC', 'Showcase', 'Informative', 'Avatar'. */
  kind?: string
  client?: string
}

export type ShowcaseRedesign = {
  /** Imported image of the site we built. */
  after: string
  /** Optional 'before' image — only if you have a genuine screenshot of the old site. */
  before?: string
  alt: string
  /** The live URL, if it is public. Rendered as a real link. */
  url?: string
  client?: string
}

/**
 * Vertical UGC video ads.
 *
 * All six are Lash Cartel Cosmetics, produced by AutoLeadss and published with
 * the owner's permission. Re-encoded for the web (H.264, capped at 720px wide,
 * faststart) — 38MB of originals down to ~8MB, with a poster frame each so the
 * grid never shows black boxes.
 *
 * Titles describe what is actually on screen. Note they say what the video IS,
 * never how it performed — there is no metrics field here on purpose.
 */
export const UGC_VIDEOS: ShowcaseVideo[] = [
  {
    src: ugcUnboxing,
    poster: ugcUnboxingPoster,
    title: 'Unboxing the lash kit',
    client: 'Lash Cartel Cosmetics',
  },
  {
    src: ugcApplication,
    poster: ugcApplicationPoster,
    title: 'Applying a full set at home',
    client: 'Lash Cartel Cosmetics',
  },
  {
    src: ugcDemo,
    poster: ugcDemoPoster,
    title: 'Walkthrough at the vanity',
    client: 'Lash Cartel Cosmetics',
  },
  {
    src: ugcProductPen,
    poster: ugcProductPenPoster,
    title: 'The bond pen, explained',
    client: 'Lash Cartel Cosmetics',
  },
  {
    src: ugcCloseup,
    poster: ugcCloseupPoster,
    title: 'Close-up on the finished lashes',
    client: 'Lash Cartel Cosmetics',
  },
  {
    src: ugcTestimonial,
    poster: ugcTestimonialPoster,
    title: 'First impressions to camera',
    client: 'Lash Cartel Cosmetics',
  },
]

/** Social posts — any format: UGC, showcase, informative, avatar, offers. 1:1. */
export const POSTS: ShowcasePost[] = []

/** Websites built or redesigned. */
export const REDESIGNS: ShowcaseRedesign[] = []

/** How many placeholder slots to draw when a category is still empty. */
export const PLACEHOLDER_COUNTS = { ugc: 4, posts: 6, redesigns: 3 } as const
