import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useT } from '../i18n/LocaleProvider'

export default function LashCartelProof({ compact = false, showLink = true }: { compact?: boolean; showLink?: boolean }) {
  const t = useT()
  const { localePath } = useLocale()
  const q = t.testimonial

  return (
    <figure className={compact ? 'mt-6' : 'mt-10 max-w-2xl'}>
      <blockquote className="border-s-2 border-accent/80 ps-4">
        <p className={`font-serif italic leading-snug text-white/90 ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>
          “{q.quote}”
        </p>
      </blockquote>
      <figcaption className="mt-3 ps-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
        — {q.by}
      </figcaption>
      <p className={`ps-4 leading-relaxed text-white/45 ${compact ? 'mt-3 text-[12px]' : 'mt-4 text-sm'}`}>{q.studioNote}</p>
      {showLink && (
        <Link
          to={localePath('/demo/lashes')}
          className="mt-4 inline-flex items-center gap-1.5 ps-4 text-sm text-accent hover:underline"
        >
          {q.openDemo}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </figure>
  )
}
