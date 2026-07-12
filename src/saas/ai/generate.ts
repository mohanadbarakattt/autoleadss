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
// ---------------------------------------------------------------------------

interface LocationHint {
  /** Localized display phrase for the area recognized in the user's business
   * name/description, or null if nothing was recognized. */
  phrase: { en: string; ar: string } | null
  /** True when the recognized area is a genuine beach/waterfront destination —
   * in which case the template's coastal copy isn't a contradiction and is left as-is. */
  coastal: boolean
}

const KNOWN_AREAS: { re: RegExp; en: string; ar: string; coastal: boolean }[] = [
  { re: /التجمع\s*الخامس|new\s*cairo|fifth\s*settlement|tagamoa/i, en: 'New Cairo', ar: 'التجمع الخامس', coastal: false },
  { re: /العاصمة\s*الإدارية|new\s*capital/i, en: 'the New Capital', ar: 'العاصمة الإدارية', coastal: false },
  { re: /الشيخ\s*زايد|sheikh\s*zayed/i, en: 'Sheikh Zayed', ar: 'الشيخ زايد', coastal: false },
  { re: /مدينتي|madinaty/i, en: 'Madinaty', ar: 'مدينتي', coastal: false },
  { re: /المعادي|maadi/i, en: 'Maadi', ar: 'المعادي', coastal: false },
  { re: /6\s*أكتوبر|october\s*city|6th\s*of\s*october/i, en: '6th of October City', ar: 'مدينة 6 أكتوبر', coastal: false },
  { re: /الساحل\s*الشمالي|north\s*coast/i, en: 'the North Coast', ar: 'الساحل الشمالي', coastal: true },
  { re: /العين\s*السخنة|ain\s*sokhna|sokhna/i, en: 'Ain Sokhna', ar: 'العين السخنة', coastal: true },
  { re: /الإسكندرية|alexandria/i, en: 'Alexandria', ar: 'الإسكندرية', coastal: true },
  { re: /دبي\s*مارينا|dubai\s*marina/i, en: 'Dubai Marina', ar: 'مارينا دبي', coastal: true },
  { re: /داون\s*تاون\s*دبي|downtown\s*dubai/i, en: 'Downtown Dubai', ar: 'داون تاون دبي', coastal: false },
  { re: /أبوظبي|abu\s*dhabi/i, en: 'Abu Dhabi', ar: 'أبوظبي', coastal: false },
  { re: /جدة|jeddah/i, en: 'Jeddah', ar: 'جدة', coastal: true },
  { re: /الرياض|riyadh/i, en: 'Riyadh', ar: 'الرياض', coastal: false },
  { re: /دبي|dubai/i, en: 'Dubai', ar: 'دبي', coastal: false },
]

function detectLocation(text: string): LocationHint {
  for (const a of KNOWN_AREAS) {
    if (a.re.test(text)) return { phrase: { en: a.en, ar: a.ar }, coastal: a.coastal }
  }
  return { phrase: null, coastal: false }
}

/**
 * Exact-fragment replacements that neutralize the real-estate template's baked-in
 * beachfront/North-Coast framing when the business the user described isn't
 * actually on the coast. Deliberately matches whole phrases (not single words like
 * "بحر"/"sea") so the result stays grammatically correct Arabic/English rather than
 * a naive word swap. Runs across hero, features, ads, chatbot and social — every
 * channel the wizard generates — not just the headline.
 */
function coastalReplacements(hint: LocationHint): [string, string][] {
  const locAr = hint.phrase?.ar ?? 'مصر والخليج'
  const locEn = hint.phrase?.en ?? 'Egypt & the Gulf'
  return [
    // Arabic — full phrases first, emoji cleanup last.
    ['مشاريع سكنية على البحر مباشرة — تسليم مضمون', `مشاريع سكنية في ${locAr} — تسليم مضمون`],
    ['تملّك وحدتك المطلّة على البحر بمقدّم 10% وتقسيط حتى 8 سنوات', `تملّك وحدتك في ${locAr} بمقدّم 10% وتقسيط حتى 8 سنوات`],
    ['شقق وشاليهات وفلل فاخرة في أرقى كمبوندات الساحل والعاصمة الإدارية', `شقق وفلل فاخرة في أرقى كمبوندات ${locAr}`],
    ['منزل أحلامك على البحر ينتظرك', `منزل أحلامك في ${locAr} ينتظرك`],
    ['وحدات في قلب الساحل الشمالي والعاصمة الإدارية الجديدة ومشاريع الخليج', `وحدات في قلب ${locAr} وأقرب المناطق الحيوية`],
    ['شقق على البحر بمقدّم 10% | تقسيط 8 سنوات', `شقق في ${locAr} بمقدّم 10% | تقسيط 8 سنوات`],
    ['منزل أحلامك على البحر أقرب مما تتخيّل', `منزل أحلامك في ${locAr} أقرب مما تتخيّل`],
    ['جولة داخل شاليه على البحر مباشرة', `جولة داخل وحدتك في ${locAr}`],
    ['أحلامك على البحر بأنسب خطة سداد', `أحلامك في ${locAr} بأنسب خطة سداد`],
    ['الساحل الشمالي، العاصمة الإدارية، أم مشاريع الخليج؟', `${locAr}، أم منطقة أخرى؟`],
    ['أحلامك على البحر بقى أقرب', `أحلامك في ${locAr} بقى أقرب`],
    [
      'إطلالة تفتح لك يومك… وبحر يعيد لك هدوءك. 🌊 تملّك وحدتك المطلّة على البحر في مرتفعات المارينا بمقدّم يبدأ من 10% وتقسيط حتى 8 سنوات. منزل أحلامك مش حلم بعيد.',
      `سكن يليق بطموحك. 🏠 تملّك وحدتك في ${locAr} بمقدّم يبدأ من 10% وتقسيط حتى 8 سنوات. منزل أحلامك مش حلم بعيد.`,
    ],
    ['وحدات فاخرة في العاصمة الإدارية والساحل الشمالي', `وحدات فاخرة في ${locAr}`],
    ['جولة سريعة جوّه شاليه على البحر مباشرة 🌅', `جولة سريعة جوّه وحدتك في ${locAr} 🏠`],
    ['خطط سداد حصرية على وحدات محدودة مطلّة على البحر', `خطط سداد حصرية على وحدات محدودة في ${locAr}`],
    ['#الساحل_الشمالي', '#عقارات_مصر'],
    ['🏖️', '🏠'],
    ['🌊', ''],
    ['🌅', '🏠'],
    // English
    ['RERA-Licensed Property Advisory | Dubai, Abu Dhabi, Cairo & the Northern Coast', `RERA-Licensed Property Advisory | Serving ${locEn}`],
    ['Own Off-Plan Property in Prime Waterfront Addresses — From 10% Down', `Own Off-Plan Property in Prime ${locEn} Addresses — From 10% Down`],
    ['Off-Plan Dubai Property | From 10% Down', `Off-Plan Property in ${locEn} | From 10% Down`],
    ['Own a Dubai Marina Apartment From Just 10% Down', `Own an Apartment in ${locEn} From Just 10% Down`],
    ['This is how expats buy Dubai property with 10% down 👀', `This is how buyers get property in ${locEn} with 10% down 👀`],
    ['Off-plan in Dubai Marina, from just 10% down.', `Off-plan in ${locEn}, from just 10% down.`],
    ['POV: you bought a Dubai apartment with 10% down', `POV: you bought an apartment in ${locEn} with 10% down`],
    ['Which area interests you most — Dubai, Abu Dhabi, elsewhere in the Gulf, or Egypt?', `Which area interests you most — ${locEn}, or somewhere else?`],
  ]
}

/**
 * Replaces the template's fabricated-specific testimonials (invented names tied to
 * invented neighborhoods/numbers) with clearly-generic social proof: no invented
 * identities, no invented locations — just the real business name and a plausible,
 * unembellished reason to trust it.
 */
function genericTestimonials(input: WizardInput): FunnelSpec['page']['testimonials'] {
  const biz = input.businessName || (input.language === 'ar' ? 'الفريق' : 'the team')
  if (input.language === 'ar') {
    return [
      { quote: `تعاملت مع ${biz} ولقيت ردود سريعة وكل التفاصيل واضحة من أول رسالة.`, name: 'عميل موثّق', role: 'عميل جديد' },
      { quote: `أسعار واضحة وملهاش لبس، وما فيش ضغط في البيع — بالظبط اللي كنت محتاجه من ${biz}.`, name: 'عميل موثّق', role: 'عميل عائد' },
      { quote: `قارنت بين أكثر من جهة قبل ما أقرر، و${biz} كانوا الأسهل في إنهم يردوا عليّ بوضوح.`, name: 'عميل موثّق', role: 'تمت التوصية به من صديق' },
    ]
  }
  return [
    { quote: `${biz} answered every question I had and made the whole process easy to follow from the very first message.`, name: 'Verified customer', role: 'New customer' },
    { quote: `Clear pricing, fast replies, and no pressure — exactly what I wanted when I reached out to ${biz}.`, name: 'Verified customer', role: 'Returning customer' },
    { quote: `I compared a few options before deciding, and ${biz} was the easiest to actually get a straight answer from.`, name: 'Verified customer', role: 'Referred by a friend' },
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

  // Pass 2: real-estate only — kill location-specific canned fragments (beachfront/
  // North Coast/waterfront) that contradict a non-coastal business the user described,
  // and reference their actual area instead when we can detect one.
  const hint = detectLocation(input.businessName)
  if (input.industry === 'real-estate' && !hint.coastal) {
    spec = deepReplace(spec, coastalReplacements(hint))
  }

  spec.businessName = input.businessName || base.businessName
  spec.industry = input.industry
  spec.language = input.language
  spec.isDemoContent = true
  spec.page.testimonials = genericTestimonials(input)

  const cta = GOAL_TONE_CTA[input.goal]?.[input.tone]
  if (cta) {
    const text = input.language === 'ar' ? cta.ar : cta.en
    spec.page.hero.ctaPrimary = text
    spec.page.finalCta.cta = text
  }
  return spec
}

/** System + user prompt for the real-AI path (used when ANTHROPIC_API_KEY is set). */
export function buildGenerationPrompt(input: WizardInput): { system: string; user: string } {
  const example = pickTemplate(input.industry, input.language)
  const system = `You are AutoLeadss's funnel generator. You write high-converting, natural, market-appropriate sales-funnel copy for businesses in Egypt and the Gulf. When the language is "ar", write natural Modern Standard Arabic suited to the Gulf/Egyptian market. Output ONLY a JSON object exactly matching the provided schema — no prose, no markdown fences.`
  const user = `Generate a complete funnel spec.
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
