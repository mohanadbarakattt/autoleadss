/**
 * Test-only helpers for the locale key-parity / untranslated-drift guards
 * (src/i18n/translations.test.ts and src/saas/i18n.test.tsx). Both files need
 * the identical "walk every leaf value" logic — only the allowlist per file
 * differs — so it lives here once rather than being copy-pasted twice.
 */

/** Recursively collects [path, value] for every leaf STRING in a locale dict.
 * Arrays are walked by index (e.g. `hero.marquee[2]`), so a missing/extra
 * array entry is caught, not just a missing object key. */
export function leafEntries(obj: unknown, prefix = ''): [string, string][] {
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => leafEntries(v, `${prefix}[${i}]`))
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>).flatMap((k) =>
      leafEntries((obj as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k),
    )
  }
  return typeof obj === 'string' ? [[prefix, obj]] : []
}

export function leafPaths(obj: unknown): string[] {
  return leafEntries(obj).map(([path]) => path)
}

const FULLY_ASCII = /^[\x00-\x7F]*$/
const HAS_LATIN_LETTER = /[A-Za-z]/

/** A leaf is suspected "untranslated drift" if its value is entirely ASCII
 * (zero Arabic-script characters) AND contains at least one Latin letter —
 * i.e. it reads as plain English/Latin sitting where Arabic prose belongs.
 * Mixed strings (Arabic sentence with an embedded Latin brand/tech word) are
 * NOT flagged — that's normal code-switching, not drift. */
export function isSuspectedDrift(value: string): boolean {
  return FULLY_ASCII.test(value) && HAS_LATIN_LETTER.test(value)
}
