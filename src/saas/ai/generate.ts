import type { FunnelSpec, Tone, WizardInput } from '../types'
import { TEMPLATES } from '../content/templates'

/** Deep-clone a node, applying every `[from, to]` pair (in order) to every string
 * leaf. Always reconstructs objects/arrays (even with an empty `pairs` list), so
 * callers get an independent clone with no shared references back into `TEMPLATES`. */
function deepReplace<T>(node: T, pairs: [string, string][]): T {
  if (typeof node === 'string') {
    let s: string = node
    for (const [from, to] of pairs) {
      if (from) s = s.split(from).join(to)
    }
    return s as unknown as T
  }
  if (Array.isArray(node)) return node.map((n) => deepReplace(n, pairs)) as unknown as T
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node)) out[k] = deepReplace(v, pairs)
    return out as T
  }
  return node
}

export function pickTemplate(industry: string, language: string): FunnelSpec {
  return (
    TEMPLATES[`${industry}.${language}`] ??
    TEMPLATES[`services.${language}`] ??
    TEMPLATES[`real-estate.${language}`] ??
    TEMPLATES['real-estate.en']
  )
}

// ---------------------------------------------------------------------------
// Location detection — lets the real-estate template stop contradicting a
// business the user actually typed in (e.g. "شقق للبيع في التجمع الخامس" is
// inland New Cairo; the base template's copy is written for a North Coast /
// waterfront listing).
//
// The template itself carries `{{LOCATION}}` / `{{BRAND_TAG}}` placeholder
// tokens (see templates.ts) instead of baked-in prose like "على البحر" or
// "#مرتفعات_المارينا". `tokenPairs` below is a plain token → value
// substitution, applied by the same `deepReplace` pass that runs across the
// whole spec (hero, features, ads, chatbot, social — every channel), so there
// is no longer a list of exact sentence fragments that has to be kept in sync
// with the template's prose. If the copy in templates.ts is reworded, the
// token stays put and the substitution keeps working.
// ---------------------------------------------------------------------------

interface LocationHint {
  /** Localized display phrase for the area recognized in the user's business
   * name/description, or null if nothing was recognized. */
  phrase: { en: string; ar: string } | null
}

const KNOWN_AREAS: { re: RegExp; en: string; ar: string }[] = [
  { re: /التجمع\s*الخامس|new\s*cairo|fifth\s*settlement|tagamoa/i, en: 'New Cairo', ar: 'التجمع الخامس' },
  { re: /العاصمة\s*الإدارية|new\s*capital/i, en: 'the New Capital', ar: 'العاصمة الإدارية' },
  { re: /الشيخ\s*زايد|sheikh\s*zayed/i, en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
  { re: /مدينتي|madinaty/i, en: 'Madinaty', ar: 'مدينتي' },
  { re: /المعادي|maadi/i, en: 'Maadi', ar: 'المعادي' },
  { re: /6\s*أكتوبر|october\s*city|6th\s*of\s*october/i, en: '6th of October City', ar: 'مدينة 6 أكتوبر' },
  { re: /الساحل\s*الشمالي|north\s*coast/i, en: 'the North Coast', ar: 'الساحل الشمالي' },
  { re: /العين\s*السخنة|ain\s*sokhna|sokhna/i, en: 'Ain Sokhna', ar: 'العين السخنة' },
  { re: /الإسكندرية|alexandria/i, en: 'Alexandria', ar: 'الإسكندرية' },
  { re: /دبي\s*مارينا|dubai\s*marina/i, en: 'Dubai Marina', ar: 'مارينا دبي' },
  { re: /داون\s*تاون\s*دبي|downtown\s*dubai/i, en: 'Downtown Dubai', ar: 'داون تاون دبي' },
  { re: /أبوظبي|abu\s*dhabi/i, en: 'Abu Dhabi', ar: 'أبوظبي' },
  { re: /جدة|jeddah/i, en: 'Jeddah', ar: 'جدة' },
  { re: /الرياض|riyadh/i, en: 'Riyadh', ar: 'الرياض' },
  { re: /دبي|dubai/i, en: 'Dubai', ar: 'دبي' },
]

function detectLocation(text: string): LocationHint {
  for (const a of KNOWN_AREAS) {
    if (a.re.test(text)) return { phrase: { en: a.en, ar: a.ar } }
  }
  return { phrase: null }
}

/**
 * Token → value substitution pairs, applied uniformly across every generated
 * channel (page, ads, chatbot, social). `{{LOCATION}}` resolves to the area
 * recognized in the business name (falling back to a neutral "Egypt & the
 * Gulf" phrase when none is recognized — including a genuinely coastal area
 * like the North Coast, so a legit coastal business still reads as coastal).
 * `{{BRAND_TAG}}` is a hashtag-safe version of the business name, for social
 * hashtags that can't contain spaces.
 */
function tokenPairs(input: WizardInput): [string, string][] {
  const hint = detectLocation(input.businessName)
  const locAr = hint.phrase?.ar ?? 'مصر والخليج'
  const locEn = hint.phrase?.en ?? 'Egypt & the Gulf'
  const brandTag = (input.businessName || '').trim().replace(/\s+/g, '_')
  return [
    ['{{LOCATION}}', input.language === 'ar' ? locAr : locEn],
    ['{{BRAND_TAG}}', brandTag ? `#${brandTag}` : '#عقارات'],
  ]
}

/** Primary CTA copy, driven by BOTH the chosen goal (what action) and tone (how it's said) —
 * the two wizard inputs the old single 4-entry `goalCta` map ignored the second of. */
const GOAL_TONE_CTA: Record<string, Record<Tone, { en: string; ar: string }>> = {
  leads: {
    bold: { en: 'Get Your Free Quote Now', ar: 'اطلب عرضك الآن' },
    friendly: { en: 'Get a Friendly Quote', ar: 'احصل على عرضك بسهولة' },
    luxury: { en: 'Request a Private Consultation', ar: 'اطلب استشارة خاصة' },
    professional: { en: 'Request a Proposal', ar: 'اطلب عرض سعر' },
  },
  bookings: {
    bold: { en: 'Book Now', ar: 'احجز الآن' },
    friendly: { en: 'Book a Time That Works', ar: 'احجز في الوقت المناسب لك' },
    luxury: { en: 'Reserve Your Appointment', ar: 'احجز موعدك الخاص' },
    professional: { en: 'Schedule a Consultation', ar: 'حدد موعد استشارة' },
  },
  sales: {
    bold: { en: 'Shop Now', ar: 'تسوّق الآن' },
    friendly: { en: 'Start Shopping', ar: 'ابدأ التسوّق' },
    luxury: { en: 'Explore the Collection', ar: 'اكتشف التشكيلة' },
    professional: { en: 'View Our Offerings', ar: 'تصفّح عروضنا' },
  },
  calls: {
    bold: { en: 'Message Us Now', ar: 'راسلنا الآن' },
    friendly: { en: "Let's Chat", ar: 'تعال نتكلم' },
    luxury: { en: 'Speak With an Advisor', ar: 'تحدّث مع مستشارنا' },
    professional: { en: 'Contact Our Team', ar: 'تواصل مع فريقنا' },
  },
}

/** Personalize a template for a specific business (the demo-mode / fallback generator).
 * Interpolates the business name, industry, goal, tone and any location/keywords found
 * in the business name/description across every generated channel — not just a
 * top-level `businessName` field find/replace. */
export function generateFromTemplate(input: WizardInput): FunnelSpec {
  const base = pickTemplate(input.industry, input.language)

  // Pass 1: business-name swap — always reconstructs the whole tree, so this also
  // guarantees the returned spec is an independent clone (never aliases `TEMPLATES`).
  let spec = deepReplace(base, [[base.businessName, input.businessName || base.businessName]])

  // Pass 2: resolve `{{LOCATION}}` / `{{BRAND_TAG}}` placeholder tokens against the
  // area detected in the business name. Runs for every industry/channel — it's a
  // no-op wherever a template doesn't contain the tokens (only the real-estate
  // templates do today), so there's no per-industry branch to keep in sync.
  spec = deepReplace(spec, tokenPairs(input))

  spec.businessName = input.businessName || base.businessName
  spec.industry = input.industry
  spec.language = input.language
  spec.isDemoContent = true
  // No fabricated social proof, ever: a generated draft never puts words or a star
  // rating in a customer's mouth. Merchants add their own real testimonials in the
  // editor; until then the section simply doesn't exist (see FunnelRenderer).
  spec.page.testimonials = []

  const cta = GOAL_TONE_CTA[input.goal]?.[input.tone]
  if (cta) {
    const text = input.language === 'ar' ? cta.ar : cta.en
    spec.page.hero.ctaPrimary = text
    spec.page.finalCta.cta = text
  }
  return spec
}

/** System + user prompt for the real-AI path, sent to the MBAI Model Gateway
 * by api/ai-generate.ts. Asks for a complete funnel — page copy, ads, the
 * WhatsApp bot script, and social posts — tailored to the business, not a
 * template with names swapped in. */
export function buildGenerationPrompt(input: WizardInput): { system: string; user: string } {
  const example = pickTemplate(input.industry, input.language)
  const system = `You are AutoLeadss's funnel generator. You write high-converting, natural, market-appropriate sales-funnel copy for businesses in Egypt and the Gulf: landing-page copy, ad copy, a WhatsApp bot script, and social posts. When the language is "ar", write natural Modern Standard Arabic suited to the Gulf/Egyptian market.

This copy gets published as-is on a real merchant's public page, ads, and social posts, often without edits. You do not know this business's real numbers, so never invent one. Do not invent, anywhere in your output — not just testimonials — any: customer/patient/member counts, ratings or review counts, revenue/yield/percentage results, delivery/refund/returns/warranty promises, discount or price commitments, or licence/certification/accreditation claims (e.g. "RERA-licensed", "DHA licensed", "certified", "accredited", "registered with…"). Leave the "testimonials" array empty. Leave the "stats" array empty. Where a section's whole point would otherwise be one of these claims, write persuasive structure instead — benefit framing, a question, a call to action — never a fabricated number or credential. Output ONLY a JSON object exactly matching the provided schema — no prose, no markdown fences.`
  const user = `Generate a complete funnel spec, tailored specifically to this business (not generic boilerplate).
Business: ${input.businessName}
Industry: ${input.industry}
Language: ${input.language}
Region: ${input.region}
Primary goal: ${input.goal}
Tone: ${input.tone}
${input.audience ? `Audience: ${input.audience}` : ''}

Match this JSON shape exactly (same keys, same nesting), but with fresh, tailored content:
${JSON.stringify(example)}`
  return { system, user }
}

// ---------------------------------------------------------------------------
// Validation + merge for the gateway's JSON response. The model can drop or
// mangle a section; each section is only accepted if it structurally matches
// FunnelSpec, otherwise the template's version of that section is kept — so a
// partially-broken response still produces a fully-valid, mostly-AI funnel
// instead of discarding the whole thing.
// ---------------------------------------------------------------------------

function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}
function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every(isStr)
}

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object'

function validHero(v: unknown): v is FunnelSpec['page']['hero'] {
  const h = v as Rec
  return isRec(h) && isStr(h.eyebrow) && isStr(h.headline) && isStr(h.subhead) && isStr(h.ctaPrimary) && isStr(h.ctaSecondary) && isStrArray(h.badges)
}
function validFeatures(v: unknown): v is FunnelSpec['page']['features'] {
  return Array.isArray(v) && v.length > 0 && v.every((f) => isRec(f) && isStr(f.title) && isStr(f.body) && isStr(f.icon))
}
function validFaq(v: unknown): v is FunnelSpec['page']['faq'] {
  return Array.isArray(v) && v.length > 0 && v.every((f) => isRec(f) && isStr(f.q) && isStr(f.a))
}
function validFinalCta(v: unknown): v is FunnelSpec['page']['finalCta'] {
  const c = v as Rec
  return isRec(c) && isStr(c.headline) && isStr(c.sub) && isStr(c.cta)
}
function validLeadForm(v: unknown): v is FunnelSpec['page']['leadForm'] {
  const l = v as Rec
  return isRec(l) && isStr(l.title) && isStrArray(l.fields) && isStr(l.button)
}
function validAds(v: unknown): v is FunnelSpec['ads'] {
  return Array.isArray(v) && v.length > 0 && v.every((a) => isRec(a) && isStr(a.platform) && isStr(a.headline) && isStr(a.description) && isStr(a.cta))
}
function validChatbot(v: unknown): v is FunnelSpec['chatbot'] {
  const c = v as Rec
  return (
    isRec(c) &&
    isStr(c.greeting) &&
    isStrArray(c.qualifyingQuestions) &&
    Array.isArray(c.flow) &&
    c.flow.length > 0 &&
    c.flow.every((f) => isRec(f) && isStr(f.trigger) && isStr(f.response)) &&
    isStr(c.bookingMessage)
  )
}
function validSocial(v: unknown): v is FunnelSpec['social'] {
  return Array.isArray(v) && v.length > 0 && v.every((s) => isRec(s) && isStr(s.platform) && isStr(s.caption) && isStrArray(s.hashtags))
}

/**
 * Merges a gateway JSON response onto the template-generated spec, section by
 * section, keeping only sections that structurally validate. Returns null
 * when the hero itself doesn't validate — that's the bar for "the AI actually
 * produced usable output"; callers fall back to the pure template in that case.
 *
 * `stats` is never taken from the AI response, even if it's shape-valid — shape
 * validity proves the model returned an array of {value, label} strings, not that
 * either string is true. There's no way to verify a model-invented number against
 * the merchant's actual business, so the template's empty `stats` (see
 * generateFromTemplate) always wins. Testimonials are likewise always empty —
 * this app never puts a fabricated customer identity or star rating on a funnel.
 *
 * `isDemoContent` stays `true` (never flipped to `false` here): the AI can still
 * free-write an invented number into a hero badge, feature, or FAQ answer despite
 * the system prompt's instructions, and this merge has no way to structurally rule
 * that out. The editor's "review before publishing" banner is keyed off this flag,
 * so it must keep showing for AI-merged content, not just pure-template content.
 */
export function mergeAiFunnelSpec(input: WizardInput, ai: unknown): FunnelSpec | null {
  if (!isRec(ai) || !isRec(ai.page) || !validHero(ai.page.hero)) return null

  const spec = generateFromTemplate(input)
  spec.page.hero = ai.page.hero
  if (validFeatures(ai.page.features)) spec.page.features = ai.page.features
  if (validFaq(ai.page.faq)) spec.page.faq = ai.page.faq
  if (validFinalCta(ai.page.finalCta)) spec.page.finalCta = ai.page.finalCta
  if (validLeadForm(ai.page.leadForm)) spec.page.leadForm = ai.page.leadForm
  if (validAds(ai.ads)) spec.ads = ai.ads
  if (validChatbot(ai.chatbot)) spec.chatbot = ai.chatbot
  if (validSocial(ai.social)) spec.social = ai.social
  return spec
}
