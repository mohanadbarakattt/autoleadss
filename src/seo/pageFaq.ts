import type { Locale } from '../i18n/translations'

export type PageFaqItem = {
  q: string
  a: string
  keys: string[]
}

/**
 * Single source for the visible homepage FAQ, the on-page chat answers and the FAQPage JSON-LD.
 * Keep answers factual and self-contained so search engines and AI assistants can quote them.
 */
export const PAGE_FAQ: Record<Locale, PageFaqItem[]> = {
  en: [
    {
      q: 'What does AutoLeadss do?',
      keys: ['what', 'do', 'autoleadss', 'service', 'about', 'who'],
      a: 'AutoLeadss is a Cairo-based studio that builds AI WhatsApp agents, lead-capture pages and follow-up automations for clinics, real estate teams and beauty businesses in Egypt and the Gulf. Every inquiry from WhatsApp, Instagram or your ads gets an instant reply in Arabic or English, a few qualifying questions, and a booking or a handoff to your team.',
    },
    {
      q: 'How much does an AI WhatsApp agent cost?',
      keys: ['how much', 'price', 'cost', 'pricing', 'egp', 'usd', 'whatsapp', 'agent', 'bot'],
      a: 'The Growth package, an AI WhatsApp sales and booking agent on the official WhatsApp Business Platform, is a one-time EGP 32,000 in Egypt or $1,500 in the Gulf, delivered in about 3 weeks. A lead page alone (Launch) is EGP 18,000 or $750. The full system (Scale) is EGP 65,000 or $3,000. Meta message fees and ad spend are paid to Meta directly. Monthly plans are optional, from EGP 2,500.',
    },
    {
      q: 'Does the WhatsApp agent work for clinics?',
      keys: ['clinic', 'dental', 'dentist', 'derma', 'laser', 'doctor', 'patient', 'appointment', 'booking'],
      a: 'Yes. For dental, dermatology, laser and cosmetic clinics the agent answers questions about prices, location, doctors and working hours, books the appointment, sends reminders, and passes any medical question to your staff. It does not give medical advice. It replies at night and on weekends, when many patients message.',
    },
    {
      q: 'Does it work for real estate brokers and developers?',
      keys: ['real estate', 'property', 'broker', 'brokerage', 'developer', 'unit', 'apartment', 'villa', 'viewing'],
      a: 'Yes. For brokerages and developers in Cairo, Dubai and Riyadh the agent replies to ad and portal leads in seconds, asks for budget, area, unit type, timeline and cash or installments, then books a call or viewing and sends the qualified lead to the right agent with a short summary.',
    },
    {
      q: 'Will it understand Egyptian and Gulf Arabic?',
      keys: ['arabic', 'dialect', 'egyptian', 'gulf', 'saudi', 'english', 'language', 'voice'],
      a: 'The agent is set up for Egyptian Arabic, Gulf Arabic and English. It answers only from the prices, services and policies you approve. When a question falls outside that, it hands the chat to a person instead of guessing.',
    },
    {
      q: 'What counts as a qualified lead?',
      keys: ['qualified', 'lead', 'leads', 'quality', 'serious'],
      a: 'A qualified lead is a real person who asked about a service you sell, in an area you serve, gave a phone number on WhatsApp, and either booked a time or answered the qualifying questions you choose (for example budget and timeline). We agree these rules with you before launch and the agent tags every chat by them.',
    },
    {
      q: 'Can it handle Instagram DMs too?',
      keys: ['instagram', 'dm', 'ig', 'facebook', 'messenger', 'social'],
      a: 'Instagram and Facebook messages can be routed to the same agent and inbox where Meta allows it for your account. We confirm what your accounts support on the first call before we quote.',
    },
    {
      q: 'Do I have to pay AutoLeadss a monthly subscription?',
      keys: ['monthly', 'subscription', 'retainer', 'plan', 'care'],
      a: 'No. Monthly plans are optional. Every package is a fixed price with a full handoff of the build. If you want ongoing care, agent tuning or ads management, you can add a monthly plan from EGP 2,500 to 12,000.',
    },
    {
      q: 'Who owns the system and customer data?',
      keys: ['own', 'ownership', 'handoff', 'code', 'data', 'domain', 'database'],
      a: 'You do. Your domain, WhatsApp number, ad accounts and customer data stay in your name. The code, deployment and database can be transferred at handoff.',
    },
    {
      q: 'What is the membership storefront?',
      keys: ['membership', 'subscription', 'qr', 'scan', 'scanner', 'redeem', 'salon', 'barber'],
      a: 'For salons, barbers, lash and beauty studios and other repeat-visit businesses: a bilingual page that sells up to three prepaid plans, a customer QR pass, staff redemption and an owner dashboard. It is EGP 20,000 for the first five clients, then from EGP 35,000.',
    },
    {
      q: 'Do payments go through AutoLeadss?',
      keys: ['payment', 'money', 'settle', 'merchant', 'paymob', 'instapay', 'cash', 'valu'],
      a: 'No. Online payments settle through your own merchant account, such as Paymob. We connect the payment methods enabled on your account. Provider approval is controlled by the provider and is not guaranteed by AutoLeadss.',
    },
  ],
  ar: [
    {
      q: 'أوتوليدز بتعمل إيه؟',
      keys: ['بتعمل', 'إيه', 'خدمة', 'مين', 'اوتوليدز'],
      a: 'أوتوليدز استوديو في القاهرة بيبني وكلاء واتساب بالذكاء الاصطناعي وصفحات تجميع عملاء وأتمتة متابعة للعيادات وشركات العقارات ومراكز التجميل في مصر والخليج. كل استفسار من واتساب أو إنستجرام أو إعلاناتك بياخد رد فوري بالعربي أو الإنجليزي، وكام سؤال تأهيل، وبعدها حجز أو تحويل لفريقك.',
    },
    {
      q: 'وكيل واتساب بالذكاء الاصطناعي بكام؟',
      keys: ['سعر', 'كام', 'تكلفة', 'جنيه', 'دولار', 'بوت', 'شات بوت', 'واتساب'],
      a: 'باقة Growth، وكيل مبيعات وحجز على واتساب على منصة WhatsApp Business الرسمية، بسعر ثابت ٣٢٬٠٠٠ جنيه في مصر أو ١٬٥٠٠ دولار في الخليج، والتسليم في حوالي ٣ أسابيع. صفحة العملاء لوحدها (Launch) بـ ١٨٬٠٠٠ جنيه أو ٧٥٠ دولار. النظام الكامل (Scale) بـ ٦٥٬٠٠٠ جنيه أو ٣٬٠٠٠ دولار. رسوم رسائل Meta وميزانية الإعلانات بتدفع لـ Meta مباشرة. الخطط الشهرية اختيارية وبتبدأ من ٢٬٥٠٠ جنيه.',
    },
    {
      q: 'ينفع للعيادات؟',
      keys: ['عيادة', 'عيادات', 'اسنان', 'أسنان', 'جلدية', 'ليزر', 'تجميل', 'دكتور', 'مريض', 'حجز', 'مواعيد'],
      a: 'أيوه. لعيادات الأسنان والجلدية والليزر والتجميل، الوكيل بيرد على أسئلة الأسعار والعنوان والدكاترة والمواعيد، ويحجز الكشف، ويبعت تذكير، وأي سؤال طبي بيحوله لفريق العيادة. مش بيدي استشارة طبية. وبيرد بالليل وفي الإجازات، وده وقت رسايل مرضى كتير.',
    },
    {
      q: 'ينفع لشركات العقارات والمطورين؟',
      keys: ['عقارات', 'عقار', 'شقة', 'فيلا', 'وحدة', 'بروكر', 'مطور', 'معاينة', 'ليدز'],
      a: 'أيوه. لشركات الوساطة والمطورين في القاهرة ودبي والرياض، الوكيل بيرد على ليدز الإعلانات والبورتالات في ثواني، ويسأل عن الميزانية والمنطقة ونوع الوحدة والتوقيت وكاش ولا تقسيط، وبعدها يحجز مكالمة أو معاينة ويبعت العميل المؤهل للسيلز المناسب مع ملخص قصير.',
    },
    {
      q: 'بيفهم المصري والخليجي؟',
      keys: ['عربي', 'لهجة', 'مصري', 'خليجي', 'سعودي', 'انجليزي', 'لغة', 'فويس'],
      a: 'الوكيل بيتظبط على العربي المصري والخليجي والإنجليزي. بيرد بس من الأسعار والخدمات والسياسات اللي إنت موافق عليها، ولو السؤال برا ده بيحول المحادثة لشخص من فريقك بدل ما يخمن.',
    },
    {
      q: 'يعني إيه عميل مؤهل؟',
      keys: ['مؤهل', 'ليد', 'ليدز', 'جودة', 'جاد'],
      a: 'العميل المؤهل شخص حقيقي سأل عن خدمة بتقدمها، في منطقة بتخدمها، رقمه ظاهر على واتساب، وإما حجز ميعاد أو جاوب على أسئلة التأهيل اللي إنت بتحددها (زي الميزانية والتوقيت). بنتفق على القواعد دي معاك قبل الإطلاق، والوكيل بيصنف كل محادثة عليها.',
    },
    {
      q: 'بيرد على رسايل إنستجرام كمان؟',
      keys: ['انستجرام', 'إنستجرام', 'فيسبوك', 'ماسنجر', 'رسايل', 'سوشيال'],
      a: 'رسايل إنستجرام وفيسبوك ممكن تتحول لنفس الوكيل ونفس الإنبوكس لما Meta تسمح بده لحسابك. بنتأكد من اللي حساباتك تدعمه في أول مكالمة قبل عرض السعر.',
    },
    {
      q: 'هل لازم أدفع اشتراك شهري لأوتوليدز؟',
      keys: ['شهري', 'اشتراك', 'خطة', 'متابعة'],
      a: 'لا، الخطط الشهرية اختيارية. كل باقة بسعر ثابت وتسليم كامل للنسخة. لو عايز متابعة أو تحسين للوكيل أو إدارة إعلانات، تقدر تضيف خطة شهرية من ٢٬٥٠٠ لـ ١٢٬٠٠٠ جنيه.',
    },
    {
      q: 'النظام وبيانات العملاء ملك مين؟',
      keys: ['ملكية', 'تسليم', 'كود', 'بيانات', 'دومين', 'قاعدة'],
      a: 'ملكك. الدومين ورقم الواتساب وحسابات الإعلانات وبيانات العملاء باسمك. الكود والاستضافة وقاعدة البيانات ممكن يتنقلوا عند التسليم.',
    },
    {
      q: 'إيه هو متجر العضويات؟',
      keys: ['عضوية', 'اشتراكات', 'qr', 'مسح', 'ماسح', 'صالون', 'حلاق'],
      a: 'للصالونات والحلاقين واستوديوهات الرموش والتجميل وأي نشاط العميل بيرجعله: صفحة عربي وإنجليزي بتبيع لحد ٣ باقات مدفوعة مقدماً، بطاقة QR للعميل، خصم من الموظف، ولوحة للمالك. السعر ٢٠٬٠٠٠ جنيه لأول خمس عملاء، وبعدها من ٣٥٬٠٠٠ جنيه.',
    },
    {
      q: 'الفلوس بتنزل عند أوتوليدز؟',
      keys: ['دفع', 'فلوس', 'تاجر', 'بايموب', 'انستاباي', 'كاش'],
      a: 'لأ. الدفع الأونلاين بينزل على حساب التاجر الخاص بيك، زي Paymob. إحنا بنربط وسائل الدفع المفعلة على حسابك. موافقة مقدم الدفع في إيده ومش مضمونة من أوتوليدز.',
    },
  ],
}
