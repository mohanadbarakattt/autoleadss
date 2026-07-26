import { describe, expect, it } from 'vitest'
import { translations } from './translations'
import { SHOW_RESULTS } from '../components/sections/Results'
import { SHOW_WORK } from '../components/sections/Work'

/**
 * The marketing site must not assert a measured business result it cannot
 * source. This has now bitten three times in this repo:
 *
 *   1. the Work section's case studies (invented client names + metrics) — gated
 *   2. the Results section's "The Numbers" counters ("12 sec average lead
 *      response time", "15 days to first live lead", "2–5× better conversion")
 *   3. the chat widget telling visitors "Most clients see 2-5× better
 *      conversion vs. a regular homepage" — attributed to real clients
 *
 * Each was written in good faith as placeholder marketing copy and each would
 * have shipped as a factual claim. This guard is deliberately literal: a future
 * edit that reintroduces one of these shapes fails CI rather than going live.
 *
 * It is NOT a ban on numbers — prices, phone numbers, locale counts and "24/7"
 * are all fine. It bans claims of measured OUTCOMES.
 */

/** Patterns that assert a measured result. Hand-written; do not derive these. */
const RESULT_CLAIM_PATTERNS: [RegExp, string][] = [
  [/\d\s*[-–—]\s*\d\s*[x×]/i, 'a conversion/performance multiple (e.g. "2–5×")'],
  [/\b\d+\s*[x×]\s*(more|better|higher|faster)/i, 'an "Nx more/better" claim'],
  [/most (clients|customers) (see|get|report)/i, 'a result attributed to "most clients"'],
  [/\baverage\b.*\b(response|delivery|time)\b.*\d/i, 'an average-performance figure'],
  [/\b\d+(\.\d+)?\s*\/\s*5\b/, 'a star rating'],
  [/\b\d[\d,]*\+?\s*(reviews|ratings)\b/i, 'a review count'],
  [/\b\d[\d,]{2,}\+/, 'a "N,NNN+" volume claim'],
  [/\b\d+\s*[KMB]\+/i, 'a "NK+/NM+" volume claim'],
]

function leafStrings(node: unknown, path: string, out: [string, string][]) {
  if (typeof node === 'string') out.push([path, node])
  else if (Array.isArray(node)) node.forEach((v, i) => leafStrings(v, `${path}[${i}]`, out))
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) leafStrings(v, path ? `${path}.${k}` : k, out)
  }
}

describe('marketing copy asserts no unevidenced business results', () => {
  for (const locale of Object.keys(translations) as (keyof typeof translations)[]) {
    it(`${locale}: contains no measured-result claim`, () => {
      const strings: [string, string][] = []
      leafStrings(translations[locale], '', strings)
      const offenders = strings.flatMap(([path, value]) =>
        RESULT_CLAIM_PATTERNS.filter(([re]) => re.test(value)).map(([, label]) => `${path}: ${label} — ${JSON.stringify(value)}`),
      )
      expect(offenders).toEqual([])
    })
  }

  it('keeps the unverifiable sections gated until real figures exist', () => {
    // Both flags are the deliberate opt-in. If someone flips one, the arrays
    // they render are empty, so the section still shows nothing — two locks.
    expect(SHOW_RESULTS).toBe(false)
    expect(SHOW_WORK).toBe(false)
    for (const locale of Object.keys(translations) as (keyof typeof translations)[]) {
      expect(translations[locale].results.stats).toEqual([])
      expect(translations[locale].work.cases).toEqual([])
    }
  })
})
