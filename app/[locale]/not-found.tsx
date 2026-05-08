import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-muted-foreground mb-4">404</p>
      <h1 className="font-display font-semibold text-3xl tracking-tight mb-3">
        {t('heading')}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-sm">{t('body')}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium transition-opacity hover:opacity-80"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
