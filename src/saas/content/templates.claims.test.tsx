import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { generateFromTemplate, mergeAiFunnelSpec } from '../ai/generate'
import FunnelRenderer from '../components/FunnelRenderer'
import type { Industry, Locale, WizardInput } from '../types'

/**
 * BLOCKER regression guard (pre-launch audit): the funnel generator must never
 * assert a fact about a merchant's business the merchant did not provide — no
 * invented customer/patient counts, ratings, review counts, revenue/yield
 * figures, delivery/refund/returns/warranty promises, discount or price
 * commitments, or licence/certification/regulatory claims (RERA, DHA, "licensed",
 * "certified", "accredited", "registered with…").
 *
 * This sweeps EVERY industry x locale the generator supports and asserts the
 * serialized spec contains none of the patterns below — hero, badges, stats,
 * features, testimonials, FAQ, ads, chatbot, and social, all at once, since
 * `JSON.stringify` flattens every channel into one string. The pattern list is
 * hardcoded here (not derived from templates.ts) — same convention as the
 * honest-status guard in src/saas/pages/Hub.test.tsx. A future edit to
 * templates.ts (or to generate.ts's copy) that reintroduces ANY of these must
 * fail this test, on this file alone, without needing to know which template
 * regressed.
 */

const INDUSTRIES: Industry[] = ['real-estate', 'ecommerce', 'clinic', 'restaurant', 'fitness', 'services', 'other']
const LOCALES: Locale[] = ['en', 'ar']

const FORBIDDEN_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'K/M/B-suffixed count (e.g. "120K+", "2.4M")', re: /\d[\d,]*\s*[KMB]\+/ },
  { name: 'comma-grouped count with trailing "+" (e.g. "20,000+")', re: /\d[\d,]{2,}\+/ },
  { name: '"Join N,NNN+" pattern', re: /\bjoin\s+\d[\d,]*\+/i },
  { name: 'N.N/5 star rating (e.g. "4.9/5")', re: /\d\.\d\s*\/\s*5\b/ },
  { name: '"review(s)" word', re: /\breviews?\b/i },
  { name: '"rated"/"rating" word', re: /\brat(ed|ing)\b/i },
  { name: 'English licence/certification claim ("licensed", "certified", "accredited")', re: /\b(licens(e|ed|ing)|certif(y|ied|ication)|accredit(ed|ation))\b/i },
  { name: '"registered with" claim', re: /registered with/i },
  { name: 'RERA (UAE real-estate regulator) acronym', re: /\bRERA\b/ },
  { name: 'DHA (Dubai Health Authority) acronym', re: /\bDHA\b/ },
  { name: 'DLD (Dubai Land Department) acronym', re: /\bDLD\b/ },
  { name: 'MOH (Ministry of Health) acronym', re: /\bMOH\b/ },
  { name: 'Arabic "معتمد" (certified/accredited)', re: /معتمد/ },
  { name: 'Arabic "مرخص" (licensed)', re: /مرخّص|مرخص/ },
  { name: 'Arabic "ضمان" (guarantee/warranty)', re: /ضمان/ },
  { name: '"warranty" word', re: /\bwarranty\b/i },
  { name: '"guarantee(d)" word', re: /\bguarantee(d)?\b/i },
  { name: '"money-back" promise', re: /money[- ]back/i },
  { name: '"cash on delivery" payment-method claim', re: /cash on delivery/i },
  { name: '"free delivery" promise', re: /free delivery/i },
  { name: '"delivery within/in N" time promise', re: /delivery (within|in)\s+\d/i },
  { name: '"delivered within" time promise', re: /delivered within/i },
  { name: '"returns/refund(ed) within" window promise', re: /(returns?|refund(s|ed)?)\s+within/i },
  { name: 'percentage result (digit + %)', re: /\d\s*%/ },
  { name: 'Arabic percentage result (digit + ٪)', re: /[0-9٠-٩]\s*٪/ },
  { name: 'currency-amount claim (AED/SAR/EGP/USD/$ + digits)', re: /\b(AED|SAR|EGP|USD|\$)\s?[\d,]+/i },
]

function specFor(industry: Industry, language: Locale) {
  return generateFromTemplate({
    industry,
    businessName: language === 'ar' ? 'شركة تجريبية' : 'Test Business Co',
    language,
    region: 'gulf',
    goal: 'leads',
    tone: 'bold',
    accent: '#FF5C2A',
  })
}

describe('funnel generator — no fabricated claims (blocker regression guard)', () => {
  for (const industry of INDUSTRIES) {
    for (const language of LOCALES) {
      it(`${industry}.${language}: serialized spec contains no fabricated-claim pattern`, () => {
        const serialized = JSON.stringify(specFor(industry, language))
        for (const { name, re } of FORBIDDEN_PATTERNS) {
          expect(serialized, `found forbidden pattern "${name}" in generateFromTemplate({ industry: '${industry}', language: '${language}' })`).not.toMatch(re)
        }
      })

      it(`${industry}.${language}: stats and testimonials are empty, isDemoContent is true`, () => {
        const spec = specFor(industry, language)
        expect(spec.page.stats).toEqual([])
        expect(spec.page.testimonials).toEqual([])
        expect(spec.isDemoContent).toBe(true)
      })
    }
  }

  it('mergeAiFunnelSpec drops AI-returned stats even when shape-valid, and never clears isDemoContent', () => {
    const input: WizardInput = { industry: 'clinic', businessName: 'Test Clinic', language: 'en', region: 'gulf', goal: 'leads', tone: 'bold', accent: '#FF5C2A' }
    const ai = {
      page: {
        hero: { eyebrow: 'Eyebrow', headline: 'Headline', subhead: 'Subhead', ctaPrimary: 'CTA', ctaSecondary: 'CTA 2', badges: ['Badge'] },
        // Shape-valid but fabricated — must never survive the merge, because shape
        // validity proves nothing about whether the number is true.
        stats: [{ value: '20,000+', label: 'Patients treated' }],
      },
    }
    const merged = mergeAiFunnelSpec(input, ai)
    expect(merged).not.toBeNull()
    expect(merged!.page.stats).toEqual([])
    expect(merged!.page.testimonials).toEqual([])
    expect(merged!.isDemoContent).toBe(true)
  })

  it('FunnelRenderer renders cleanly with empty stats and testimonials (EN) — no stray sections, no fabricated stars', () => {
    const spec = specFor('services', 'en')
    const { container, queryByText } = render(<FunnelRenderer spec={spec} />)
    expect(container.querySelector('section')).toBeInTheDocument()
    expect(queryByText(spec.page.hero.headline)).toBeInTheDocument()
    // svg[class*=lucide-star] would be the fabricated 5-star row this section used to render.
    expect(container.querySelector('svg.lucide-star')).not.toBeInTheDocument()
  })

  it('FunnelRenderer renders cleanly with empty stats and testimonials (AR) — no stray sections, no fabricated stars', () => {
    const spec = specFor('services', 'ar')
    const { container, queryByText } = render(<FunnelRenderer spec={spec} />)
    expect(container.querySelector('section')).toBeInTheDocument()
    expect(queryByText(spec.page.hero.headline)).toBeInTheDocument()
    expect(container.querySelector('svg.lucide-star')).not.toBeInTheDocument()
  })
})
