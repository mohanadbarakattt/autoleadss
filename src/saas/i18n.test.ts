import { describe, expect, it } from 'vitest'
import { STRINGS } from './i18n'
import { isSuspectedDrift, leafEntries, leafPaths } from '../test/localeDictHelpers'

const LRI = '⁦' // LEFT-TO-RIGHT ISOLATE
const PDI = '⁩' // POP DIRECTIONAL ISOLATE

describe('suite locale key parity (en / ar)', () => {
  const enPaths = new Set(leafPaths(STRINGS.en))
  const arPaths = new Set(leafPaths(STRINGS.ar))

  it('ar has exactly the keys en has (nothing missing, nothing extra)', () => {
    const missing = [...enPaths].filter((p) => !arPaths.has(p))
    const extra = [...arPaths].filter((p) => !enPaths.has(p))
    expect(missing, `ar is missing keys en has: ${missing.join(', ')}`).toEqual([])
    expect(extra, `ar has keys en doesn't: ${extra.join(', ')}`).toEqual([])
  })
})

/**
 * Leaf paths in the suite's `ar` dict that are legitimately Latin-script —
 * never prose that should have been translated. Unlike the public site's
 * dict, there are no `.href`-style structural exceptions here, so every
 * exception is listed explicitly.
 */
const AR_DRIFT_ALLOWLIST = new Set<string>([
  'lang.switch', // "English" — names the OTHER language in its own script; standard language-switcher UX, not prose
  'lang.label', // "AR" — current-language code badge
  'agency.brand.logoUrlPh', // "https://your-cdn.com/logo.png" — example placeholder text for a URL input field
  'domains.placeholder', // "shop.yourbrand.com" — example placeholder text for a domain input field
])

describe('untranslated-string drift (ar block)', () => {
  it('has no ASCII-only English string sitting where Arabic prose belongs', () => {
    const offenders = leafEntries(STRINGS.ar)
      .filter(([path]) => !AR_DRIFT_ALLOWLIST.has(path))
      .filter(([, value]) => isSuspectedDrift(value))
      .map(([path, value]) => `${path} = ${JSON.stringify(value)}`)

    expect(offenders, `Untranslated English found in ar:\n${offenders.join('\n')}`).toEqual([])
  })

  it('the drift check actually fires — proof against the real regression this suite catches', () => {
    // This is exactly the adSuite.navLabel bug found in this file: an English
    // UI label ("Ad Suite") left untranslated in the ar dict.
    expect(isSuspectedDrift('Ad Suite')).toBe(true)
    expect(isSuspectedDrift('مجموعة الإعلانات')).toBe(false) // the actual fix
  })
})

describe('bidi isolation for LTR tokens inside Arabic text', () => {
  it('isolates the https:// scheme in the agency branding-panel hint', () => {
    expect(STRINGS.ar.agency.brand.logoUrlHint).toContain(`${LRI}https://${PDI}`)
  })

  it('isolates the https:// scheme in the agency branding-panel validation error', () => {
    expect(STRINGS.ar.agency.brand.logoUrlError).toContain(`${LRI}https://${PDI}`)
  })

  it('the isolation check fails without the isolate marks — proof', () => {
    const unisolated = 'الصق رابط صورة مستضافة بصيغة https:// — لا يوجد رفع ملفات بعد.'
    expect(unisolated).not.toContain(`${LRI}https://${PDI}`)
  })
})
