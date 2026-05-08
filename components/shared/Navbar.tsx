'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

/* ── Wordmark ── */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-0 focus-visible:outline-none">
      <span className="font-display font-semibold text-[17px] tracking-tight text-foreground select-none">
        AutoLeads<span className="text-accent">s</span>
      </span>
    </Link>
  );
}

/* ── WhatsApp SVG icon ── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/* ── Hamburger icon ── */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="16" y2="16" />
          <line x1="16" y1="4" x2="4" y2="16" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="14" x2="17" y2="14" />
        </>
      )}
    </svg>
  );
}

/* ── Language toggle ── */
function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center rounded-full border border-border p-0.5 gap-0.5 text-xs font-medium">
      <button
        onClick={() => switchLocale('en')}
        aria-label="Switch to English"
        className={cn(
          'px-2.5 py-1 rounded-full transition-colors duration-150',
          locale === 'en'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale('ar')}
        aria-label="تغيير اللغة إلى العربية"
        className={cn(
          'px-2.5 py-1 rounded-full transition-colors duration-150',
          locale === 'ar'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        AR
      </button>
    </div>
  );
}

/* ── Nav links ── */
const NAV_ANCHORS = [
  { key: 'services' as const, href: '#services' },
  { key: 'process' as const, href: '#process' },
  { key: 'pricing' as const, href: '#pricing' },
  { key: 'faq' as const, href: '#faq' },
] as const;

/* ── Main Navbar ── */
export default function Navbar() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_ANCHORS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />

          <a
            href={siteConfig.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            aria-label="Contact via WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
            {t('whatsapp')}
          </a>

          <a
            href={siteConfig.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors duration-150"
          >
            {t('bookCall')}
          </a>
        </div>

        {/* Mobile: language + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-1.5 -mr-1.5 text-foreground"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-5 py-4 flex flex-col gap-4">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_ANCHORS.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              {t('whatsapp')}
            </a>
            <a
              href={siteConfig.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center px-4 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-medium"
            >
              {t('bookCall')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
