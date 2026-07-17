import type { Industry, Locale, PlanId, Tone } from '../types'
import type { AdPlatform } from './specs'

export interface AdSuiteInput {
  businessName: string
  industry: Industry
  /** Content language (independent of the SaaS chrome's UILocale) — same EN/AR
   * toggle convention as WizardInput.language. */
  language: Locale
  tone: Tone
  accent: string
  /** Free-text "what are you advertising?" description — always forwarded to the
   * model/demo builder verbatim, never dropped (registry class C9). */
  description?: string
  plan?: PlanId
}

export interface GoogleRsaCopy {
  headlines: string[]
  descriptions: string[]
}

export interface SocialAdVariant {
  primaryText: string
  headline: string
}

export interface VideoScriptBeat {
  time: string
  beat: string
}

/** Shared shape for Meta and TikTok — both spec'd as "3 primary-text variants +
 * headline + a 15s UGC video script in beats". */
export interface SocialVideoCopy {
  variants: SocialAdVariant[]
  videoScript: VideoScriptBeat[]
}

export interface LinkedInCopy {
  intro: string
  headline: string
}

export type PlatformCopy = GoogleRsaCopy | SocialVideoCopy | LinkedInCopy

export interface AudienceSuggestion {
  interests: string[]
  jobTitles: string[]
  ageBands: string[]
}

export interface BudgetPreset {
  dailyBudgetEgp: number
  strategy: string
}

export interface PlatformAdResult {
  platform: AdPlatform
  copy: PlatformCopy
  audience: AudienceSuggestion
  budget: BudgetPreset
  /** True when this result is the keyless/demo sample, not live-model output —
   * drives the "Sample" badge in the review step (same convention as
   * FunnelSpec.isDemoContent). */
  isDemoContent: boolean
}
