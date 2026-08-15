import { describe, expect, it } from 'vitest'
import { translations } from './translations'
import { isSuspectedDrift, leafEntries, leafPaths } from '../test/localeDictHelpers'

const LRI = '⁦' // LEFT-TO-RIGHT ISOLATE
const PDI = '⁩' // POP DIRECTIONAL ISOLATE

describe('locale key parity (en / ar)', () => {
  const enPaths = new Set(leafPaths(translations.en))
  const arPaths = new Set(leafPaths(translations.ar))

  it('ar has exactly the keys en has (nothing missing, nothing extra)', () => {
    const missing = [...enPaths].filter((p) => !arPaths.has(p))
    const extra = [...arPaths].filter((p) => !enPaths.has(p))
    expect(missing, `ar is missing keys en has: ${missing.join(', ')}`).toEqual([])
    expect(extra, `ar has keys en doesn't: ${extra.join(', ')}`).toEqual([])
  })
})

describe('leafPaths parity check — proof it actually catches a regression', () => {
  it('flags an object key removed from one side', () => {
    const withKey = { nav: { home: 'Home', pricing: 'Pricing' } }
    const missingKey = { nav: { home: 'الرئيسية' } }
    const missing = leafPaths(withKey).filter((p) => !new Set(leafPaths(missingKey)).has(p))
    expect(missing).toEqual(['nav.pricing'])
  })

  it('flags an array element removed from one side (not just object keys)', () => {
    const full = { marquee: ['One', 'Two', 'Three'] }
    const truncated = { marquee: ['One', 'Two'] }
    const missing = leafPaths(full).filter((p) => !new Set(leafPaths(truncated)).has(p))
    expect(missing).toEqual(['marquee[2]'])
  })
})

/**
 * Leaf paths in the `ar` dict that are legitimately Latin-script and should
 * NOT be flagged as untranslated drift. Every entry is a genuine brand name,
 * technical acronym, or language-code label — never prose that should have
 * been translated. `.href` values are excluded structurally below (URLs/
 * anchors are code, not prose, in every locale).
 */
const AR_DRIFT_ALLOWLIST = new Set<string>([
  'langSwitch.en', // "EN" — language-toggle code, not prose
  'langSwitch.ar', // "AR" — language-toggle code, not prose
  'hero.marquee[5]', // "SEO & GEO" — technical acronym pair with no Arabic equivalent in use; en keeps it identical
  'services.also[1]', // "SEO" — same acronym, same reasoning
  'footer.Services[5].label', // "SEO & GEO" — same acronym, same reasoning
  'comparison.columns.us', // "AutoLeadss" — the product's own name, never translated in any locale
  // A CLIENT's registered brand name. Transliterating a real company's name is
  // worse than leaving it Latin — it is not ours to rename. Any future client
  // name lands here for the same reason, and only for the `role` field.
  'work.cases[0].role', // "Lash Cartel Cosmetics"
])

describe('untranslated-string drift (ar block)', () => {
  it('has no ASCII-only English string sitting where Arabic prose belongs', () => {
    const offenders = leafEntries(translations.ar)
      .filter(([path]) => !path.endsWith('.href')) // hrefs are code (URLs/anchors), not prose
      // Same reasoning as .href: the onboarding form's field `id` (the answer
      // key the brief is assembled from) and `type` ('text' | 'textarea') are
      // structure, not copy. They MUST be byte-identical across locales — a
      // "translated" id would break the form. Excluded structurally rather
      // than per-path, because listing ~40 paths in the allowlist would also
      // give cover to a genuinely untranslated label sitting next to them.
      // The prose beside them — .label and .placeholder — is still checked.
      .filter(([path]) => !path.endsWith('.id') && !path.endsWith('.type'))
      .filter(([path]) => !AR_DRIFT_ALLOWLIST.has(path))
      .filter(([, value]) => isSuspectedDrift(value))
      .map(([path, value]) => `${path} = ${JSON.stringify(value)}`)

    expect(offenders, `Untranslated English found in ar:\n${offenders.join('\n')}`).toEqual([])
  })

  it('the drift check actually fires — proof against the real regression this suite catches', () => {
    // This is exactly the adSuite.navLabel bug found in src/saas/i18n.tsx: an
    // English UI label ("Ad Suite") left untranslated in the ar dict.
    expect(isSuspectedDrift('Ad Suite')).toBe(true)
    expect(isSuspectedDrift('مجموعة الإعلانات')).toBe(false) // the actual fix
  })
})

describe('bidi isolation for LTR tokens inside Arabic text', () => {
  it('isolates the WhatsApp number in the public footer', () => {
    expect(translations.ar.footer.waLabel).toBe(`واتساب: ${LRI}+20 110 005 4278${PDI}`)
  })

  it('isolates the WhatsApp number in the chat contact response', () => {
    expect(translations.ar.chat.responses.contact).toContain(`${LRI}+20 110 005 4278${PDI}`)
  })

  it('the isolation check fails without the isolate marks — proof', () => {
    const unisolated = 'واتساب: +20 110 005 4278'
    expect(unisolated).not.toContain(`${LRI}+20 110 005 4278${PDI}`)
  })
})
