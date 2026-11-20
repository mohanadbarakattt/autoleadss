import type { Locale } from '../i18n/translations'
import { waLink } from '../site'

/** The free missed-leads audit: the low-risk first step offered across the site. */
export const AUDIT_COPY: Record<Locale, {
  cta: string
  ctaShort: string
  note: string
  eyebrow: string
  title: string
  body: string
  steps: [string, string][]
  youGet: string
  gets: string[]
  waText: string
}> = {
  en: {
    cta: 'Get a free missed-leads audit',
    ctaShort: 'Free audit',
    note: 'Free · no obligation · results on WhatsApp',
    eyebrow: 'Free missed-leads audit',
    title: 'Find out how many leads you lose before you spend a pound.',
    body: 'With your permission, we message your business the way a real customer would, on WhatsApp and Instagram, at the times your customers actually write. Then we send you what we found.',
    steps: [
      ['Send us your WhatsApp and Instagram', 'One message. No call, no setup and nothing to install.'],
      ['We test it like a customer', 'We ask about prices and slots in the evening and on the weekend, and time every reply.'],
      ['You get the results', 'Reply times, the questions that went unanswered, and three fixes you can make with or without us.'],
    ],
    youGet: 'What you get',
    gets: ['Your real reply times, day and night', 'Where leads drop off', 'Three practical fixes', 'A fixed price if you want us to build it'],
    waText:
      'Hi AutoLeadss, I want the free missed-leads audit.\nBusiness name and city:\nWhatsApp number to test:\nInstagram (optional):\nWhere most leads come from (ads, Instagram, portals):',
  },
  ar: {
    cta: 'اطلب تحليل مجاني للعملاء الضايعين',
    ctaShort: 'تحليل مجاني',
    note: 'مجاني · من غير أي التزام · النتيجة على واتساب',
    eyebrow: 'تحليل مجاني للعملاء الضايعين',
    title: 'اعرف بتخسر كام عميل قبل ما تدفع جنيه.',
    body: 'بإذنك، بنكلم نشاطك زي أي عميل حقيقي على واتساب وإنستجرام، وفي نفس الأوقات اللي عملاءك بيكتبوا فيها. وبعدها بنبعتلك اللي لقيناه.',
    steps: [
      ['ابعتلنا رقم الواتساب والإنستجرام', 'رسالة واحدة. من غير مكالمة ولا تجهيز ولا تسطيب أي حاجة.'],
      ['بنجربه زي العميل', 'بنسأل عن الأسعار والمواعيد بالليل وفي الويك إند، وبنحسب وقت كل رد.'],
      ['بتستلم النتيجة', 'سرعة الرد الحقيقية، الأسئلة اللي محدش رد عليها، وتلات تحسينات تقدر تعملها معانا أو من غيرنا.'],
    ],
    youGet: 'هتاخد إيه',
    gets: ['سرعة ردكم الحقيقية بالنهار وبالليل', 'العملاء بيضيعوا فين', 'تلات تحسينات عملية', 'سعر ثابت لو حابب نبنيه لك'],
    waText:
      'أهلاً أوتوليدز، عايز التحليل المجاني للعملاء الضايعين.\nاسم النشاط والمدينة:\nرقم الواتساب اللي هتجربوه:\nالإنستجرام (اختياري):\nأغلب العملاء بييجوا منين (إعلانات، إنستجرام، بورتالات):',
  },
}

export function auditLink(locale: Locale) {
  return waLink(AUDIT_COPY[locale].waText)
}
