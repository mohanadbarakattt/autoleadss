import { getTranslations } from 'next-intl/server';
import FadeUp from '@/components/shared/FadeUp';

/* ── Accent mark replacing icon-in-circle ── */
function AccentMark({ index }: { index: number }) {
  const labels = ['01', '02', '03'];
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-5 h-[2px] bg-accent" />
      <span className="font-mono text-[11px] text-accent tracking-widest">{labels[index]}</span>
    </div>
  );
}

interface CardProps {
  index: number;
  title: string;
  description: string;
  delay: number;
}

function ProblemCard({ index, title, description, delay }: CardProps) {
  return (
    <FadeUp delay={delay} className="h-full">
      <article className="h-full border border-border bg-card rounded-xl p-7 flex flex-col hover:border-accent/25 transition-colors duration-300">
        <AccentMark index={index} />
        <h3 className="font-display font-semibold text-xl tracking-tight mb-3">{title}</h3>
        <p className="text-muted-foreground text-[15px] leading-relaxed flex-1">{description}</p>
      </article>
    </FadeUp>
  );
}

export default async function Problem() {
  const t = await getTranslations('problem');

  const cards = [
    { key: 'slow', flex: 'lg:flex-[2]' },
    { key: 'scattered', flex: 'lg:flex-[1.5]' },
    { key: 'noDestination', flex: 'lg:flex-[1.5]' },
  ] as const;

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Section header — left-aligned, not centered */}
        <FadeUp>
          <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
            {t('eyebrow')}
          </p>
        </FadeUp>
        <FadeUp delay={0.08}>
          <h2
            className="font-display font-semibold tracking-tight text-foreground mb-14"
            style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
          >
            {t('heading')}
          </h2>
        </FadeUp>

        {/* Asymmetric card row — 40 / 30 / 30 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {cards.map(({ key, flex }, i) => (
            <div key={key} className={`flex-1 ${flex}`}>
              <ProblemCard
                index={i}
                title={t(`cards.${key}.title`)}
                description={t(`cards.${key}.description`)}
                delay={0.1 + i * 0.08}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
