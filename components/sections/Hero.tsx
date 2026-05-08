'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

/* ── Placeholder logo marks for trust strip ── */
const LOGOS = [
  'Real Estate Co.',
  'Gulf Ventures',
  'Property Hub',
  'RetailAE',
  'Marina Homes',
  'Dubai Commerce',
  'Al Faris Group',
] as const;

function TrustMarquee({ trustText }: { trustText: string }) {
  return (
    <div className="mt-10 space-y-3">
      <p className="text-white/50 text-xs tracking-widest uppercase">{trustText}</p>
      <div className="relative overflow-hidden h-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex gap-10 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span key={i} className="text-white/30 text-sm font-medium whitespace-nowrap">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Right-side mock UI ── */
function HeroMockUI() {
  return (
    <div className="relative select-none pointer-events-none">
      {/* Response badge */}
      <div className="absolute -top-3 -right-3 z-10 bg-accent text-white rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm">
        ≤60s response · 24/7
      </div>

      {/* WhatsApp lead card */}
      <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-2xl p-4 mb-3 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#25D366] flex-shrink-0" />
          <p className="text-white/50 text-[11px] uppercase tracking-widest">New lead · WhatsApp</p>
        </div>
        <div className="bg-white/10 rounded-xl rounded-tl-none px-3 py-2.5 mb-2">
          <p className="text-white/90 text-sm leading-relaxed">
            Hi, I&apos;m interested in a 2BR in Dubai Marina. Budget AED 130k/yr
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
          <span>Layla A.</span>
          <span>&middot;</span>
          <span>AutoBot replied in 41s</span>
        </div>
      </div>

      {/* Stats card */}
      <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-xl px-4 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-white font-display font-semibold text-3xl leading-none tabular-nums">47</p>
          <p className="text-white/40 text-[11px] mt-1">qualified leads · this month</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 text-sm font-semibold">+31%</p>
          <p className="text-white/30 text-[11px] mt-0.5">vs last month</p>
        </div>
      </div>

      {/* Floating dots decoration */}
      <div className="absolute -bottom-4 -left-6 flex gap-1.5 opacity-30">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent"
            style={{ opacity: 1 - i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main Hero ── */
export default function Hero() {
  const t = useTranslations('hero');
  const prefersReduced = useReducedMotion();

  const ease = [0.25, 0.4, 0.25, 1] as const;

  return (
    <section className="relative overflow-hidden min-h-[100svh] flex flex-col">
      {/* Background photo — Dubai skyline, heavily treated */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=75"
          alt="Dubai skyline"
          fill
          priority
          className="object-cover object-center"
          style={{ filter: 'saturate(0.2) brightness(0.55)' }}
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-foreground/50" />
        {/* Accent tint — very subtle warm orange */}
        <div className="absolute inset-0 bg-accent/[0.06]" />
        {/* Bottom fade into page background */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="grid lg:grid-cols-[1fr_420px] gap-14 lg:gap-20 items-center">

            {/* Left — copy */}
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/[0.06] text-white/60 text-xs tracking-widest uppercase mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {t('eyebrow')}
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                className="font-display font-semibold text-white leading-[1.07] tracking-[-0.03em] mb-5"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5rem)' }}
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease, delay: 0.2 }}
              >
                {t('heading')}
              </motion.h1>

              {/* Subhead */}
              <motion.p
                className="text-white/65 text-lg leading-relaxed mb-8 max-w-xl"
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.32 }}
              >
                {t('subheading')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-col sm:flex-row items-start gap-3"
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.42 }}
              >
                <a
                  href={siteConfig.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors duration-150"
                >
                  {t('ctaPrimary')}
                </a>
                <a
                  href="#pricing"
                  className="inline-flex items-center px-6 py-3 rounded-full border border-white/25 text-white/80 font-medium text-sm hover:bg-white/10 transition-colors duration-150"
                >
                  {t('ctaSecondary')}
                </a>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <TrustMarquee trustText={t('trustText')} />
              </motion.div>
            </div>

            {/* Right — mock UI (desktop only) */}
            <motion.div
              className="hidden lg:block"
              initial={prefersReduced ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.5 }}
            >
              <HeroMockUI />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
