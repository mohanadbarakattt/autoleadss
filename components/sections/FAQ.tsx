'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import FadeUp from '@/components/shared/FadeUp';
import { cn } from '@/lib/utils';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn('flex-shrink-0 transition-transform duration-200', open && 'rotate-180')}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FAQItem {
  q: string;
  a: string;
}

function Accordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
              aria-expanded={isOpen}
            >
              <span className={cn(
                'font-medium text-[15px] leading-snug transition-colors',
                isOpen ? 'text-foreground' : 'text-foreground/80'
              )}>
                {item.q}
              </span>
              <ChevronIcon open={isOpen} />
            </button>

            {/* Answer — CSS max-height transition */}
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <p className="pb-5 text-muted-foreground text-[15px] leading-relaxed pr-8">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQ() {
  const t = useTranslations('faq');
  const items = t.raw('items') as FAQItem[];

  return (
    /* Narrow container — FAQs read better at max-w-3xl */
    <section id="faq" className="py-24 sm:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <FadeUp>
          <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
            {t('eyebrow')}
          </p>
        </FadeUp>
        <FadeUp delay={0.08}>
          <h2
            className="font-display font-semibold tracking-tight text-foreground mb-12"
            style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
          >
            {t('heading')}
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Accordion items={items} />
        </FadeUp>
      </div>
    </section>
  );
}
