/**
 * Static ad-platform spec engine for the Ad Suite (/app/ads). Hard character/format
 * limits per platform, encoded once so the step-1 picker chips, the generation
 * prompt (generate.ts), and the demo/AI-result validators all read the same numbers
 * instead of duplicating them.
 */
export type AdPlatform = 'google' | 'meta' | 'linkedin' | 'tiktok'

export const AD_PLATFORMS: readonly AdPlatform[] = ['google', 'meta', 'linkedin', 'tiktok']

/** Google Ads — Responsive Search Ad limits. */
export const GOOGLE_RSA = { headlineCount: 15, headlineMax: 30, descriptionCount: 4, descriptionMax: 90 } as const
/** Meta (Facebook/Instagram) — feed ad copy limits. */
export const META_LIMITS = { primaryTextMax: 125, headlineMax: 40, variantCount: 3 } as const
/** LinkedIn — sponsored content limits. */
export const LINKEDIN_LIMITS = { introMax: 150 } as const
/** TikTok — in-feed ad copy limit. */
export const TIKTOK_LIMITS = { primaryTextMax: 100, variantCount: 3 } as const

export interface SpecChip {
  en: string
  ar: string
}

export interface PlatformInfo {
  id: AdPlatform
  icon: 'Search' | 'Megaphone' | 'Briefcase' | 'Music2'
  name: string
  chips: SpecChip[]
  /** Static, per-platform "where to paste this" checklist for the review step —
   * en/ar only, same convention as industries.ts. */
  checklist: { en: string[]; ar: string[] }
}

export const PLATFORM_INFO: Record<AdPlatform, PlatformInfo> = {
  google: {
    id: 'google',
    icon: 'Search',
    name: 'Google Ads',
    chips: [
      { en: `${GOOGLE_RSA.headlineCount} headlines · ≤${GOOGLE_RSA.headlineMax} chars`, ar: `${GOOGLE_RSA.headlineCount} عنوان · ≤${GOOGLE_RSA.headlineMax} حرف` },
      { en: `${GOOGLE_RSA.descriptionCount} descriptions · ≤${GOOGLE_RSA.descriptionMax} chars`, ar: `${GOOGLE_RSA.descriptionCount} وصف · ≤${GOOGLE_RSA.descriptionMax} حرف` },
    ],
    checklist: {
      en: [
        'Google Ads → Campaigns → New campaign → Search.',
        'At the ad group, add all headlines under "Headlines" (up to 15) and all descriptions under "Descriptions" (up to 4).',
        'Let Google auto-rotate combinations — that\'s what Responsive Search Ads are for.',
        'Paste the suggested interests/audience under "Audience segments", and the daily budget under "Budget".',
      ],
      ar: [
        'Google Ads ← الحملات ← حملة جديدة ← بحث (Search).',
        'في المجموعة الإعلانية، أضف كل العناوين تحت "العناوين" (حتى 15) وكل الأوصاف تحت "الأوصاف" (حتى 4).',
        'اترك جوجل يبدّل التركيبات تلقائياً — هذا هو الغرض من Responsive Search Ads.',
        'ألصق الاهتمامات/الجمهور المقترح تحت "شرائح الجمهور"، والميزانية اليومية تحت "الميزانية".',
      ],
    },
  },
  meta: {
    id: 'meta',
    icon: 'Megaphone',
    name: 'Meta (Facebook & Instagram)',
    chips: [
      { en: `Primary text · ~${META_LIMITS.primaryTextMax} chars`, ar: `النص الأساسي · ~${META_LIMITS.primaryTextMax} حرف` },
      { en: `Headline · ${META_LIMITS.headlineMax} chars`, ar: `العنوان · ${META_LIMITS.headlineMax} حرف` },
    ],
    checklist: {
      en: [
        'Meta Ads Manager → Create → pick your objective (Leads, Traffic, or Sales).',
        'At the ad level, paste a Primary text variant and its Headline into "Ad creative" — add the other two variants as extra text options for automatic testing.',
        'Paste the video script into your UGC brief for whoever records/edits the 15s clip.',
        'Set the suggested interests under "Detailed targeting" and the daily budget at the ad set level.',
      ],
      ar: [
        'Meta Ads Manager ← إنشاء ← اختر الهدف (عملاء محتملون، زيارات، أو مبيعات).',
        'على مستوى الإعلان، ألصق أحد نصوص "Primary text" وعنوانه في "محتوى الإعلان" — أضف النصين الآخرين كخيارات إضافية للاختبار التلقائي.',
        'ألصق سكريبت الفيديو في بريف التصوير لمن سيصوّر/يمونتج الكليب (15 ثانية).',
        'اضبط الاهتمامات المقترحة تحت "الاستهداف التفصيلي" والميزانية اليومية على مستوى المجموعة الإعلانية.',
      ],
    },
  },
  linkedin: {
    id: 'linkedin',
    icon: 'Briefcase',
    name: 'LinkedIn',
    chips: [{ en: `Intro text · ≤${LINKEDIN_LIMITS.introMax} chars`, ar: `النص التمهيدي · ≤${LINKEDIN_LIMITS.introMax} حرف` }],
    checklist: {
      en: [
        'LinkedIn Campaign Manager → Create campaign → Single image ad.',
        'Paste the Intro text into the post-copy field, and the Headline under the ad\'s headline field.',
        'Set the suggested job titles under "Job experience" targeting and interests under "Interests & traits".',
        'Enter the daily budget and pick a bid strategy at the campaign level.',
      ],
      ar: [
        'LinkedIn Campaign Manager ← إنشاء حملة ← إعلان بصورة واحدة (Single image ad).',
        'ألصق النص التمهيدي في حقل نص المنشور، والعنوان في حقل عنوان الإعلان.',
        'اضبط المسمّيات الوظيفية المقترحة تحت استهداف "الخبرة الوظيفية" والاهتمامات تحت "الاهتمامات والسمات".',
        'أدخل الميزانية اليومية واختر استراتيجية المزايدة على مستوى الحملة.',
      ],
    },
  },
  tiktok: {
    id: 'tiktok',
    icon: 'Music2',
    name: 'TikTok Ads',
    chips: [{ en: `Ad text · ≤${TIKTOK_LIMITS.primaryTextMax} chars`, ar: `نص الإعلان · ≤${TIKTOK_LIMITS.primaryTextMax} حرف` }],
    checklist: {
      en: [
        'TikTok Ads Manager → Campaign → Create → pick your objective.',
        'At the ad level, paste a text variant into "Ad text" and the Headline into "Display name"/caption — try the other variants as separate ads to see what lands.',
        'Hand the video script to whoever shoots the 15s UGC clip — TikTok ads perform best native to the platform, not repurposed TV-style footage.',
        'Set the suggested interests under "Interest & behavior" targeting and the daily budget at the ad group level.',
      ],
      ar: [
        'TikTok Ads Manager ← الحملة ← إنشاء ← اختر الهدف.',
        'على مستوى الإعلان، ألصق أحد نصوص "Ad text" والعنوان في "Display name"/الكابشن — جرّب النصوص الأخرى كإعلانات منفصلة لمعرفة الأفضل أداءً.',
        'سلّم سكريبت الفيديو لمن سيصوّر كليب الـ UGC (15 ثانية) — إعلانات TikTok تنجح أكثر لما تكون طبيعية للمنصة مش لقطات تلفزيون معاد استخدامها.',
        'اضبط الاهتمامات المقترحة تحت استهداف "الاهتمامات والسلوك" والميزانية اليومية على مستوى المجموعة الإعلانية.',
      ],
    },
  },
}
