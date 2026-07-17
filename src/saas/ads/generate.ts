import type { Industry } from '../types'
import { GOOGLE_RSA, LINKEDIN_LIMITS, META_LIMITS, PLATFORM_INFO, TIKTOK_LIMITS, type AdPlatform } from './specs'
import type {
  AdSuiteInput,
  AudienceSuggestion,
  BudgetPreset,
  GoogleRsaCopy,
  LinkedInCopy,
  PlatformAdResult,
  SocialVideoCopy,
} from './types'

function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}
function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every(isStr)
}
type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => !!v && typeof v === 'object'

/** Cuts a string to `max` chars at the last word boundary that still fits, so a
 * clamped headline reads as "Flex Fitness Studio" rather than "Flex Fitness Stud" —
 * falls back to a hard slice only when there's no space to break on. */
function clamp(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut
}

// ---------------------------------------------------------------------------
// Industry-based audience/budget suggestions — generic starting points (never
// asserted as real market data), used by both the demo builder and as the
// fallback when the AI's own audience/budget doesn't validate.
// ---------------------------------------------------------------------------

// Keyed by content language so an Arabic campaign never renders English
// fragments inside an otherwise-Arabic card (verify finding #3).
const INDUSTRY_INTERESTS: Record<'en' | 'ar', Record<Industry, string[]>> = {
  en: {
    'real-estate': ['Real estate investing', 'Home buying', 'Interior design', 'Property management'],
    ecommerce: ['Online shopping', 'Deals & coupons', 'Fashion & accessories', 'Home goods'],
    clinic: ['Health & wellness', 'Personal care', 'Preventive medicine', 'Family health'],
    restaurant: ['Foodies', 'Dining out', 'Food delivery', 'Local events'],
    fitness: ['Fitness & gyms', 'Healthy living', 'Weight training', 'Nutrition'],
    services: ['Small business owners', 'Home improvement', 'Professional services', 'Local services'],
    other: ['Local shoppers', 'Small business owners', 'Deals & offers', 'Community events'],
  },
  ar: {
    'real-estate': ['الاستثمار العقاري', 'شراء المنازل', 'التصميم الداخلي', 'إدارة العقارات'],
    ecommerce: ['التسوق أونلاين', 'العروض والخصومات', 'الموضة والإكسسوارات', 'مستلزمات المنزل'],
    clinic: ['الصحة والعافية', 'العناية الشخصية', 'الطب الوقائي', 'صحة العائلة'],
    restaurant: ['محبو الأكل', 'الخروج للمطاعم', 'توصيل الطعام', 'الفعاليات المحلية'],
    fitness: ['اللياقة والجيم', 'الحياة الصحية', 'تمارين المقاومة', 'التغذية'],
    services: ['أصحاب الأعمال الصغيرة', 'تحسين المنزل', 'الخدمات المهنية', 'الخدمات المحلية'],
    other: ['المتسوقون المحليون', 'أصحاب الأعمال الصغيرة', 'العروض والتخفيضات', 'فعاليات المجتمع'],
  },
}

const INDUSTRY_JOB_TITLES: Record<'en' | 'ar', Record<Industry, string[]>> = {
  en: {
    'real-estate': ['Business Owner', 'General Manager', 'Investor'],
    ecommerce: ['Founder', 'Marketing Manager', 'E-commerce Manager'],
    clinic: ['Practice Manager', 'Office Manager', 'HR Manager'],
    restaurant: ['Owner/Operator', 'General Manager', 'Events Coordinator'],
    fitness: ['Owner', 'Studio Manager', 'HR Manager'],
    services: ['Owner', 'Operations Manager', 'Office Manager'],
    other: ['Owner', 'Manager', 'Decision Maker'],
  },
  ar: {
    'real-estate': ['صاحب عمل', 'مدير عام', 'مستثمر'],
    ecommerce: ['مؤسس', 'مدير تسويق', 'مدير تجارة إلكترونية'],
    clinic: ['مدير عيادة', 'مدير مكتب', 'مدير موارد بشرية'],
    restaurant: ['مالك/مشغّل', 'مدير عام', 'منسق فعاليات'],
    fitness: ['مالك', 'مدير استوديو', 'مدير موارد بشرية'],
    services: ['مالك', 'مدير عمليات', 'مدير مكتب'],
    other: ['مالك', 'مدير', 'صانع قرار'],
  },
}

const INDUSTRY_AGE_BANDS: Record<Industry, string[]> = {
  'real-estate': ['30-44', '45-60'],
  ecommerce: ['18-24', '25-34', '35-44'],
  clinic: ['25-34', '35-49', '50-65'],
  restaurant: ['18-24', '25-34', '35-44'],
  fitness: ['18-24', '25-34', '35-44'],
  services: ['25-34', '35-49', '50-65'],
  other: ['25-34', '35-49'],
}

const BUDGET_STRATEGY: Record<'en' | 'ar', Record<AdPlatform, { dailyBudgetEgp: number; strategy: string }>> = {
  en: {
    google: { dailyBudgetEgp: 150, strategy: 'Maximize conversions' },
    meta: { dailyBudgetEgp: 150, strategy: 'Lowest cost (highest volume)' },
    linkedin: { dailyBudgetEgp: 350, strategy: 'Manual CPC — start conservative' },
    tiktok: { dailyBudgetEgp: 150, strategy: 'Lowest cost (highest volume)' },
  },
  ar: {
    google: { dailyBudgetEgp: 150, strategy: 'أقصى عدد تحويلات' },
    meta: { dailyBudgetEgp: 150, strategy: 'أقل تكلفة (أعلى حجم)' },
    linkedin: { dailyBudgetEgp: 350, strategy: 'تكلفة نقرة يدوية — ابدأ بحذر' },
    tiktok: { dailyBudgetEgp: 150, strategy: 'أقل تكلفة (أعلى حجم)' },
  },
}

function demoAudience(industry: Industry, language: 'en' | 'ar'): AudienceSuggestion {
  return {
    interests: INDUSTRY_INTERESTS[language][industry] ?? INDUSTRY_INTERESTS[language].other,
    jobTitles: INDUSTRY_JOB_TITLES[language][industry] ?? INDUSTRY_JOB_TITLES[language].other,
    ageBands: INDUSTRY_AGE_BANDS[industry] ?? INDUSTRY_AGE_BANDS.other,
  }
}

function demoBudget(platform: AdPlatform, language: 'en' | 'ar'): BudgetPreset {
  return BUDGET_STRATEGY[language][platform]
}

// ---------------------------------------------------------------------------
// Demo/keyless sample — built from the user's actual typed inputs (never a
// generic placeholder), clearly labeled via isDemoContent: true. Mirrors
// ai/generate.ts's generateFromTemplate for the funnel wizard.
// ---------------------------------------------------------------------------

export function buildDemoAdSet(platform: AdPlatform, input: AdSuiteInput): PlatformAdResult {
  const biz = input.businessName.trim()
  const what = input.description?.trim() || (input.language === 'ar' ? `خدمات ${biz}` : `what ${biz} offers`)
  const ar = input.language === 'ar'

  let copy: GoogleRsaCopy | SocialVideoCopy | LinkedInCopy
  if (platform === 'google') {
    // Full 15-headline RSA set (spec + Step-1 chip promise 15; verify finding #1).
    const headlines = [
      ar ? `${biz} — احجز الآن` : `${biz} — Book Today`,
      ar ? `اكتشف ${biz}` : `Discover ${biz}`,
      ar ? `عروض ${biz} الحصرية` : `${biz} Special Offers`,
      ar ? 'عملاء أونلاين خلال دقائق' : 'Get Customers Online Fast',
      ar ? 'ثقة عملائك تبدأ هنا' : 'Trusted by Local Customers',
      ar ? `جرّب ${biz} اليوم` : `Try ${biz} Today`,
      ar ? `${biz} قريب منك` : `${biz} Near You`,
      ar ? 'أسعار واضحة بدون مفاجآت' : 'Clear Pricing, No Surprises',
      ar ? 'خدمة سريعة تقدر تعتمد عليها' : 'Fast, Reliable Service',
      ar ? `ليه ${biz}؟ جرب بنفسك` : `Why ${biz}? See Yourself`,
      ar ? 'ابدأ في دقائق معدودة' : 'Get Started in Minutes',
      ar ? 'عرض خاص لفترة محدودة' : 'Limited-Time Offer',
      ar ? `كلمنا — ${biz}` : `Talk to Us — ${biz}`,
      ar ? 'احجز استشارتك المجانية' : 'Book a Free Consultation',
      ar ? `${biz}: جودة تستاهل` : `${biz}: Quality That Shows`,
    ].map((h) => clamp(h, GOOGLE_RSA.headlineMax))
    const descriptions = [
      ar ? `${biz} — ${what}. تواصل معنا اليوم.` : `${biz} — ${what}. Reach out today.`,
      ar ? 'خدمة سريعة وأسعار واضحة بدون مفاجآت.' : 'Fast service, clear pricing, no surprises.',
      ar ? 'اطلب عرض سعرك المجاني الآن.' : 'Request your free quote now.',
      ar ? 'نخدم عملاءنا في مصر والخليج.' : 'Serving customers across Egypt & the Gulf.',
    ].map((d) => clamp(d, GOOGLE_RSA.descriptionMax))
    copy = { headlines, descriptions }
  } else if (platform === 'linkedin') {
    copy = {
      intro: clamp(
        ar ? `${biz} يقدّم ${what}. تواصل مع فريقنا لمعرفة كيف نقدر نساعد شركتك.` : `${biz} offers ${what}. Get in touch to see how we can help your business.`,
        LINKEDIN_LIMITS.introMax,
      ),
      headline: ar ? `تواصل مع ${biz}` : `Partner with ${biz}`,
    }
  } else {
    const max = platform === 'meta' ? META_LIMITS.primaryTextMax : TIKTOK_LIMITS.primaryTextMax
    const variants = [
      { primaryText: clamp(ar ? `${biz} — ${what}. جرّبنا اليوم!` : `${biz} — ${what}. Try us today!`, max), headline: ar ? 'اطلب الآن' : 'Order Now' },
      { primaryText: clamp(ar ? `${biz} عنده بالظبط اللي محتاجه: ${what}` : `${biz} has exactly what you need: ${what}`, max), headline: ar ? 'اعرف أكتر' : 'Learn More' },
      { primaryText: clamp(ar ? `${biz}: جودة تقدر تثق فيها.` : `${biz}: quality you can trust.`, max), headline: ar ? 'احجز الآن' : 'Book Now' },
    ]
    const videoScript = [
      { time: '0-3s', beat: ar ? `هوك: مشكلة يعاني منها عميل ${biz}` : `Hook: a problem ${biz}'s customer faces` },
      { time: '3-8s', beat: ar ? `تقديم ${biz} كالحل` : `Introduce ${biz} as the solution` },
      { time: '8-12s', beat: ar ? 'لقطات سريعة للمنتج/الخدمة في العمل' : 'Quick cuts of the product/service in action' },
      { time: '12-15s', beat: ar ? 'دعوة واضحة لاتخاذ إجراء' : 'Clear call to action' },
    ]
    copy = { variants, videoScript }
  }

  return { platform, copy, audience: demoAudience(input.industry, input.language), budget: demoBudget(platform, input.language), isDemoContent: true }
}

// ---------------------------------------------------------------------------
// Gateway prompt — one request per platform (api/ad-suite.ts calls this once
// per selected platform, mirroring ai/generate.ts's buildGenerationPrompt).
// ---------------------------------------------------------------------------

const SHAPE_EXAMPLE: Record<AdPlatform, unknown> = {
  google: { copy: { headlines: ['Example Headline'], descriptions: ['Example description.'] } },
  meta: { copy: { variants: [{ primaryText: 'Example primary text.', headline: 'Example Headline' }], videoScript: [{ time: '0-3s', beat: 'Hook' }] } },
  linkedin: { copy: { intro: 'Example intro text.', headline: 'Example Headline' } },
  tiktok: { copy: { variants: [{ primaryText: 'Example primary text.', headline: 'Example Headline' }], videoScript: [{ time: '0-3s', beat: 'Hook' }] } },
}

const PLATFORM_RULES: Record<AdPlatform, string> = {
  google: `Return "copy" as { headlines: string[], descriptions: string[] } — exactly ${GOOGLE_RSA.headlineCount} headlines, each at most ${GOOGLE_RSA.headlineMax} characters, and exactly ${GOOGLE_RSA.descriptionCount} descriptions, each at most ${GOOGLE_RSA.descriptionMax} characters.`,
  meta: `Return "copy" as { variants: {primaryText, headline}[], videoScript: {time, beat}[] } — exactly ${META_LIMITS.variantCount} variants, each primaryText at most ${META_LIMITS.primaryTextMax} characters and each headline at most ${META_LIMITS.headlineMax} characters, plus a 15-second UGC video script broken into 4 timed beats (e.g. "0-3s").`,
  linkedin: `Return "copy" as { intro: string, headline: string } — intro at most ${LINKEDIN_LIMITS.introMax} characters, in a professional B2B tone, plus a short headline.`,
  tiktok: `Return "copy" as { variants: {primaryText, headline}[], videoScript: {time, beat}[] } — exactly ${TIKTOK_LIMITS.variantCount} variants, each primaryText at most ${TIKTOK_LIMITS.primaryTextMax} characters, plus a 15-second UGC video script broken into 4 timed beats (e.g. "0-3s").`,
}

export function buildAdPrompt(platform: AdPlatform, input: AdSuiteInput): { system: string; user: string } {
  const system = `You are AutoLeadss's ad-copy generator. You write high-converting, natural, market-appropriate ad campaigns for businesses in Egypt and the Gulf. When the language is "ar", write natural Modern Standard Arabic suited to the Gulf/Egyptian market. Never invent specific customer names, testimonials, or fabricated statistics. Output ONLY a JSON object exactly matching the schema below — no prose, no markdown fences.

Schema: { "copy": <platform-specific — see rules>, "audience": { "interests": string[], "jobTitles": string[], "ageBands": string[] }, "budget": { "dailyBudgetEgp": number, "strategy": string } }
${PLATFORM_RULES[platform]}
Example shape (content is illustrative only, write fresh copy): ${JSON.stringify(SHAPE_EXAMPLE[platform])}`

  const user = `Generate a ${PLATFORM_INFO[platform].name} ad campaign, tailored specifically to this business (not generic boilerplate).
Business: ${input.businessName}
Industry: ${input.industry}
What they're advertising: ${input.description || '(not provided — infer from business name and industry)'}
Language: ${input.language}
Tone: ${input.tone}`

  return { system, user }
}

// ---------------------------------------------------------------------------
// Validation + merge for the gateway's JSON response — structural check per
// platform; falls back to the demo sample's audience/budget section-by-section
// when the AI's own doesn't validate (same pattern as ai/generate.ts's
// mergeAiFunnelSpec). Returns null when the copy itself doesn't validate.
// ---------------------------------------------------------------------------

function validGoogleCopy(v: unknown): v is GoogleRsaCopy {
  const c = v as Rec
  return isRec(c) && isStrArray(c.headlines) && isStrArray(c.descriptions)
}
function validSocialCopy(v: unknown): v is SocialVideoCopy {
  const c = v as Rec
  return (
    isRec(c) &&
    Array.isArray(c.variants) &&
    c.variants.length > 0 &&
    c.variants.every((x) => isRec(x) && isStr(x.primaryText) && isStr(x.headline)) &&
    Array.isArray(c.videoScript) &&
    c.videoScript.length > 0 &&
    c.videoScript.every((x) => isRec(x) && isStr(x.time) && isStr(x.beat))
  )
}
function validLinkedInCopy(v: unknown): v is LinkedInCopy {
  const c = v as Rec
  return isRec(c) && isStr(c.intro) && isStr(c.headline)
}

function validAudience(v: unknown): v is AudienceSuggestion {
  const a = v as Rec
  return isRec(a) && isStrArray(a.interests) && isStrArray(a.jobTitles) && isStrArray(a.ageBands)
}
function validBudget(v: unknown): v is BudgetPreset {
  const b = v as Rec
  return isRec(b) && typeof b.dailyBudgetEgp === 'number' && b.dailyBudgetEgp > 0 && isStr(b.strategy)
}

function clampCopy(platform: AdPlatform, copy: GoogleRsaCopy | SocialVideoCopy | LinkedInCopy): PlatformCopyClamped {
  if (platform === 'google') {
    const c = copy as GoogleRsaCopy
    return {
      headlines: c.headlines.slice(0, GOOGLE_RSA.headlineCount).map((h) => clamp(h, GOOGLE_RSA.headlineMax)),
      descriptions: c.descriptions.slice(0, GOOGLE_RSA.descriptionCount).map((d) => clamp(d, GOOGLE_RSA.descriptionMax)),
    }
  }
  if (platform === 'linkedin') {
    const c = copy as LinkedInCopy
    return { intro: clamp(c.intro, LINKEDIN_LIMITS.introMax), headline: c.headline }
  }
  const max = platform === 'meta' ? META_LIMITS.primaryTextMax : TIKTOK_LIMITS.primaryTextMax
  const count = platform === 'meta' ? META_LIMITS.variantCount : TIKTOK_LIMITS.variantCount
  const c = copy as SocialVideoCopy
  return {
    variants: c.variants.slice(0, count).map((v) => ({ primaryText: clamp(v.primaryText, max), headline: platform === 'meta' ? clamp(v.headline, META_LIMITS.headlineMax) : v.headline })),
    videoScript: c.videoScript,
  }
}
type PlatformCopyClamped = GoogleRsaCopy | SocialVideoCopy | LinkedInCopy

export function mergeAdResult(platform: AdPlatform, input: AdSuiteInput, ai: unknown): PlatformAdResult | null {
  if (!isRec(ai) || !isRec(ai.copy)) return null

  let copy: GoogleRsaCopy | SocialVideoCopy | LinkedInCopy
  if (platform === 'google') {
    if (!validGoogleCopy(ai.copy)) return null
    copy = ai.copy
  } else if (platform === 'linkedin') {
    if (!validLinkedInCopy(ai.copy)) return null
    copy = ai.copy
  } else {
    if (!validSocialCopy(ai.copy)) return null
    copy = ai.copy
  }

  const audience = validAudience(ai.audience) ? ai.audience : demoAudience(input.industry, input.language)
  const budget = validBudget(ai.budget) ? ai.budget : demoBudget(platform, input.language)

  let clamped = clampCopy(platform, copy)
  if (platform === 'google') {
    // Enforce the full RSA counts (verify finding #2): models routinely
    // under-deliver exact-count lists, so top up from the demo set (deduped)
    // instead of silently shipping a short campaign.
    const g = clamped as GoogleRsaCopy
    if (g.headlines.length < GOOGLE_RSA.headlineCount || g.descriptions.length < GOOGLE_RSA.descriptionCount) {
      const demo = buildDemoAdSet('google', input).copy as GoogleRsaCopy
      const topUp = (have: string[], filler: string[], want: number) => {
        const seen = new Set(have.map((x) => x.trim().toLowerCase()))
        const out = [...have]
        for (const f of filler) {
          if (out.length >= want) break
          if (!seen.has(f.trim().toLowerCase())) { out.push(f); seen.add(f.trim().toLowerCase()) }
        }
        return out
      }
      clamped = {
        headlines: topUp(g.headlines, demo.headlines, GOOGLE_RSA.headlineCount),
        descriptions: topUp(g.descriptions, demo.descriptions, GOOGLE_RSA.descriptionCount),
      }
    }
  }

  return { platform, copy: clamped, audience, budget, isDemoContent: false }
}
