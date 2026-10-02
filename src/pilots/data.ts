export type PilotSlug = 'jo-x' | '212-car-wash' | 'wash-and-wash' | 'petsika' | '741-cafe'

export type Localized = { en: string; ar: string }

export type PilotPlan = {
  name: Localized
  price: number
  period: Localized
  summary: Localized
  benefits: Localized[]
  featured?: boolean
  rule?: Localized
}

export type PilotProduct = {
  name: string
  price: number
  image: string
}

export type Pilot = {
  slug: PilotSlug
  name: string
  category: Localized
  location: Localized
  phone?: string
  hours: Localized
  eyebrow: Localized
  headline: Localized
  subhead: Localized
  accent: string
  accentSoft: string
  surface: string
  ink: string
  heroImage: string
  gallery: string[]
  logoImage?: string
  monogram: string
  plans: PilotPlan[]
  products?: PilotProduct[]
  sourceUrl: string
  originalSite?: string
  instagram?: string
  redemptionUnit: Localized
  sampleMember: string
}

const listing = (path: string) => `https://madinatyadvisor.com/listing/${path}/`

export const PILOTS: Pilot[] = [
  {
    slug: 'jo-x',
    name: 'Jo X Salon',
    category: { en: 'Men’s grooming', ar: 'حلاقة وعناية رجالية' },
    location: { en: 'Craft Zone · Madinaty', ar: 'كرافت زون · مدينتي' },
    phone: '011 13788547',
    hours: { en: 'Daily · 11 AM–2 AM', ar: 'يومياً · ١١ ص–٢ ص' },
    eyebrow: { en: 'Look sharp. Stay ready.', ar: 'مظهرك جاهز دائماً.' },
    headline: { en: 'Your monthly grooming, already handled.', ar: 'حلاقتك الشهرية، محسوبة وجاهزة.' },
    subhead: { en: 'Choose your rhythm, keep your barber, and use one simple member pass whenever it is time for a reset.', ar: 'اختار نظامك، حافظ على حلاقك، واستخدم بطاقة عضويتك كل ما تحتاج تجدد مظهرك.' },
    accent: '#D8B36A', accentSoft: '#2A241A', surface: '#11110F', ink: '#F6F1E7', monogram: 'JX',
    heroImage: '/pilots/jo-x/hero.jpg',
    gallery: ['/pilots/jo-x/hero.jpg'],
    plans: [
      { name: { en: 'The Regular', ar: 'المنتظم' }, price: 950, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'For a clean reset twice a month.', ar: 'لتجديد مظهرك مرتين في الشهر.' }, benefits: [{ en: '2 haircuts', ar: 'قصتا شعر' }, { en: 'Priority member queue', ar: 'أولوية في الدور' }, { en: 'QR member pass', ar: 'بطاقة عضوية QR' }] },
      { name: { en: 'Cut + Beard', ar: 'شعر + ذقن' }, price: 1350, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'The complete twice-monthly routine.', ar: 'روتين متكامل مرتين شهرياً.' }, benefits: [{ en: '2 haircuts', ar: 'قصتا شعر' }, { en: '2 beard services', ar: 'مرتان للعناية بالذقن' }, { en: 'Priority member queue', ar: 'أولوية في الدور' }], featured: true },
      { name: { en: 'Always Ready', ar: 'جاهز دائماً' }, price: 1800, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'More visits for a consistently sharp look.', ar: 'زيارات أكثر لمظهر ثابت طول الشهر.' }, benefits: [{ en: '3 haircuts', ar: '٣ قصات شعر' }, { en: '2 beard services', ar: 'مرتان للعناية بالذقن' }, { en: '1 guest credit', ar: 'زيارة ضيف واحدة' }] },
    ],
    sourceUrl: listing('jo-x-salon'), instagram: 'https://www.instagram.com/joxsalon/', redemptionUnit: { en: 'grooming visits', ar: 'زيارات عناية' }, sampleMember: 'Omar H.'
  },
  {
    slug: '212-car-wash',
    name: '212 Car Wash',
    category: { en: 'Car care membership', ar: 'عضوية عناية بالسيارة' },
    location: { en: 'Craft Zone · Madinaty', ar: 'كرافت زون · مدينتي' },
    hours: { en: 'Daily · 11 AM–midnight', ar: 'يومياً · ١١ ص–منتصف الليل' },
    eyebrow: { en: 'A clean car, on schedule.', ar: 'سيارة نظيفة، بموعد ثابت.' },
    headline: { en: 'Stop deciding when to wash the car.', ar: 'ما تفكرش كل مرة هتغسل العربية إمتى.' },
    subhead: { en: 'Pick a monthly wash rhythm and redeem each visit with your member QR. Off-peak plans keep service moving without congestion.', ar: 'اختار عدد الغسلات شهرياً واستخدم QR العضوية في كل زيارة. باقات الأوقات الهادئة تقلل الزحام.' },
    accent: '#58C7FF', accentSoft: '#0A2735', surface: '#061117', ink: '#F2FAFD', monogram: '212',
    heroImage: '/pilots/212-car-wash/hero.jpg', gallery: ['/pilots/212-car-wash/hero.jpg'],
    plans: [
      { name: { en: 'City Clean', ar: 'نظافة المدينة' }, price: 550, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'A simple twice-monthly exterior reset.', ar: 'غسيل خارجي مرتين شهرياً.' }, benefits: [{ en: '2 exterior washes', ar: 'غسيلان خارجيان' }, { en: 'Tyre finish', ar: 'تلميع الإطارات' }, { en: 'QR member pass', ar: 'بطاقة عضوية QR' }] },
      { name: { en: 'Weekly Shine', ar: 'لمعة أسبوعية' }, price: 950, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'One full wash for every week.', ar: 'غسلة كاملة لكل أسبوع.' }, benefits: [{ en: '4 full washes', ar: '٤ غسلات كاملة' }, { en: 'Dashboard visit history', ar: 'سجل الزيارات' }, { en: 'Priority member lane', ar: 'مسار أولوية للأعضاء' }], featured: true },
      { name: { en: 'Off-Peak 6', ar: '٦ خارج الذروة' }, price: 1250, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'Best value when you can visit earlier.', ar: 'أفضل قيمة لو تقدر تزور بدري.' }, benefits: [{ en: '6 full washes', ar: '٦ غسلات كاملة' }, { en: 'Sun–Wed before 5 PM', ar: 'الأحد–الأربعاء قبل ٥ م' }, { en: '1 interior refresh', ar: 'تنظيف داخلي خفيف مرة' }], rule: { en: 'Redeem Sun–Wed before 5 PM', ar: 'الاستخدام من الأحد للأربعاء قبل ٥ م' } },
    ],
    sourceUrl: listing('212-car-wash'), redemptionUnit: { en: 'washes', ar: 'غسلات' }, sampleMember: 'Ahmed M.'
  },
  {
    slug: 'wash-and-wash', name: 'Wash & Wash', category: { en: 'Laundry plans', ar: 'باقات غسيل وكي' }, location: { en: 'Craft Zone · Madinaty', ar: 'كرافت زون · مدينتي' }, phone: '010 44856555', hours: { en: 'Open 24 hours', ar: 'مفتوح ٢٤ ساعة' },
    eyebrow: { en: 'Laundry that runs itself.', ar: 'غسيلك ماشي لوحده.' }, headline: { en: 'One monthly plan. No weekly laundry math.', ar: 'باقة شهرية واحدة. من غير حسابات كل أسبوع.' }, subhead: { en: 'Monthly kilo allowances, scheduled pickup, and a clear balance you can check before every order.', ar: 'كيلوهات شهرية، استلام مجدول، ورصيد واضح تراجعه قبل كل طلب.' },
    accent: '#FFDE36', accentSoft: '#2B2812', surface: '#101414', ink: '#F8FAF4', monogram: 'W&W', logoImage: 'https://madinatyadvisor.com/wp-content/uploads/2025/11/Wash-Wash-logo.jpg', heroImage: '/pilots/wash-and-wash/hero.jpg',
    gallery: ['https://madinatyadvisor.com/wp-content/uploads/2025/11/Wash-Wash-1.jpg','https://madinatyadvisor.com/wp-content/uploads/2025/11/Wash-Wash-2.jpg','https://madinatyadvisor.com/wp-content/uploads/2025/11/Wash-Wash-4.jpg'],
    plans: [
      { name: { en: 'Essential 10', ar: 'أساسي ١٠' }, price: 650, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'For one person and everyday basics.', ar: 'لفرد واحد والاحتياجات اليومية.' }, benefits: [{ en: '10 kg wash & fold', ar: '١٠ كجم غسيل وتطبيق' }, { en: '1 pickup & delivery', ar: 'استلام وتوصيل مرة' }, { en: 'Live kilo balance', ar: 'رصيد الكيلوهات مباشر' }] },
      { name: { en: 'Family 20', ar: 'عائلي ٢٠' }, price: 1050, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'A practical family laundry rhythm.', ar: 'نظام عملي لغسيل العائلة.' }, benefits: [{ en: '20 kg wash & fold', ar: '٢٠ كجم غسيل وتطبيق' }, { en: '2 pickup & deliveries', ar: 'استلام وتوصيل مرتان' }, { en: '24-hour priority', ar: 'أولوية ٢٤ ساعة' }], featured: true },
      { name: { en: 'Home 30', ar: 'بيت ٣٠' }, price: 1500, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'More volume with weekly collection.', ar: 'كمية أكبر مع استلام أسبوعي.' }, benefits: [{ en: '30 kg wash & fold', ar: '٣٠ كجم غسيل وتطبيق' }, { en: '4 pickup & deliveries', ar: '٤ مرات استلام وتوصيل' }, { en: '10 pressed pieces', ar: 'كي ١٠ قطع' }] },
    ], sourceUrl: listing('wash-wash'), redemptionUnit: { en: 'kg remaining', ar: 'كجم متبقي' }, sampleMember: 'Mariam A.'
  },
  {
    slug: 'petsika', name: 'Petsika', category: { en: 'Monthly pet baskets', ar: 'سلال شهرية للحيوانات' }, location: { en: 'Craft Zone, Block 7 · Madinaty', ar: 'كرافت زون، بلوك ٧ · مدينتي' }, phone: '011 00619110', hours: { en: 'Daily · noon–2 AM', ar: 'يومياً · ١٢ ظ–٢ ص' },
    eyebrow: { en: 'Paws up. Calm down.', ar: 'اطمّن على احتياجاتهم.' }, headline: { en: 'Their favourites, delivered before you run out.', ar: 'احتياجاتهم المفضلة توصلك قبل ما تخلص.' }, subhead: { en: 'Build a repeat basket for food, litter and treats. Pause, swap or adjust it before the next monthly delivery.', ar: 'كوّن سلة متكررة للأكل والرمل والمكافآت. أوقفها أو بدّل المنتجات قبل التوصيل الشهري.' },
    accent: '#FF775F', accentSoft: '#35201D', surface: '#172522', ink: '#FFF8EB', monogram: 'P', heroImage: '/pilots/petsika/hero.jpg', logoImage: 'https://madinatyadvisor.com/wp-content/uploads/2025/08/460601444_122100994106535587_4552764929621542527_n.jpg',
    gallery: ['https://madinatyadvisor.com/wp-content/uploads/2025/08/501710979_17881731774299864_8907743902318360699_n-1200x1500.jpg','https://madinatyadvisor.com/wp-content/uploads/2025/08/24.08.2025_01.13.34_REC.png'],
    plans: [
      { name: { en: 'Cat Pantry', ar: 'خزانة القطط' }, price: 750, period: { en: '/ basket', ar: '/ سلة' }, summary: { en: 'A flexible monthly cat-food base.', ar: 'أساس مرن لأكل القطط شهرياً.' }, benefits: [{ en: 'Choose food up to plan value', ar: 'اختار أكل بقيمة الباقة' }, { en: 'Monthly delivery', ar: 'توصيل شهري' }, { en: 'Swap before renewal', ar: 'بدّل قبل التجديد' }] },
      { name: { en: 'Complete Cat', ar: 'قطة كاملة' }, price: 1100, period: { en: '/ basket', ar: '/ سلة' }, summary: { en: 'Food, litter and a monthly treat.', ar: 'أكل ورمل ومكافأة شهرية.' }, benefits: [{ en: 'Food + litter allowance', ar: 'رصيد أكل ورمل' }, { en: '1 treat included', ar: 'مكافأة واحدة' }, { en: 'Free Madinaty delivery', ar: 'توصيل مجاني داخل مدينتي' }], featured: true },
      { name: { en: 'Dog Pantry', ar: 'خزانة الكلاب' }, price: 950, period: { en: '/ basket', ar: '/ سلة' }, summary: { en: 'Repeat essentials sized to your dog.', ar: 'احتياجات متكررة مناسبة لكلبك.' }, benefits: [{ en: 'Choose food up to plan value', ar: 'اختار أكل بقيمة الباقة' }, { en: 'Add treats any month', ar: 'أضف مكافآت في أي شهر' }, { en: 'WhatsApp basket changes', ar: 'تعديل السلة عبر واتساب' }] },
    ],
    products: [
      { name: 'LEONARDO Kitten With Chicken 1.8 kg', price: 1320, image: 'https://files.easy-orders.net/1739979889988295632.webp' },
      { name: 'Reflex Sterilised Chicken & Rice 2 kg', price: 690, image: 'https://files.easy-orders.net/1740063180306002988.webp' },
      { name: 'Reflex Salmon & Rice Adult Dog 3 kg', price: 850, image: 'https://files.easy-orders.net/1739979419934653712.webp' },
    ], sourceUrl: listing('petsika'), originalSite: 'https://petsika.com/', instagram: 'https://www.instagram.com/petsika.eg/', redemptionUnit: { en: 'next basket', ar: 'السلة القادمة' }, sampleMember: 'Luna’s home'
  },
  {
    slug: '741-cafe', name: '741', category: { en: 'Coffee club', ar: 'نادي القهوة' }, location: { en: 'Craft Zone · Madinaty', ar: 'كرافت زون · مدينتي' }, phone: '012 22335384', hours: { en: 'Daily · 9 AM–2 AM', ar: 'يومياً · ٩ ص–٢ ص' },
    eyebrow: { en: 'Your usual, on better terms.', ar: 'طلبك المعتاد، بشكل أذكى.' }, headline: { en: 'Make your coffee ritual a membership.', ar: 'حوّل قهوتك اليومية لعضوية.' }, subhead: { en: 'Prepay your monthly drinks, scan once per visit, and keep your regular order delightfully simple.', ar: 'ادفع مشروبات الشهر مقدماً، امسح البطاقة في كل زيارة، وخلي طلبك المعتاد أسهل.' },
    accent: '#F2B66D', accentSoft: '#332417', surface: '#1B1511', ink: '#FFF7EC', monogram: '7:41', heroImage: '/pilots/741-cafe/hero.jpg',
    gallery: ['https://madinatyadvisor.com/wp-content/uploads/2025/04/2024-10-12-1200x900.jpg','https://madinatyadvisor.com/wp-content/uploads/2025/04/2024-11-28-2.jpg','https://madinatyadvisor.com/wp-content/uploads/2025/04/484803686_122196351284302630_4639560244067565458_n-1200x1600.jpg','https://madinatyadvisor.com/wp-content/uploads/2025/04/2024-11-28-1.jpg'],
    plans: [
      { name: { en: 'Ten Cups', ar: 'عشر أكواب' }, price: 650, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'Ten drinks, whenever the mood lands.', ar: '١٠ مشروبات وقت ما تحب.' }, benefits: [{ en: '10 hot or iced drinks', ar: '١٠ مشروبات ساخنة أو باردة' }, { en: 'One redemption per day', ar: 'استخدام واحد يومياً' }, { en: 'Member QR pass', ar: 'بطاقة عضوية QR' }] },
      { name: { en: 'Weekday Ritual', ar: 'روتين أيام العمل' }, price: 900, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'Your regular coffee, Sunday to Thursday.', ar: 'قهوتك المعتادة من الأحد للخميس.' }, benefits: [{ en: '1 standard drink per weekday', ar: 'مشروب عادي كل يوم عمل' }, { en: '20% off a pastry', ar: 'خصم ٢٠٪ على المخبوزات' }, { en: 'Order history', ar: 'سجل الطلبات' }], featured: true, rule: { en: 'One drink daily, Sun–Thu', ar: 'مشروب واحد يومياً، الأحد–الخميس' } },
      { name: { en: 'Work Club', ar: 'نادي الشغل' }, price: 1250, period: { en: '/ month', ar: '/ شهر' }, summary: { en: 'More cups, plus a guest moment.', ar: 'أكواب أكثر ومعاها ضيافة.' }, benefits: [{ en: '20 standard drinks', ar: '٢٠ مشروباً عادياً' }, { en: '2 guest drinks', ar: 'مشروبان للضيف' }, { en: '2 pastry upgrades', ar: 'إضافتا مخبوزات' }] },
    ], sourceUrl: listing('741-seven-forty-one-cafe-lounge'), instagram: 'https://www.instagram.com/seven.fortyone/', redemptionUnit: { en: 'drinks remaining', ar: 'مشروبات متبقية' }, sampleMember: 'Nour E.'
  },
]

export const pilotBySlug = (slug?: string) => PILOTS.find((pilot) => pilot.slug === slug)
