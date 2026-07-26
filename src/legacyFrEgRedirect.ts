/**
 * The 'fr-eg' (Franco/Arabizi) locale was removed — its routes no longer exist.
 * A bookmarked or shared /fr-eg/... URL must not dead-end on the generic 404, so
 * main.tsx redirects it through this pure path-mapper into the equivalent /ar/...
 * URL (Arabic is the closer register for a Franco reader — same call made for a
 * stale persisted locale in src/saas/i18n.tsx's readStoredLocale).
 */
export function frEgToAr(pathname: string, search: string, hash: string): string {
  return `/ar${pathname.slice('/fr-eg'.length)}${search}${hash}`
}
