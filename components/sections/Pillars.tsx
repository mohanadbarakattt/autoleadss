import { getTranslations } from 'next-intl/server';
import FadeUp from '@/components/shared/FadeUp';

/* ── Custom SVG icons — single-line, 28px, monochrome ── */
function LandingPageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="22" height="18" rx="2" />
      <line x1="3" y1="11" x2="25" y2="11" />
      <circle cx="7" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="8" r="1" fill="currentColor" stroke="none" />
      <rect x="7" y="15" width="14" height="2" rx="1" />
      <rect x="9" y="19" width="10" height="1.5" rx="0.75" />
    </svg>
  );
}

function SocialMediaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3,21 9,14 14,17 22,7" />
      <polyline points="17,7 22,7 22,12" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChatbotIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 6h18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 3.5V8a2 2 0 0 1 2-2z" />
      <line x1="9" y1="12" x2="19" y2="12" />
      <line x1="9" y1="15.5" x2="15" y2="15.5" />
    </svg>
  );
}

function AdsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="14" cy="14" r="10" />
      <circle cx="14" cy="14" r="5.5" />
      <line x1="14" y1="4" x2="14" y2="7.5" />
      <line x1="14" y1="20.5" x2="14" y2="24" />
      <line x1="4" y1="14" x2="7.5" y2="14" />
      <line x1="20.5" y1="14" x2="24" y2="14" />
    </svg>
  );
}

const ICONS = [LandingPageIcon, SocialMediaIcon, ChatbotIcon, AdsIcon] as const;

/* ── Check mark for bullet points ── */
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface PillarCardProps {
  icon: React.ComponentType;
  title: string;
  subtitle: string;
  bullets: string[];
  outcome: string;
  large?: boolean;
  delay: number;
}

function PillarCard({ icon: Icon, title, subtitle, bullets, outcome, large, delay }: PillarCardProps) {
  return (
    <FadeUp delay={delay} className="h-full">
      <article
        className={`h-full border border-border rounded-xl bg-card p-7 flex flex-col gap-5 hover:border-border/80 hover:bg-muted/30 transition-colors duration-300 ${
          large ? 'lg:p-9' : ''
        }`}
      >
        {/* Icon */}
        <div className="text-foreground/60">
          <Icon />
        </div>

        {/* Title + subtitle */}
        <div>
          <h3 className="font-display font-semibold text-xl tracking-tight mb-1.5">{title}</h3>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        {/* Bullets */}
        <ul className="space-y-2 flex-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px] text-foreground/80">
              <Check />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Outcome */}
        <div className="pt-4 border-t border-border">
          <p className="text-[13px] text-accent font-medium">{outcome}</p>
        </div>
      </article>
    </FadeUp>
  );
}

type PillarKey = 'landingPages' | 'socialMedia' | 'chatbots' | 'adCampaigns';

export default async function Pillars() {
  const t = await getTranslations('pillars');

  const pillars: { key: PillarKey; large: boolean }[] = [
    { key: 'landingPages', large: true },
    { key: 'socialMedia', large: false },
    { key: 'chatbots', large: false },
    { key: 'adCampaigns', large: true },
  ];

  return (
    <section id="services" className="py-24 sm:py-32 bg-muted/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Section header */}
        <div className="max-w-3xl mb-14">
          <FadeUp>
            <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
              {t('eyebrow')}
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              className="font-display font-semibold tracking-tight text-foreground mb-4"
              style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
            >
              {t('heading')}
            </h2>
          </FadeUp>
          <FadeUp delay={0.14}>
            <p className="text-muted-foreground text-lg leading-relaxed">{t('subheading')}</p>
          </FadeUp>
        </div>

        {/* Bento grid — asymmetric 2 rows */}
        {/* Row 1: large (7 cols) + medium (5 cols) */}
        {/* Row 2: medium (5 cols) + large (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {pillars.map(({ key, large }, i) => {
            const Icon = ICONS[i];
            const colClass = i === 0 ? 'lg:col-span-7'
              : i === 1 ? 'lg:col-span-5'
              : i === 2 ? 'lg:col-span-5'
              : 'lg:col-span-7';

            return (
              <div key={key} className={colClass}>
                <PillarCard
                  icon={Icon}
                  title={t(`items.${key}.title`)}
                  subtitle={t(`items.${key}.subtitle`)}
                  bullets={(t.raw(`items.${key}.bullets`) as string[])}
                  outcome={t(`items.${key}.outcome`)}
                  large={large}
                  delay={0.08 * i}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
