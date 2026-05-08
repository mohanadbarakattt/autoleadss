'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  tiers,
  contractDiscounts,
  getDiscountedPrice,
  formatAed,
  formatPercent,
  type PricingTier,
  type Industry,
  type ContractLength,
} from '@/config/pricing';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import FadeUp from '@/components/shared/FadeUp';

const CONTRACT_LENGTHS: ContractLength[] = [3, 6, 12];

/* ── Segment toggle — reused for both contract and industry ── */
interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background p-0.5 gap-px">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
            value === opt.value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Check mark ── */
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="#FF5C2A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Performance fee line ── */
function PerformanceFee({
  tier,
  industry,
  locale,
  t,
}: {
  tier: PricingTier;
  industry: Industry | null;
  locale: string;
  t: ReturnType<typeof useTranslations<'pricing'>>;
}) {
  const ecFee = formatPercent(tier.performanceFee.ecommerce, locale);
  const reFee = formatPercent(tier.performanceFee.realEstateCommission, locale);
  const ecText = t('performanceFeeEcommerce', { percent: ecFee });
  const reText = t('performanceFeeRealEstate', { percent: reFee });

  return (
    <div className="text-[13px] text-muted-foreground">
      <span className="font-medium text-foreground/70">{t('performanceFeeLabel')}</span>{' '}
      {(industry === null || industry === 'ecommerce') && (
        <span>{ecText}</span>
      )}
      {industry === null && (
        <>
          {/* Desktop: "or" inline */}
          <span className="hidden sm:inline text-border mx-1.5">or</span>
          {/* Mobile: line break */}
          <br className="sm:hidden" />
        </>
      )}
      {(industry === null || industry === 'realEstate') && (
        <span>{reText}</span>
      )}
    </div>
  );
}

/* ── Tier card ── */
function TierCard({
  tier,
  contractLength,
  industry,
  locale,
  t,
}: {
  tier: PricingTier;
  contractLength: ContractLength;
  industry: Industry | null;
  locale: string;
  t: ReturnType<typeof useTranslations<'pricing'>>;
}) {
  const isGrowth = tier.id === 'growth';
  const discountedPrice = getDiscountedPrice(tier.baseMonthlyAed, contractLength);
  const discount = contractDiscounts[contractLength];
  const savingsPerMonth = tier.baseMonthlyAed - discountedPrice;
  const savingsTotal = savingsPerMonth * contractLength;
  const features = t.raw(`tiers.${tier.id}.features`) as string[];

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-xl border transition-colors duration-200',
        isGrowth
          ? 'border-accent/50 bg-card z-10 sm:-my-4 p-8 sm:py-10'
          : 'border-border bg-card hover:border-border/70 p-7'
      )}
    >
      {/* Most popular badge */}
      {isGrowth && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-white text-xs font-semibold whitespace-nowrap shadow-sm">
            {t('mostPopular')}
          </span>
        </div>
      )}

      {/* Tier name + tagline */}
      <div className="mb-6 mt-2">
        <h3 className="font-display font-semibold text-xl tracking-tight mb-1">
          {t(`tiers.${tier.id}.name`)}
        </h3>
        <p className="text-muted-foreground text-sm">{t(`tiers.${tier.id}.tagline`)}</p>
      </div>

      {/* Price */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-muted-foreground text-sm">from</span>
          <span
            className="font-display font-semibold tracking-tight tabular-nums"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
          >
            {formatAed(discountedPrice, locale)}
          </span>
          <span className="text-muted-foreground text-sm">{t('perMonth')}</span>
        </div>
        {discount > 0 && (
          <p className="text-[13px] text-accent font-medium">
            {t('savingsLabel', { amount: formatAed(savingsTotal, locale) })}
          </p>
        )}
        {discount === 0 && (
          <p className="text-[13px] text-transparent select-none" aria-hidden="true">
            &nbsp;
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] text-foreground/80 leading-snug">
            <Check />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Performance fee */}
      <div className="mb-6 p-3.5 rounded-lg bg-muted/60">
        <PerformanceFee tier={tier} industry={industry} locale={locale} t={t} />
      </div>

      {/* CTA */}
      <a
        href={siteConfig.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center justify-center w-full px-5 py-3 rounded-full text-sm font-medium transition-colors duration-150',
          isGrowth
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'bg-foreground text-background hover:bg-foreground/85'
        )}
      >
        {t('getStarted')}
      </a>
    </article>
  );
}

/* ── Performance fee explainer callout ── */
function PerformanceExplainer({ t }: { t: ReturnType<typeof useTranslations<'pricing'>> }) {
  const points = t.raw('performanceExplainer.points') as string[];

  return (
    <FadeUp>
      <div className="rounded-xl border border-border bg-muted/40 p-7 sm:p-8">
        <h3 className="font-display font-semibold text-lg tracking-tight mb-5">
          {t('performanceExplainer.heading')}
        </h3>
        <ul className="space-y-3">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-[14px] text-muted-foreground leading-relaxed">
              <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-mono text-[9px] text-muted-foreground">{i + 1}</span>
              </div>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </FadeUp>
  );
}

/* ── Main Pricing Section ── */
export default function Pricing() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [contractLength, setContractLength] = useState<ContractLength>(3);
  const [industry, setIndustry] = useState<Industry | null>(null);

  function handleIndustryToggle(value: Industry) {
    setIndustry((prev) => (prev === value ? null : value));
  }

  const contractOptions = CONTRACT_LENGTHS.map((len) => {
    const discount = contractDiscounts[len];
    const discountSuffix = discount > 0 ? ` −${Math.round(discount * 100)}%` : '';
    return {
      value: len.toString() as `${ContractLength}`,
      label: `${t(`contractToggle.${len}` as Parameters<typeof t>[0])}${discountSuffix}`,
    };
  });

  const industryOptions = [
    { value: 'ecommerce' as Industry, label: t('industryToggle.ecommerce') },
    { value: 'realEstate' as Industry, label: t('industryToggle.realEstate') },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
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
            <p className="text-muted-foreground text-[16px] leading-relaxed">{t('subheading')}</p>
          </FadeUp>
        </div>

        {/* Toggles */}
        <FadeUp delay={0.16}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <SegmentToggle
              options={contractOptions}
              value={contractLength.toString() as `${ContractLength}`}
              onChange={(v) => setContractLength(parseInt(v) as ContractLength)}
              size="md"
            />
            <div className="hidden sm:block w-px h-6 bg-border" />
            <SegmentToggle
              options={industryOptions}
              value={industry}
              onChange={handleIndustryToggle}
              size="sm"
            />
          </div>
        </FadeUp>

        {/* Cards */}
        <FadeUp delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 mb-8 sm:py-4">
            {tiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                contractLength={contractLength}
                industry={industry}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </FadeUp>

        {/* Ad spend note */}
        <FadeUp delay={0.1}>
          <p className="text-center text-[13px] text-muted-foreground mb-10">
            {t('adSpendNote')}
          </p>
        </FadeUp>

        {/* Performance fee explainer */}
        <div className="mb-8 max-w-3xl mx-auto">
          <PerformanceExplainer t={t} />
        </div>

        {/* Bottom CTA */}
        <FadeUp delay={0.08}>
          <p className="text-center text-[15px] text-muted-foreground">
            {t('notSure')}{' '}
            <a
              href={siteConfig.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline decoration-border hover:decoration-foreground transition-all"
            >
              {t('bookCallCta')}
            </a>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
