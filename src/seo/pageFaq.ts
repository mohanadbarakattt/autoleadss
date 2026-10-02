import type { Locale } from '../i18n/translations'

export type PageFaqItem = {
  q: string
  a: string
  keys: string[]
}

export const PAGE_FAQ: Record<Locale, PageFaqItem[]> = {
  en: [
    {
      q: 'What is included?',
      keys: ['get', 'build', 'include', 'package', 'website', 'scanner', 'dashboard'],
      a: 'A custom bilingual storefront, up to three launch packages, online checkout connection, customer QR pass, staff scanner, owner dashboard, setup, training, handoff, and a 30-day bug warranty.',
    },
    {
      q: 'How much is the founding package?',
      keys: ['how much', 'price', 'cost', 'pricing', 'egp', 'usd', '18000', '500', 'pay'],
      a: 'The first-five-client package is 20,000 EGP in Egypt: 10,000 EGP to start and 10,000 EGP after acceptance, before production handoff. The standard entry package starts from 35,000 EGP after the founding group. Provider fees and paid infrastructure are separate.',
    },
    {
      q: 'How does the QR redemption work?',
      keys: ['qr', 'scan', 'scanner', 'redeem', 'visits', 'uses', 'share'],
      a: 'Every member receives a secure pass. An authenticated employee scans it, verifies the package and remaining allowance, then confirms one redemption. The system records the employee, time, service, and remaining balance.',
    },
    {
      q: 'Do payments go through AutoLeadss?',
      keys: ['payment', 'money', 'settle', 'merchant', 'paymob', 'instapay', 'cash'],
      a: 'No. Online payments settle through the business’s own merchant account. AutoLeadss connects supported checkout and webhooks. Cash or InstaPay memberships can also be recorded by authorized staff.',
    },
    {
      q: 'Can you connect Paymob, valU or Halan?',
      keys: ['paymob', 'valu', 'valU', 'halan', 'forsa', 'wallet', 'card', 'bnpl'],
      a: 'We can connect payment methods that are enabled on the merchant’s account. Paymob, valU, Halan and other providers control merchant approval and method availability; that approval is not included or guaranteed by AutoLeadss.',
    },
    {
      q: 'Who owns the system and customer data?',
      keys: ['own', 'ownership', 'handoff', 'code', 'data', 'domain', 'database'],
      a: 'The business owns its domain, merchant account and customer data. The repository, deployment and database can be transferred at handoff. AutoLeadss never needs to collect customer payments on the merchant’s behalf.',
    },
  ],
  ar: [
    {
      q: 'إيه اللي باخده؟',
      keys: ['باخد', 'بتاخد', 'تشمل', 'باكدج', 'موقع', 'ماسح', 'لوحة'],
      a: 'واجهة بيع مخصصة عربي وإنجليزي، لحد ٣ باقات عند الإطلاق، ربط الدفع، بطاقة QR للعميل، ماسح للموظفين، لوحة تحكم، إعداد وتدريب وتسليم وضمان أخطاء ٣٠ يوم.',
    },
    {
      q: 'كام سعر باقة العميل المؤسس؟',
      keys: ['سعر', 'كام', 'تكلفة', 'دفع', 'جنيه', 'دولار', '18000', '500'],
      a: 'عرض أول خمسة عملاء في مصر ٢٠٬٠٠٠ جنيه: ١٠ آلاف للبدء و١٠ آلاف بعد القبول وقبل تسليم الإنتاج. بعد أول خمس مشاريع تبدأ الباقة الأساسية من ٣٥٬٠٠٠ جنيه. رسوم بوابة الدفع والاستضافة المدفوعة منفصلة.',
    },
    {
      q: 'الـ QR والخصم بيشتغلوا إزاي؟',
      keys: ['qr', 'مسح', 'ماسح', 'خصم', 'زيارة', 'استخدام'],
      a: 'كل مشترك بياخد بطاقة آمنة. موظف مسجل يمسحها ويتأكد من الباقة والرصيد، وبعد التأكيد النظام يسجل الموظف والوقت والخدمة والرصيد المتبقي.',
    },
    {
      q: 'الفلوس بتنزل عند أوتوليدز؟',
      keys: ['دفع', 'فلوس', 'تاجر', 'بايموب', 'انستاباي', 'كاش'],
      a: 'لأ. الدفع الأونلاين بينزل من خلال حساب التاجر الخاص بالنشاط. أوتوليدز بيربط الدفع والإشعارات المدعومة. الكاش أو إنستاباي ممكن الموظف المصرح له يسجلهم.',
    },
    {
      q: 'تقدروا تربطوا Paymob أو valU أو Halan؟',
      keys: ['paymob', 'valu', 'halan', 'forsa', 'محفظة', 'كارت', 'تقسيط'],
      a: 'نقدر نربط الوسائل المفعلة على حساب التاجر. Paymob وvalU وHalan وغيرهم هم اللي بيوافقوا على التاجر ويفعلوا الوسيلة؛ الموافقة دي مش ضمن الخدمة ومش مضمونة من أوتوليدز.',
    },
    {
      q: 'النظام وبيانات العملاء ملك مين؟',
      keys: ['ملكية', 'تسليم', 'كود', 'بيانات', 'دومين', 'قاعدة'],
      a: 'الدومين وحساب التاجر وبيانات العملاء ملك النشاط. الكود والاستضافة وقاعدة البيانات ممكن يتنقلوا عند التسليم. أوتوليدز مش محتاج يحصّل فلوس العملاء نيابة عن التاجر.',
    },
  ],
}
