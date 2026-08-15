import { motion } from 'framer-motion'
import { Film, Grid3x3, Monitor, ExternalLink } from 'lucide-react'
import { useT } from '../../i18n/LocaleProvider'
import { UGC_VIDEOS, POSTS, REDESIGNS, PLACEHOLDER_COUNTS } from '../../showcase/items'

/**
 * The work showcase: UGC videos, social posts and website redesigns.
 *
 * Content comes from src/showcase/items.ts, which ships EMPTY. Empty categories
 * render labelled placeholder slots rather than vanishing, for two reasons:
 * the section keeps its designed shape while the owner fills it, and an empty
 * category stays visibly empty instead of quietly disappearing from the page.
 *
 * There is deliberately no metrics/result slot on these cards — see the note in
 * items.ts. Results need a source; a showcase shows work, not outcomes.
 */

function Placeholder({ ratio, label }: { ratio: string; label: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-center"
      style={{ aspectRatio: ratio }}
    >
      <span className="text-[10px] font-semibold uppercase leading-relaxed tracking-[0.14em] text-muted-fg">
        {label}
      </span>
    </div>
  )
}

function GroupHeading({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>{title}</h3>
        <p className="mt-1 text-sm text-muted-fg">{sub}</p>
      </div>
    </div>
  )
}

export default function Showcase() {
  const t = useT()
  const s = t.showcase

  return (
    <section id="showcase" className="section-padding bg-background">
      <div className="content-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <p className="eyebrow text-accent">{s.eyebrow}</p>
            <span className="h-px w-8 bg-accent" />
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            {s.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-fg">{s.sub}</p>
        </motion.div>

        {/* ---------- UGC videos ---------- */}
        <div className="mb-16">
          <GroupHeading icon={<Film size={18} />} title={s.ugcTitle} sub={s.ugcSub} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {UGC_VIDEOS.length > 0
              ? UGC_VIDEOS.map((v, i) => (
                  <figure key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    {/* object-cover, not the browser default.
                        A <video> defaults to object-fit:contain, so a clip whose
                        native ratio is not 9:16 gets black bars inside the tile
                        — two of these are 834x1112 (3:4) and looked broken next
                        to the 9:16 ones. Cover fills the tile instead; every
                        subject here is centre-framed, so the small side crop
                        takes nothing that matters.
                        preload="metadata" keeps the page light: the browser
                        fetches a few KB per clip, not the whole file, until
                        someone actually presses play. */}
                    <video
                      src={v.src}
                      poster={v.poster}
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={v.title}
                      className="w-full bg-black object-cover"
                      style={{ aspectRatio: '9 / 16' }}
                    />
                    <figcaption className="px-3 py-2.5 text-xs text-muted-fg">
                      {v.title}
                      {v.client && <span className="block text-[11px] text-foreground">{v.client}</span>}
                    </figcaption>
                  </figure>
                ))
              : Array.from({ length: PLACEHOLDER_COUNTS.ugc }, (_, i) => (
                  <Placeholder key={i} ratio="9 / 16" label={s.slotUgc} />
                ))}
          </div>
        </div>

        {/* ---------- Posts ---------- */}
        <div className="mb-16">
          <GroupHeading icon={<Grid3x3 size={18} />} title={s.postsTitle} sub={s.postsSub} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {POSTS.length > 0
              ? POSTS.map((p, i) => (
                  <figure key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <img src={p.src} alt={p.alt} loading="lazy" className="aspect-square w-full object-cover" />
                    {(p.kind || p.client) && (
                      <figcaption className="px-3 py-2 text-[11px] text-muted-fg">
                        {p.kind}
                        {p.kind && p.client ? ' · ' : ''}
                        {p.client}
                      </figcaption>
                    )}
                  </figure>
                ))
              : Array.from({ length: PLACEHOLDER_COUNTS.posts }, (_, i) => (
                  <Placeholder key={i} ratio="1 / 1" label={s.slotPost} />
                ))}
          </div>
        </div>

        {/* ---------- Website redesigns ---------- */}
        <div>
          <GroupHeading icon={<Monitor size={18} />} title={s.sitesTitle} sub={s.sitesSub} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {REDESIGNS.length > 0
              ? REDESIGNS.map((r, i) => (
                  <figure key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <img src={r.after} alt={r.alt} loading="lazy" className="w-full object-cover" style={{ aspectRatio: '16 / 10' }} />
                    <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted-fg">
                      <span>{r.client ?? r.alt}</span>
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                        >
                          {s.visitSite}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </figcaption>
                  </figure>
                ))
              : Array.from({ length: PLACEHOLDER_COUNTS.redesigns }, (_, i) => (
                  <Placeholder key={i} ratio="16 / 10" label={s.slotSite} />
                ))}
          </div>
        </div>
      </div>
    </section>
  )
}
