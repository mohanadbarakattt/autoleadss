import { useEffect, useRef, useState, type ReactNode } from 'react'

type VideoSlotProps = {
  /** Path to the explainer clip, e.g. '/media/benefit-chatbot.mp4'. Doesn't need to
   * exist yet — see `placeholder` below. */
  src: string
  poster?: string
  /** Applied to the <video> element only, so `placeholder` can keep its own natural
   * sizing (a mockup, a gradient panel, ...) without fighting video-specific classes
   * like aspect-ratio/object-fit. */
  className?: string
  /** Describes the clip for assistive tech. Omit for a purely decorative loop. */
  ariaLabel?: string
  /** Rendered as-is whenever the file at `src` is missing (404) or fails to load —
   * this IS the "poster/placeholder until a video exists" behavior, so pass the
   * current best static stand-in (an existing mockup, a CSS gradient panel, ...). */
  placeholder: ReactNode
}

/** Reusable slot for the explainer videos referenced in public/media/MANIFEST.md.
 * Renders the real clip once it exists at `src`; until then (or if it errors),
 * falls back to `placeholder` so the section never shows a broken video icon. */
export default function VideoSlot({ src, poster, className, ariaLabel, placeholder }: VideoSlotProps) {
  const [failed, setFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) v.pause()
  }, [])

  if (failed) return <>{placeholder}</>

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      onError={() => setFailed(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
