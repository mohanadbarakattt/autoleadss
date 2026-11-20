import type { Locale } from '../i18n/translations'
import { SITE } from '../site'

export type LegalDoc = {
  title: string
  updated: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

export const privacyContent: Record<Locale, LegalDoc> = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 20 November 2026',
    intro: `This page explains what ${SITE.name}, a studio based in Cairo, Egypt, collects when you visit autoleadss.com or contact us, and what we do with it.`,
    sections: [
      {
        heading: 'What we collect on this site',
        body: [
          'Your cookie choice, stored in your own browser so we do not ask twice.',
          'Only if you click "Accept all" or turn analytics on: Google Ads and Google Analytics measure visits and clicks on WhatsApp and demo buttons, and a Meta pixel may do the same. Until you accept, Google tags run in a cookieless mode and store nothing on your device.',
          'The site has no forms that store your details on our servers. Quote requests and audits happen on WhatsApp or email.',
        ],
      },
      {
        heading: 'When you contact us',
        body: [
          'If you message us on WhatsApp or email, we use your name, number and messages to reply, prepare a quote or audit, and deliver your project. WhatsApp and your email provider also process those messages under their own policies.',
          'We do not sell your details or use them for unrelated marketing.',
        ],
      },
      {
        heading: "Our clients' customer data",
        body: [
          "When we build an AI agent, lead page or follow-up system for a business, that business decides what customer data is collected. We access it only to build, test and support the system, following the business's instructions, and the data stays in accounts the business owns.",
          'The agents we build are set up not to ask for medical details and to hand sensitive questions to the business staff.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'You can change your cookie choice by clearing this site’s data in your browser. You can ask us to see or delete the messages and details you sent us at any time.',
          `Contact: ${SITE.email} or WhatsApp ${SITE.whatsappDisplay}.`,
        ],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: ٢٠ نوفمبر ٢٠٢٦',
    intro: `توضح هذه الصفحة ما الذي يجمعه ${SITE.name}، استوديو مقره القاهرة، عند زيارتك autoleadss.com أو تواصلك معنا، وكيف نستخدمه.`,
    sections: [
      {
        heading: 'ما الذي يجمعه الموقع',
        body: [
          'اختيارك بخصوص ملفات تعريف الارتباط، ويُحفظ في متصفحك حتى لا نسألك مرة أخرى.',
          'فقط إذا ضغطت "قبول الكل" أو فعّلت التحليلات: يقيس Google Ads وGoogle Analytics الزيارات والضغطات على أزرار واتساب والديمو، وقد يفعل Meta Pixel الشيء نفسه. قبل موافقتك تعمل أدوات Google بدون ملفات تعريف ولا تخزّن شيئاً على جهازك.',
          'لا توجد في الموقع نماذج تحفظ بياناتك على خوادمنا. طلبات الأسعار والتحليل المجاني تتم على واتساب أو البريد.',
        ],
      },
      {
        heading: 'عندما تتواصل معنا',
        body: [
          'إذا راسلتنا على واتساب أو البريد نستخدم اسمك ورقمك ورسائلك للرد وإعداد عرض السعر أو التحليل وتنفيذ مشروعك. واتساب ومزوّد البريد يعالجان الرسائل أيضاً وفق سياساتهما.',
          'لا نبيع بياناتك ولا نستخدمها في تسويق لا علاقة له بطلبك.',
        ],
      },
      {
        heading: 'بيانات عملاء عملائنا',
        body: [
          'عندما نبني وكيل ذكاء اصطناعي أو صفحة ليدز أو نظام متابعة لنشاط تجاري، فالنشاط هو من يحدد البيانات التي تُجمع من عملائه. نطّلع عليها فقط لبناء النظام واختباره ودعمه وفق تعليماته، وتبقى البيانات في حسابات يملكها النشاط.',
          'الوكلاء الذين نبنيهم مضبوطون على عدم طلب أي تفاصيل طبية، وتحويل الأسئلة الحساسة لفريق النشاط.',
        ],
      },
      {
        heading: 'اختياراتك',
        body: [
          'يمكنك تغيير اختيار ملفات التعريف بمسح بيانات هذا الموقع من متصفحك، ويمكنك أن تطلب منا في أي وقت الاطلاع على الرسائل والبيانات التي أرسلتها أو حذفها.',
          `للتواصل: ${SITE.email} أو واتساب ${SITE.whatsappDisplay}.`,
        ],
      },
    ],
  },
}

export const termsContent: Record<Locale, LegalDoc> = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: 20 November 2026',
    intro: `These terms apply to projects and audits from ${SITE.name}, a studio based in Cairo, Egypt. Every project also has a written quote on WhatsApp or email. If the quote and these terms differ, the quote wins.`,
    sections: [
      {
        heading: 'Quotes and scope',
        body: [
          'Prices on this site are fixed package prices. Your quote confirms the package, what is included, the delivery time and the price in EGP or USD. Work outside the quote is priced and agreed in writing before we start it.',
        ],
      },
      {
        heading: 'Payment',
        body: [
          'Unless your quote says otherwise, you pay 50% to start and 50% when we hand over the finished work and you accept it.',
          'In Egypt you can pay by InstaPay, Vodafone Cash or bank transfer. Outside Egypt you pay by bank transfer.',
        ],
      },
      {
        heading: 'Timeline',
        body: [
          'Delivery times start once we receive the deposit, your approved content (prices, services, FAQs) and access to the accounts the project needs, such as Meta Business, WhatsApp Business and your domain. Delays in these push the delivery date back by the same amount.',
        ],
      },
      {
        heading: 'Third-party costs',
        body: [
          'You pay these directly to the provider, not to us: WhatsApp and Meta message fees, ad spend, AI model usage, hosting, domains and payment-provider fees. We set them up in accounts you own.',
        ],
      },
      {
        heading: 'Ownership',
        body: [
          'When the final payment is made, you own the delivered build, its content and its data. We keep the right to reuse our general methods and components in other work, and we may show the project in our portfolio unless you ask us not to.',
        ],
      },
      {
        heading: 'Your responsibilities',
        body: [
          "You confirm the prices, services and answers the agent uses, and you keep them up to date. You follow WhatsApp's Business and Commerce policies, including customer opt-in and approved message templates.",
          'The agent answers questions, qualifies leads and books. It does not give medical, legal or financial advice; those questions go to your staff.',
        ],
      },
      {
        heading: 'Tuning and support',
        body: [
          'Each package includes the tuning period stated on it (for example 30 or 60 days) to fix problems and adjust answers within the agreed scope. After that, support is available through an optional monthly plan or a separate quote.',
        ],
      },
      {
        heading: 'Cancellation and refunds',
        body: [
          'If you cancel before we start work, we refund your deposit in full. Once work has started, the deposit covers the work done and is not refundable. If we cannot deliver the agreed scope, we refund what you paid for the parts we did not deliver.',
        ],
      },
      {
        heading: 'Free missed-leads audit',
        body: [
          'The audit is free and creates no obligation. With your permission we contact your business the way a customer would, on WhatsApp or Instagram, record how long replies take, and send you the results and suggested fixes. We share the results only with you.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'Our total liability for a project is limited to the amount you paid for it. We are not responsible for outages, account restrictions or policy changes by Meta, WhatsApp, AI providers or other third parties, or for lost profits.',
        ],
      },
      {
        heading: 'Governing law and contact',
        body: [
          'These terms are governed by the laws of Egypt, and disputes go to the courts of Cairo.',
          `${SITE.email} · WhatsApp ${SITE.whatsappDisplay}`,
        ],
      },
    ],
  },
  ar: {
    title: 'شروط الخدمة',
    updated: 'آخر تحديث: ٢٠ نوفمبر ٢٠٢٦',
    intro: `تنطبق هذه الشروط على المشاريع والتحليلات التي يقدمها ${SITE.name}، استوديو مقره القاهرة. ولكل مشروع عرض سعر مكتوب على واتساب أو البريد، وإذا اختلف عرض السعر عن هذه الشروط يُعمل بعرض السعر.`,
    sections: [
      {
        heading: 'عروض الأسعار ونطاق العمل',
        body: [
          'الأسعار المعروضة في الموقع أسعار ثابتة للباقات. عرض السعر يحدد الباقة وما تشمله ومدة التسليم والسعر بالجنيه أو الدولار. أي عمل خارج العرض يُسعَّر ويُتفق عليه كتابةً قبل البدء فيه.',
        ],
      },
      {
        heading: 'الدفع',
        body: [
          'ما لم يذكر عرض السعر غير ذلك، تدفع ٥٠٪ عند البدء و٥٠٪ عند تسليم العمل وقبولك له.',
          'في مصر يمكنك الدفع عبر إنستاباي أو فودافون كاش أو تحويل بنكي. خارج مصر يكون الدفع بتحويل بنكي.',
        ],
      },
      {
        heading: 'مدة التنفيذ',
        body: [
          'تبدأ مدة التسليم بعد استلام الدفعة الأولى والمحتوى المعتمد منك (الأسعار والخدمات والأسئلة الشائعة) وصلاحيات الحسابات اللازمة مثل Meta Business وواتساب بيزنس والدومين. أي تأخير فيها يؤخر موعد التسليم بنفس المدة.',
        ],
      },
      {
        heading: 'تكاليف الأطراف الأخرى',
        body: [
          'تدفعها مباشرة لمقدم الخدمة وليس لنا: رسوم رسائل واتساب وMeta، ومصاريف الإعلانات، واستخدام نماذج الذكاء الاصطناعي، والاستضافة، والدومين، ورسوم بوابات الدفع. ونجهزها على حسابات تملكها أنت.',
        ],
      },
      {
        heading: 'الملكية',
        body: [
          'بعد سداد الدفعة الأخيرة تصبح مالكاً للعمل المسلَّم ومحتواه وبياناته. نحتفظ بحق استخدام أساليبنا ومكوناتنا العامة في أعمال أخرى، ويمكننا عرض المشروع ضمن أعمالنا ما لم تطلب غير ذلك.',
        ],
      },
      {
        heading: 'مسؤولياتك',
        body: [
          'تعتمد الأسعار والخدمات والإجابات التي يستخدمها الوكيل وتحدّثها باستمرار، وتلتزم بسياسات واتساب للأعمال والتجارة، بما فيها موافقة العميل على المراسلة واستخدام قوالب رسائل معتمدة.',
          'الوكيل يجيب على الأسئلة ويؤهل العملاء ويحجز المواعيد، ولا يقدم أي استشارة طبية أو قانونية أو مالية؛ هذه الأسئلة تُحوَّل لفريقك.',
        ],
      },
      {
        heading: 'الضبط والدعم',
        body: [
          'كل باقة تشمل فترة الضبط المذكورة فيها (مثلاً ٣٠ أو ٦٠ يوماً) لإصلاح المشاكل وتعديل الإجابات داخل النطاق المتفق عليه. بعدها يتوفر الدعم من خلال باقة شهرية اختيارية أو عرض سعر منفصل.',
        ],
      },
      {
        heading: 'الإلغاء والاسترداد',
        body: [
          'إذا ألغيت قبل أن نبدأ العمل نرد الدفعة الأولى بالكامل. بعد بدء العمل تغطي الدفعة الأولى ما تم تنفيذه ولا تُسترد. وإذا لم نتمكن من تسليم النطاق المتفق عليه نرد ما دفعته مقابل الأجزاء التي لم نسلمها.',
        ],
      },
      {
        heading: 'التحليل المجاني للعملاء الضائعين',
        body: [
          'التحليل مجاني ولا يُلزمك بأي شيء. بإذنك نتواصل مع نشاطك كما يفعل أي عميل، على واتساب أو إنستجرام، ونسجل سرعة الرد، ثم نرسل لك النتائج واقتراحات التحسين. النتائج تُرسل لك أنت فقط.',
        ],
      },
      {
        heading: 'حدود المسؤولية',
        body: [
          'مسؤوليتنا الإجمالية عن أي مشروع لا تتجاوز المبلغ الذي دفعته فيه. ولسنا مسؤولين عن الأعطال أو تقييد الحسابات أو تغيير السياسات من Meta أو واتساب أو مزودي الذكاء الاصطناعي أو أي طرف آخر، ولا عن الأرباح الفائتة.',
        ],
      },
      {
        heading: 'القانون الحاكم والتواصل',
        body: [
          'تخضع هذه الشروط لقوانين جمهورية مصر العربية، وتختص محاكم القاهرة بأي نزاع.',
          `${SITE.email} · واتساب ${SITE.whatsappDisplay}`,
        ],
      },
    ],
  },
}
