import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/config/site';

/* ── Social SVG icons ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.17 8.17 0 0 0 4.79 1.53V6.78a4.85 4.85 0 0 1-1.03-.09z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border bg-background">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand block */}
          <div className="lg:col-span-1">
            <div className="font-display font-semibold text-[17px] tracking-tight mb-3">
              AutoLeads<span className="text-accent">s</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-[220px]">
              {t('tagline')}
            </p>
            <p className="text-xs text-muted-foreground mb-5">{t('location')}</p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <InstagramIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LinkedInIcon className="w-[18px] h-[18px]" />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <TikTokIcon className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {/* Navigation links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              {t('links.title')}
            </p>
            <ul className="space-y-2.5">
              {(
                [
                  ['services', '/#services'],
                  ['pricing', '/#pricing'],
                  ['faq', '/#faq'],
                  ['caseStudies', '/case-studies'],
                  ['contact', '/#contact'],
                ] as const
              ).map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`links.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              {t('legal.title')}
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('legal.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              {t('connect.title')}
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
                  {t('connect.whatsapp')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
                >
                  {t('connect.email')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{t('copyright')}</p>
        <p className="text-xs text-muted-foreground">
          Dubai, UAE &middot; {siteConfig.contactEmail}
        </p>
      </div>
    </footer>
  );
}
