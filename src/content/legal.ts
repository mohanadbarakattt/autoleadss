import type { Locale } from '../i18n/translations'

export interface LegalSection {
  heading: string
  body: string[]
}

export interface LegalDoc {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

/**
 * Generic, sound-for-a-UAE/Egypt agency-and-SaaS legal boilerplate — written from
 * facts that already exist in the repo (company name, contact channels, how demo
 * mode/self-serve billing/data actually work) with no invented registration
 * numbers, named officers, or jurisdiction-specific guarantees. These are a solid
 * starting draft, not a substitute for a lawyer — see the on-page notice.
 */
export const privacyContent: Record<Locale, LegalDoc> = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: July 2026',
    intro:
      'This Privacy Policy explains how AutoLeadss ("we", "us") collects, uses, and protects information when you visit our marketing site, use our self-serve AI funnel builder, or interact with a funnel published by one of our customers. We serve businesses in the UAE, the wider Gulf, and Egypt.',
    sections: [
      {
        heading: 'Who we are',
        body: [
          'AutoLeadss provides two related services: a done-for-you growth agency (funnels, ads, content, and chatbots we build and run for clients), and a self-serve AI funnel builder that lets businesses generate their own landing pages, ad copy, WhatsApp bot flows, and social content.',
          'This policy covers both the main marketing site and the self-serve product.',
        ],
      },
      {
        heading: 'Information we collect',
        body: [
          'Contact form details: when you submit our contact form we collect your name, business name, phone number, email address, country, industry, budget range, and any message you write, plus whether you\'ve opted in to be contacted on WhatsApp.',
          'Account details: if you create a self-serve account, we collect your name, email address, and the region you sell in (Egypt or Gulf/UAE).',
          'Funnel and lead data: if you use the self-serve product to publish a landing page, we store the content you generate and any leads (name, phone, message) captured through that page.',
          'Messages: if you message us, or the WhatsApp number of a funnel published by one of our customers, we (or our messaging provider) receive the message content and your phone number.',
        ],
      },
      {
        heading: 'How we use information',
        body: [
          'To respond to enquiries and book strategy calls.',
          'To deliver the services you\'ve asked for — building and running funnels, ads, content, and chatbots.',
          'To operate your self-serve account, generate and host your funnels, and show you the leads and visits they receive.',
          'To message you on WhatsApp — only where you\'ve opted in.',
          'To improve our product and services, and to meet legal and accounting obligations.',
        ],
      },
      {
        heading: 'How self-serve demo mode works',
        body: [
          'The self-serve product can run in a demo mode with no real account system configured, in which case your account, funnels, and leads are stored only in your own browser\'s local storage and are never sent to our servers. When real authentication and a database are configured, your data is instead stored securely on our servers and is accessible only to you and, where you\'ve explicitly enabled it, your team.',
        ],
      },
      {
        heading: 'Cookies and local storage',
        body: [
          'We use browser local storage to keep you signed in and to store your self-serve funnels and settings in demo mode. We do not currently use third-party advertising or tracking cookies on our marketing site or self-serve product.',
          'Funnels published with the self-serve product may load fonts and similar assets from third-party providers so they render correctly.',
        ],
      },
      {
        heading: 'Sharing information',
        body: [
          'We don\'t sell your personal information. We share it only: with service providers who help us run our product and communications (for example hosting, database, authentication, and messaging providers); when required by law; or with your consent.',
          'If you\'re a lead captured through a customer\'s published funnel, your information is shared with that business so they can follow up with you.',
        ],
      },
      {
        heading: 'Data retention',
        body: [
          'We keep contact-form and account information for as long as reasonably needed to provide our services and meet legal obligations, and delete or anonymize it once it\'s no longer needed. You can ask us to delete your data at any time — see "Your rights" below.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'Depending on where you\'re located, you may have the right to access, correct, export, or delete your personal information, and to withdraw consent (for example, to stop WhatsApp messages) at any time. To exercise any of these rights, contact us using the details below.',
        ],
      },
      {
        heading: 'International transfers',
        body: [
          'We serve customers in the UAE, the wider Gulf, and Egypt, and may use service providers located in other countries. Where we transfer personal information across borders, we take reasonable steps to keep it protected.',
        ],
      },
      {
        heading: 'Children',
        body: ['Our services are intended for businesses and business owners, not children. We don\'t knowingly collect personal information from children.'],
      },
      {
        heading: 'Changes to this policy',
        body: ['We may update this policy from time to time. We\'ll update the "last updated" date above whenever we do.'],
      },
      {
        heading: 'Contact us',
        body: ['Questions about this policy? Reach us at info@autoleadss.com or on WhatsApp at +20 110 005 4278.'],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: يوليو 2026',
    intro:
      'توضّح سياسة الخصوصية هذه كيف تجمع AutoLeadss ("نحن") المعلومات وتستخدمها وتحميها عند زيارتك لموقعنا التسويقي، أو استخدامك لمنشئ القمع بالذكاء الاصطناعي، أو تفاعلك مع قمع منشور لأحد عملائنا. نخدم شركات في الإمارات والخليج ومصر.',
    sections: [
      {
        heading: 'من نحن',
        body: [
          'تقدّم AutoLeadss خدمتين مترابطتين: وكالة نمو متكاملة (قمع، إعلانات، محتوى، وشات بوت نبنيها وندير تشغيلها لعملائنا)، ومنشئ قمع ذاتي الخدمة بالذكاء الاصطناعي يتيح للشركات إنشاء صفحات الهبوط ونصوص الإعلانات وبوت واتساب ومحتوى السوشيال ميديا بنفسها.',
          'تغطّي هذه السياسة كلاً من الموقع التسويقي الرئيسي والمنتج ذاتي الخدمة.',
        ],
      },
      {
        heading: 'المعلومات التي نجمعها',
        body: [
          'بيانات نموذج التواصل: عند إرسال نموذج التواصل نجمع اسمك واسم نشاطك ورقم هاتفك وبريدك الإلكتروني ودولتك وقطاعك ونطاق ميزانيتك وأي رسالة تكتبها، بالإضافة إلى موافقتك على التواصل عبر واتساب من عدمها.',
          'بيانات الحساب: عند إنشاء حساب ذاتي الخدمة، نجمع اسمك وبريدك الإلكتروني والمنطقة التي تبيع فيها (مصر أو الخليج/الإمارات).',
          'بيانات القمع والعملاء: عند استخدام المنتج ذاتي الخدمة لنشر صفحة هبوط، نخزّن المحتوى الذي تولّده وأي عملاء (اسم، هاتف، رسالة) تم التقاطهم عبر تلك الصفحة.',
          'الرسائل: إذا راسلتنا، أو راسلت رقم واتساب لقمع منشور لأحد عملائنا، نستلم (نحن أو مزوّد خدمة المراسلة) محتوى الرسالة ورقم هاتفك.',
        ],
      },
      {
        heading: 'كيف نستخدم المعلومات',
        body: [
          'للردّ على استفساراتك وحجز مكالمات استراتيجية.',
          'لتقديم الخدمات التي طلبتها — بناء وتشغيل القمع والإعلانات والمحتوى وشات البوت.',
          'لتشغيل حسابك ذاتي الخدمة، وتوليد واستضافة قممك، وعرض العملاء والزيارات التي تحصل عليها.',
          'لمراسلتك على واتساب — فقط إذا وافقت على ذلك.',
          'لتحسين منتجنا وخدماتنا، والوفاء بالالتزامات القانونية والمحاسبية.',
        ],
      },
      {
        heading: 'كيف يعمل وضع العرض (Demo Mode) ذاتي الخدمة',
        body: [
          'يمكن أن يعمل المنتج ذاتي الخدمة في وضع عرض بدون نظام حسابات حقيقي، وفي هذه الحالة يُخزَّن حسابك وقممك وعملاؤك فقط في التخزين المحلي لمتصفّحك ولا تُرسَل إلى خوادمنا أبداً. عند تفعيل نظام مصادقة حقيقي وقاعدة بيانات، تُخزَّن بياناتك بدلاً من ذلك بأمان على خوادمنا ولا يصل إليها إلا أنت، وفريقك إن فعّلت ذلك صراحةً.',
        ],
      },
      {
        heading: 'ملفات تعريف الارتباط والتخزين المحلي',
        body: [
          'نستخدم التخزين المحلي للمتصفّح لإبقائك مسجّلاً للدخول ولتخزين قممك وإعداداتك في وضع العرض. لا نستخدم حالياً ملفات تعريف ارتباط إعلانية أو تتبّعية من طرف ثالث على موقعنا التسويقي أو منتجنا ذاتي الخدمة.',
          'قد تحمّل القمع المنشورة عبر المنتج ذاتي الخدمة خطوطاً وأصولاً مشابهة من مزوّدين خارجيين لتظهر بشكل صحيح.',
        ],
      },
      {
        heading: 'مشاركة المعلومات',
        body: [
          'لا نبيع معلوماتك الشخصية. نشاركها فقط: مع مزوّدي الخدمات الذين يساعدوننا في تشغيل منتجنا واتصالاتنا (مثل مزوّدي الاستضافة وقاعدة البيانات والمصادقة والمراسلة)؛ عند الالتزام القانوني بذلك؛ أو بموافقتك.',
          'إذا كنت عميلاً تم التقاطك عبر قمع منشور لأحد عملائنا، تُشارَك معلوماتك مع ذلك النشاط ليتمكّن من متابعتك.',
        ],
      },
      {
        heading: 'الاحتفاظ بالبيانات',
        body: [
          'نحتفظ ببيانات نموذج التواصل والحساب طالما كان ذلك ضرورياً بشكل معقول لتقديم خدماتنا والوفاء بالالتزامات القانونية، ونحذفها أو نُخفي هويّتها عند عدم الحاجة إليها. يمكنك أن تطلب حذف بياناتك في أي وقت — انظر "حقوقك" أدناه.',
        ],
      },
      {
        heading: 'حقوقك',
        body: [
          'حسب موقعك، قد يكون لك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو تصديرها أو حذفها، وسحب موافقتك (مثل إيقاف رسائل واتساب) في أي وقت. لممارسة أي من هذه الحقوق، تواصل معنا عبر البيانات أدناه.',
        ],
      },
      {
        heading: 'النقل الدولي للبيانات',
        body: [
          'نخدم عملاء في الإمارات والخليج ومصر، وقد نستخدم مزوّدي خدمات في دول أخرى. عند نقل المعلومات الشخصية عبر الحدود، نتّخذ خطوات معقولة للحفاظ على حمايتها.',
        ],
      },
      {
        heading: 'الأطفال',
        body: ['خدماتنا موجّهة للشركات وأصحاب الأعمال، وليس للأطفال. لا نجمع معلومات شخصية من الأطفال عن علم.'],
      },
      {
        heading: 'التغييرات على هذه السياسة',
        body: ['قد نحدّث هذه السياسة من وقت لآخر. سنحدّث تاريخ "آخر تحديث" أعلاه عند القيام بذلك.'],
      },
      {
        heading: 'تواصل معنا',
        body: ['أسئلة حول هذه السياسة؟ راسلنا على info@autoleadss.com أو على واتساب +20 110 005 4278.'],
      },
    ],
  },
  'fr-eg': {
    title: 'Privacy Policy (Franco)',
    updated: 'Akher update: Youlyo 2026',
    intro:
      'Note: el nos2ha el rasmeya w el mo3tamada 2anoniyan hya el 3arabeya (shoof el link fo2). El nos2ha di bel Franco 3ashan tefham el fikra be so2ola bas — msh legal document rasmy. Di ezay AutoLeadss betgama3 el ma3lomat w bet2adamha w bet7meeha lama tzoor el mo23 aw testakhdem el funnel builder.',
    sections: [
      {
        heading: 'Meen e7na',
        body: [
          'AutoLeadss 3andaha 7agtein: wakala betebni w tshaghal el funnels/ads/content/chatbot le 3omalaeha, w self-serve product (AI funnel builder) elly bykhalli el business ye3mel landing pages w ads w chatbot w social content lewa7do.',
        ],
      },
      {
        heading: 'El ma3lomat elly bngama3ha',
        body: [
          'Contact form: esm, esm el nashat, telefon, email, balad, sector, mizaneya, w ay resala, w law wafa2t 3ala WhatsApp.',
          'Account: esm, email, w el region (Masr aw El Khaleeg).',
          'Funnels w leads: el content elly enta 3amaltoh w ay leads (esm, telefon, resala) gat men el published page beta3ak.',
          'Rasa2el: law raslt WhatsApp beta3na aw beta3 funnel le 3amel 3andena, benwasal 7na (aw el messaging provider) el resala w ra2m telefonak.',
        ],
      },
      {
        heading: 'Ezay bnestakhdem el ma3lomat',
        body: [
          '3ashan naradd 3ala as2elat w nehgez calls.',
          '3ashan naddi el khadama elly talabtaha.',
          '3ashan nshaghal el account beta3ak w nwareek el leads w el zeyarat.',
          '3ashan nraslak WhatsApp — bas law wafa2t.',
        ],
      },
      {
        heading: 'Demo mode',
        body: [
          'Fi demo mode, el account w el funnels w el leads beta3ak bytkhazano bas fel browser beta3ak — mesh betrouho le server. Law fi real auth w database, el data betetkhazen bel amaan 3ala el server w mafeesh 7ad yeshoofha ghair enta (w el team beta3ak law fatta7t da).',
        ],
      },
      {
        heading: 'Cookies w local storage',
        body: ['Benestakhdem local storage 3ashan tefdal logged in w 3ashan nekhazen el funnels beta3ak fi demo mode. Mafeesh third-party ad-tracking cookies delwa2ty.'],
      },
      {
        heading: 'Sharing el ma3lomat',
        body: ['Mabnbee3sh el data beta3ak. Bnesharekha bas ma3 service providers (hosting, database, auth, messaging), law el 2anoon yetlob keda, aw be mowafaqtak.'],
      },
      {
        heading: 'Ho2ou2ak',
        body: ['Momken yeb2a leek el ha2 en tshoof, tesa77a7, tesaddar, aw tomsah el data beta3ak, w tsa7ab el mowafa2a emta 3ayez. Kallemna 3al details ta7t.'],
      },
      {
        heading: 'Kallemna',
        body: ['As2ela? info@autoleadss.com aw WhatsApp +20 110 005 4278.'],
      },
    ],
  },
}

export const termsContent: Record<Locale, LegalDoc> = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: July 2026',
    intro:
      'These Terms of Service govern your use of the AutoLeadss marketing site, the self-serve AI funnel builder, and any funnel published through it. By using any of these, you agree to these terms.',
    sections: [
      {
        heading: 'Our services',
        body: [
          'AutoLeadss offers a done-for-you growth agency service, scoped and priced per engagement after a strategy call, and a self-serve AI funnel builder with published pricing at /pricing. These terms apply to both.',
        ],
      },
      {
        heading: 'Accounts',
        body: [
          'You must provide accurate information when creating an account and are responsible for activity under your account. In demo mode there is no real identity verification — don\'t rely on it for handling real customer data or payments.',
        ],
      },
      {
        heading: 'Your content and data',
        body: [
          'You own the pages, ad accounts, content, and leads created through our done-for-you or self-serve services. You can request an export of your data, or stop using our services, at any time.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Don\'t use our services for anything illegal, to send spam or unsolicited bulk messages, to scrape or resell the product without an agency/white-label plan, or to publish content that infringes someone else\'s rights.',
        ],
      },
      {
        heading: 'Fees and payment',
        body: [
          'Self-serve plans are billed per the pricing shown at /pricing at the time you subscribe. Done-for-you engagements are billed per your signed agreement. Where payment processing is enabled, it\'s handled by our payment provider under their own terms.',
        ],
      },
      {
        heading: 'Third-party services',
        body: [
          'Some features rely on third-party providers — for example authentication, hosting, database, and WhatsApp Cloud API providers. Your use of those features is also subject to those providers\' own terms (for example Meta\'s WhatsApp Business policies).',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'The AutoLeadss name, logo, and the underlying software are our property. This doesn\'t affect your ownership of the content and data described above.',
        ],
      },
      {
        heading: 'Termination',
        body: [
          'You can stop using our services at any time. We may suspend or terminate an account for abuse of these terms or non-payment. Where reasonably possible, we\'ll let you export your data first.',
        ],
      },
      {
        heading: 'Disclaimers',
        body: [
          'Our services are provided "as is." Case studies and metrics shown on our site reflect real, specific engagements — they aren\'t a guarantee of the same results for every business, which depend on many factors outside our control.',
        ],
      },
      {
        heading: 'Limitation of liability',
        body: [
          'To the maximum extent permitted by law, AutoLeadss isn\'t liable for indirect, incidental, or consequential damages arising from your use of our services.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are intended to be governed by the laws of the United Arab Emirates, without limiting any mandatory consumer-protection rights you may have under the laws of your own country. (This section should be confirmed with a qualified lawyer before launch.)',
        ],
      },
      {
        heading: 'Changes to these terms',
        body: ['We may update these terms from time to time. We\'ll update the "last updated" date above whenever we do.'],
      },
      {
        heading: 'Contact us',
        body: ['Questions about these terms? Reach us at info@autoleadss.com or on WhatsApp at +20 110 005 4278.'],
      },
    ],
  },
  ar: {
    title: 'شروط الخدمة',
    updated: 'آخر تحديث: يوليو 2026',
    intro:
      'تحكم شروط الخدمة هذه استخدامك لموقع AutoLeadss التسويقي، ومنشئ القمع ذاتي الخدمة بالذكاء الاصطناعي، وأي قمع منشور من خلاله. باستخدامك لأي منها فإنك توافق على هذه الشروط.',
    sections: [
      {
        heading: 'خدماتنا',
        body: [
          'تقدّم AutoLeadss خدمة وكالة نمو متكاملة، يُحدَّد نطاقها وسعرها لكل مشروع بعد مكالمة استراتيجية، ومنتج قمع ذاتي الخدمة بأسعار منشورة على /pricing. تنطبق هذه الشروط على كليهما.',
        ],
      },
      {
        heading: 'الحسابات',
        body: [
          'يجب تقديم معلومات دقيقة عند إنشاء حساب، وأنت مسؤول عن النشاط تحت حسابك. في وضع العرض لا يوجد تحقّق حقيقي من الهوية — لا تعتمد عليه للتعامل مع بيانات عملاء حقيقيين أو مدفوعات.',
        ],
      },
      {
        heading: 'محتواك وبياناتك',
        body: [
          'أنت تملك الصفحات وحسابات الإعلانات والمحتوى والعملاء الذين تم إنشاؤهم عبر خدماتنا. يمكنك طلب تصدير بياناتك، أو التوقّف عن استخدام خدماتنا، في أي وقت.',
        ],
      },
      {
        heading: 'الاستخدام المقبول',
        body: [
          'لا تستخدم خدماتنا في أي شيء غير قانوني، أو لإرسال رسائل مزعجة جماعية، أو لاستخراج المحتوى أو إعادة بيع المنتج بدون باقة وكالة/وايت ليبل، أو لنشر محتوى ينتهك حقوق الآخرين.',
        ],
      },
      {
        heading: 'الرسوم والدفع',
        body: [
          'تُفوتَر باقات الخدمة الذاتية حسب الأسعار المعروضة على /pricing وقت اشتراكك. تُفوتَر مشاريع الخدمة الكاملة حسب اتفاقك الموقّع. حيث تُفعَّل معالجة الدفع، تتم عبر مزوّد الدفع وفق شروطه الخاصة.',
        ],
      },
      {
        heading: 'خدمات الطرف الثالث',
        body: [
          'تعتمد بعض المزايا على مزوّدين خارجيين — مثل المصادقة والاستضافة وقاعدة البيانات ومزوّدي WhatsApp Cloud API. استخدامك لهذه المزايا يخضع أيضاً لشروط أولئك المزوّدين (مثل سياسات واتساب بزنس من ميتا).',
        ],
      },
      {
        heading: 'الملكية الفكرية',
        body: ['اسم AutoLeadss وشعارها والبرمجيات الأساسية ملك لنا. هذا لا يؤثّر على ملكيتك للمحتوى والبيانات الموضّحة أعلاه.'],
      },
      {
        heading: 'الإنهاء',
        body: [
          'يمكنك التوقّف عن استخدام خدماتنا في أي وقت. قد نعلّق أو ننهي حساباً بسبب إساءة استخدام هذه الشروط أو عدم الدفع. حيثما أمكن، سنتيح لك تصدير بياناتك أولاً.',
        ],
      },
      {
        heading: 'إخلاء المسؤولية',
        body: [
          'تُقدَّم خدماتنا "كما هي". دراسات الحالة والأرقام المعروضة على موقعنا تعكس مشاريع حقيقية محدّدة — وليست ضماناً لنفس النتائج لكل نشاط، والتي تعتمد على عوامل كثيرة خارج سيطرتنا.',
        ],
      },
      {
        heading: 'تحديد المسؤولية',
        body: ['إلى أقصى حدّ يسمح به القانون، لا تتحمّل AutoLeadss مسؤولية الأضرار غير المباشرة أو العرضية أو التبعية الناشئة عن استخدامك لخدماتنا.'],
      },
      {
        heading: 'القانون الحاكم',
        body: [
          'يُقصَد أن تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة، دون الإخلال بأي حقوق حماية للمستهلك ملزمة قانوناً بموجب قوانين بلدك. (يجب تأكيد هذا البند مع محامٍ مختص قبل الإطلاق.)',
        ],
      },
      {
        heading: 'التغييرات على هذه الشروط',
        body: ['قد نحدّث هذه الشروط من وقت لآخر. سنحدّث تاريخ "آخر تحديث" أعلاه عند القيام بذلك.'],
      },
      {
        heading: 'تواصل معنا',
        body: ['أسئلة حول هذه الشروط؟ راسلنا على info@autoleadss.com أو على واتساب +20 110 005 4278.'],
      },
    ],
  },
  'fr-eg': {
    title: 'Terms of Service (Franco)',
    updated: 'Akher update: Youlyo 2026',
    intro:
      'Note: el nos2ha el rasmeya hya el 3arabeya (shoof el link fo2). Di summary bel Franco 3ashan tefham el shorout be so2ola. Be estekhdamak lel mo23 aw el product, enta mwafe2 3ala el shorout di.',
    sections: [
      {
        heading: 'El khadamat beta3etna',
        body: ['Wakala done-for-you (scope w se3r 7asab el project ba3d call), w self-serve funnel builder be as3ar manshora 3ala /pricing.'],
      },
      {
        heading: 'El accounts',
        body: ['Lazem tedeeni ma3lomat sa7ee7a. Enta mas2ool 3an ay 7aga te7sal ta7t el account beta3ak. Fi demo mode mafeesh ta7a2o2 ho2ee2y — matetmedsh 3aleeh le data 3omala2 7a2ee2ya aw madfoo3at.'],
      },
      {
        heading: 'El content w el data beta3ak',
        body: ['Enta malek el pages w el ad accounts w el content w el leads. Te2dar teskhrog el data beta3ak aw te2fel el account emta 3ayez.'],
      },
      {
        heading: 'Estekhdam ma2boul',
        body: ['Ma testakhdemsh el khadama fi 7aga mesh 2anoneya, spam, scraping, aw resale bidoon plan wakala/white-label.'],
      },
      {
        heading: 'El fawater',
        body: ['El self-serve plans betefwater 7asab el se3r 3ala /pricing wa2t el eshterak. El done-for-you 7asab el 3a2d el mowa22a3.'],
      },
      {
        heading: 'Termination',
        body: ['Te2dar te2fel el account emta 3ayez. Momken ne3allek el account law fi abuse aw non-payment — hansa77alak teskhrog el data awalan law momken.'],
      },
      {
        heading: 'Disclaimers',
        body: ['El khadama betetadem "as is". El case studies 3al mo23 7a2ee2ya bas mesh damana lel nata2eg le kol business.'],
      },
      {
        heading: 'Kallemna',
        body: ['As2ela? info@autoleadss.com aw WhatsApp +20 110 005 4278.'],
      },
    ],
  },
}
