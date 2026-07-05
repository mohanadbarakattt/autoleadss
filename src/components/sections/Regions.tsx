import { motion } from 'framer-motion'
import { useT } from '../../i18n/LocaleProvider'

/** City pins positioned on an abstract dotted map of the UAE + Egypt corridor. */
const CITIES = [
  { name: 'Cairo', ar: 'القاهرة', x: 30, y: 44, big: true },
  { name: 'Alexandria', ar: 'الإسكندرية', x: 26, y: 33 },
  { name: 'Riyadh', ar: 'الرياض', x: 58, y: 55 },
  { name: 'Dubai', ar: 'دبي', x: 76, y: 50, big: true },
  { name: 'Abu Dhabi', ar: 'أبوظبي', x: 72, y: 55 },
  { name: 'Sharjah', ar: 'الشارقة', x: 78, y: 47 },
]

// dotted landmass field
const DOTS: { x: number; y: number }[] = []
for (let r = 0; r < 14; r++) {
  for (let c = 0; c < 30; c++) {
    DOTS.push({ x: 4 + c * 3.1, y: 12 + r * 5.6 })
  }
}

export default function Regions() {
  const t = useT()
  const isAr = t.regions.title === 'حيث نعمل'

  return (
    <section className="relative overflow-hidden py-24" style={{ background: '#0A0A0B' }}>
      {/* ambient glow */}
      <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 45%, rgba(255,92,42,0.18) 0%, transparent 70%)' }} />
      <div className="content-width relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[38%_62%]">
          {/* copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <p className="eyebrow text-accent">{t.regions.eyebrow}</p>
            </div>
            <h2 className="font-display font-bold text-white" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {t.regions.title}
            </h2>
            <p className="mt-4 max-w-sm text-white/60">{t.regions.sub}</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {t.regions.stats.map((s, i) => (
                <div key={i}>
                  <p className="font-display text-3xl font-bold text-gradient-accent">{s.v}</p>
                  <p className="mt-1 text-[11px] text-white/50">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative"
          >
            <svg viewBox="0 0 100 100" className="w-full" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
              {/* dot grid landmass */}
              {DOTS.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={0.5} fill="rgba(255,255,255,0.08)" />
              ))}
              {/* connection arcs from Cairo to the Gulf */}
              {CITIES.filter(c => c.name !== 'Cairo').map((c, i) => (
                <path
                  key={i}
                  d={`M30 44 Q ${(30 + c.x) / 2} ${Math.min(44, c.y) - 12} ${c.x} ${c.y}`}
                  fill="none"
                  stroke="url(#regGrad)"
                  strokeWidth="0.4"
                  strokeDasharray="1.5 1.5"
                  opacity="0.5"
                />
              ))}
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop stopColor="#FF5C2A" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#FF5C2A" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* pins */}
              {CITIES.map((c, i) => (
                <g key={i}>
                  <circle cx={c.x} cy={c.y} r={c.big ? 2.4 : 1.6} fill="#FF5C2A" opacity="0.25">
                    <animate attributeName="r" values={`${c.big ? 2.4 : 1.6};${c.big ? 4 : 3};${c.big ? 2.4 : 1.6}`} dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="2.4s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={c.x} cy={c.y} r={c.big ? 1.4 : 1} fill="#FF5C2A" />
                  <text x={c.x} y={c.y - (c.big ? 3.4 : 2.6)} textAnchor="middle" fill="white" fontSize={c.big ? 2.6 : 2.1} fontWeight="600" style={{ fontFamily: 'Switzer, sans-serif' }}>
                    {isAr ? c.ar : c.name}
                  </text>
                </g>
              ))}
            </svg>
            {/* flags */}
            <div className="mt-2 flex items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">🇦🇪 {t.regions.uae}</span>
              <span className="h-4 w-px bg-white/15" />
              <span className="flex items-center gap-2">🇪🇬 {t.regions.egypt}</span>
              <span className="h-4 w-px bg-white/15" />
              <span className="flex items-center gap-2">🇸🇦 {t.regions.gulf}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
