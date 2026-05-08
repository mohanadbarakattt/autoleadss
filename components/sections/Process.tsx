import { getTranslations } from 'next-intl/server';
import FadeUp from '@/components/shared/FadeUp';

const STEPS = ['discovery', 'setup', 'launch', 'optimize'] as const;

export default async function Process() {
  const t = await getTranslations('process');

  return (
    /* Deliberately asymmetric padding to break the even-spacing pattern */
    <section id="process" className="pt-28 pb-20 sm:pt-40 sm:pb-24 bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header — 60/40 split: text left, nothing right = gives breathing room */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <FadeUp>
            <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
              {t('eyebrow')}
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              className="font-display font-semibold tracking-tight text-foreground"
              style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
            >
              {t('heading')}
            </h2>
          </FadeUp>
        </div>

        {/* ── Desktop: horizontal timeline ── */}
        <div className="hidden lg:block">
          {/* Connecting line */}
          <div className="relative mb-10">
            <div className="absolute top-5 left-[2.5rem] right-[2.5rem] h-px bg-border" />
            <div className="grid grid-cols-4 gap-4">
              {STEPS.map((step, i) => (
                <FadeUp key={step} delay={0.1 + i * 0.1}>
                  <div className="relative pt-0">
                    {/* Number badge */}
                    <div className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center mb-5 relative z-10">
                      <span className="font-mono text-[11px] font-medium text-muted-foreground">
                        0{i + 1}
                      </span>
                    </div>

                    {/* Week label */}
                    <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-2">
                      {t(`steps.${step}.week`)}
                    </p>

                    {/* Title */}
                    <h3 className="font-display font-semibold text-lg tracking-tight mb-2.5">
                      {t(`steps.${step}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-[14px] leading-relaxed">
                      {t(`steps.${step}.description`)}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical timeline ── */}
        <div className="lg:hidden space-y-0">
          {STEPS.map((step, i) => (
            <FadeUp key={step} delay={0.08 * i}>
              <div className="relative flex gap-5 pb-10 last:pb-0">
                {/* Left: number + vertical line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center z-10 relative">
                    <span className="font-mono text-[11px] font-medium text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" />
                  )}
                </div>

                {/* Right: content */}
                <div className="pt-1 pb-4">
                  <p className="font-mono text-[11px] text-accent uppercase tracking-widest mb-1.5">
                    {t(`steps.${step}.week`)}
                  </p>
                  <h3 className="font-display font-semibold text-lg tracking-tight mb-2">
                    {t(`steps.${step}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    {t(`steps.${step}.description`)}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
