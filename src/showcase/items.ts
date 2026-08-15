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

/** Vertical UGC video ads. 9:16. */
export const UGC_VIDEOS: ShowcaseVideo[] = []

/** Social posts — any format: UGC, showcase, informative, avatar, offers. 1:1. */
export const POSTS: ShowcasePost[] = []

/** Websites built or redesigned. */
export const REDESIGNS: ShowcaseRedesign[] = []

/** How many placeholder slots to draw when a category is still empty. */
export const PLACEHOLDER_COUNTS = { ugc: 4, posts: 6, redesigns: 3 } as const
