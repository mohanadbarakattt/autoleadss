import { describe, expect, it } from 'vitest'
import { buildAdPrompt, mergeAdResult } from './generate'
import type { AdSuiteInput } from './types'

function input(over: Partial<AdSuiteInput> = {}): AdSuiteInput {
  return { businessName: 'Acme Co', industry: 'services', language: 'en', tone: 'bold', accent: '#FF5C2A', ...over }
}

// Same defect class just fixed in src/saas/ai/generate.ts's mergeAiFunnelSpec:
// an AI can free-write a fabricated claim into ad copy despite the system
// prompt's instructions, and shape validation has no way to structurally rule
// that out — so isDemoContent must never be cleared just because AI content
// merged cleanly.
describe('mergeAdResult — isDemoContent honesty flag', () => {
  it('keeps isDemoContent true for a fully valid LinkedIn AI response', () => {
    const ai = {
      copy: { intro: 'A tailored intro for Acme Co.', headline: 'Partner with Acme Co' },
      audience: { interests: ['Small business owners'], jobTitles: ['Owner'], ageBands: ['25-34'] },
      budget: { dailyBudgetEgp: 200, strategy: 'Manual CPC' },
    }
    const result = mergeAdResult('linkedin', input(), ai)
    expect(result).not.toBeNull()
    expect(result!.isDemoContent).toBe(true)
  })

  it('keeps isDemoContent true for a fully valid Google RSA AI response', () => {
    const ai = {
      copy: {
        headlines: Array.from({ length: 15 }, (_, i) => `Headline ${i + 1}`),
        descriptions: Array.from({ length: 4 }, (_, i) => `Description ${i + 1}`),
      },
      audience: { interests: ['Deals & offers'], jobTitles: ['Owner'], ageBands: ['25-34'] },
      budget: { dailyBudgetEgp: 150, strategy: 'Maximize conversions' },
    }
    const result = mergeAdResult('google', input(), ai)
    expect(result).not.toBeNull()
    expect(result!.isDemoContent).toBe(true)
  })

  it('still returns null when the copy does not structurally validate (unrelated to the honesty flag)', () => {
    expect(mergeAdResult('linkedin', input(), { copy: { intro: 'ok' } })).toBeNull() // missing headline
  })
})

describe('buildAdPrompt — anti-fabrication language', () => {
  it('instructs the model never to invent customer counts, ratings, results, promises, discounts, or credentials', () => {
    const { system } = buildAdPrompt('meta', input())
    expect(system).toMatch(/customer\/patient\/member counts/)
    expect(system).toMatch(/ratings or review counts/)
    expect(system).toMatch(/discount or price commitments/)
    expect(system).toMatch(/licence\/certification\/accreditation claims/)
    expect(system).toMatch(/never invent one/)
  })
})
