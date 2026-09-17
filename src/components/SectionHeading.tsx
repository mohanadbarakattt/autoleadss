import { motion } from 'framer-motion'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  titleAccent?: string
  sub?: string
  dark?: boolean
  center?: boolean
}

export default function SectionHeading({ eyebrow, title, titleAccent, sub, dark = false, center = false }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
      className={`mb-14 max-w-3xl ${center ? 'mx-auto text-center' : ''}`}
    >
      <div className={`mb-4 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
        <span className="h-px w-8 bg-accent" />
        <p className="eyebrow text-accent">{eyebrow}</p>
      </div>
      <h2
        className="font-display font-bold"
        style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.08, color: dark ? '#FAFAF7' : '#0A0A0B' }}
      >
        {title}
        {titleAccent && (
          <>
            {' '}
            <span className="text-gradient-accent block">{titleAccent}</span>
          </>
        )}
      </h2>
      {sub && (
        <p className={`mt-4 text-base leading-relaxed max-w-xl ${center ? 'mx-auto' : ''} ${dark ? 'text-white/70' : 'text-muted-fg'}`}>
          {sub}
        </p>
      )}
    </motion.div>
  )
}
