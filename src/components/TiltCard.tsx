import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

type TiltCardProps = {
  children: ReactNode
  className?: string
  /** max tilt in degrees */
  intensity?: number
  /** show a moving specular glare */
  glare?: boolean
  style?: React.CSSProperties
}

/**
 * Mouse-tracking 3D tilt card with an optional specular glare.
 * Respects prefers-reduced-motion and disables itself on touch-only devices.
 */
export default function TiltCard({ children, className = '', intensity = 9, glare = true, style }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), { stiffness: 220, damping: 22 })
  const glareX = useTransform(px, [0, 1], ['20%', '80%'])
  const glareY = useTransform(py, [0, 1], ['20%', '80%'])
  const glareBg = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%)`,
  )

  function onMove(e: React.MouseEvent) {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  function onLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          ...style,
        }}
        className={`relative will-change-transform ${className}`}
      >
        {children}
        {glare && !reduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  )
}
