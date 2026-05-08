import { getTranslations } from 'next-intl/server';
import FadeUp from '@/components/shared/FadeUp';

const ITEMS = ['uae', 'ownership', 'aligned', 'noLockIn'] as const;

/* Asymmetric: 7/5 first row, 5/7 second row — same zigzag pattern as Results */
const COL_SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7'] as const;

export default async function WhyUs() {
  const t = await getTranslations('whyUs');

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {ITEMS.map((key, i) => (
            <FadeUp key={key} delay={0.07 * i} className={`${COL_SPANS[i]} sm:col-span-1`}>
              <article className="h-full border border-border bg-card rounded-xl p-7 flex flex-col hover:border-accent/20 transition-colors duration-300">
                {/* Accent line marker — same pattern as Problem section */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-5 h-[2px] bg-accent" />
                </div>
                <h3 className="font-display font-semibold text-xl tracking-tight mb-3">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed flex-1">
                  {t(`items.${key}.description`)}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
