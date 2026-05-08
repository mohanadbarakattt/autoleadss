import { getTranslations } from 'next-intl/server';
import FadeUp from '@/components/shared/FadeUp';

const STAT_KEYS = ['responseTime', 'conversionRate', 'optimizationCycle', 'transparency'] as const;

/* Asymmetric grid: 5/7 first row, 7/5 second row — zigzag, not uniform */
const COL_SPANS = ['lg:col-span-5', 'lg:col-span-7', 'lg:col-span-7', 'lg:col-span-5'] as const;

export default async function Results() {
  const t = await getTranslations('results');

  return (
    <section className="py-24 sm:py-32 bg-muted/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header — left-aligned */}
        <div className="max-w-2xl mb-14">
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

        {/* Stat grid — asymmetric col-spans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-8">
          {STAT_KEYS.map((key, i) => {
            const isFirst = i === 0;
            const value = t(`stats.${key}.value`);
            const unit = t(`stats.${key}.unit`);
            const label = t(`stats.${key}.label`);
            const colClass = COL_SPANS[i];

            return (
              <FadeUp key={key} delay={0.07 * i} className={`${colClass} sm:col-span-1`}>
                <div
                  className={`h-full border rounded-xl p-7 flex flex-col justify-between min-h-[160px] ${
                    isFirst
                      ? 'border-accent/40 bg-card'
                      : 'border-border bg-card hover:border-border/70 transition-colors'
                  }`}
                >
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span
                      className={`font-display font-semibold leading-none tracking-tight tabular-nums ${
                        isFirst ? 'text-accent' : 'text-foreground'
                      }`}
                      style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)' }}
                    >
                      {value}
                    </span>
                    {unit && (
                      <span
                        className={`font-display font-semibold text-xl ${
                          isFirst ? 'text-accent/70' : 'text-muted-foreground'
                        }`}
                      >
                        {unit}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-snug">{label}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Callout */}
        <FadeUp delay={0.1}>
          <div className="border border-border rounded-xl px-7 py-5 bg-card max-w-2xl">
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Note: </span>
              {t('callout')}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
