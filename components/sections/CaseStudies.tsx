import { getTranslations } from 'next-intl/server';
import FadeUp from '@/components/shared/FadeUp';

/* Placeholder case study data — clearly marked as samples */
const PLACEHOLDERS = [
  {
    industry: 'Real Estate',
    client: 'Dubai Brokerage',
    result: '3× qualified leads in 45 days',
    quote: 'The chatbot alone cut our response time from hours to under a minute. Viewings went up immediately.',
    flex: 'flex-[1.5]',
    slug: 'sample-real-estate',
  },
  {
    industry: 'E-commerce',
    client: 'UAE Retailer',
    result: 'AED 2.3M in attributed sales',
    quote: 'We went from no system to a fully running operation in under four weeks.',
    flex: 'flex-[1]',
    slug: 'sample-ecommerce',
  },
  {
    industry: 'Real Estate',
    client: 'Off-Plan Developer',
    result: '47 viewings booked via WhatsApp',
    quote: 'The bilingual landing page converted better than anything we ran in-house.',
    flex: 'flex-[1]',
    slug: 'sample-offplan',
  },
] as const;

export default async function CaseStudies() {
  const t = await getTranslations('caseStudies');

  return (
    <section className="py-24 sm:py-32 bg-muted/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

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

        {/* Asymmetric flex cards — 1.5 / 1 / 1 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {PLACEHOLDERS.map(({ industry, client, result, quote, flex, slug }, i) => (
            <FadeUp key={slug} delay={0.08 * i} className={`lg:${flex} flex-1`}>
              <article className="h-full border border-border bg-card rounded-xl p-7 flex flex-col">
                {/* Sample badge */}
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] text-muted-foreground font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    {t('placeholder')}
                  </span>
                </div>

                {/* Industry + client */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-accent uppercase tracking-widest">
                    {industry}
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-xs text-muted-foreground">{client}</span>
                </div>

                {/* Result headline */}
                <p
                  className="font-display font-semibold tracking-tight text-foreground mb-4 flex-1"
                  style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', letterSpacing: '-0.02em' }}
                >
                  {result}
                </p>

                {/* Quote */}
                <blockquote className="border-l-2 border-accent/30 pl-4 mb-5">
                  <p className="text-muted-foreground text-[14px] leading-relaxed italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                </blockquote>

                {/* Read more */}
                <a
                  href={`/case-studies/${slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors group"
                >
                  {t('readMore')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
