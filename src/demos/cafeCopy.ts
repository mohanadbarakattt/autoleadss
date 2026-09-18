import type { Locale } from '../i18n/translations'

export type CafeZone = { title: string; body: string }
export type CafeProductMeta = {
  origin: string
  roast: string
  roastPct: number
  tags: string[]
  badge: string
  alt: string
}

export type CafeUi = {
  roasting: string
  originLive: string
  audio: string
  titleLead: string
  titlePlace: string
  notesLabel: string
  notes: string[]
  heroCta: string
  heroOrder: string
  heroHint: string
  qGrade: string
  qGradeSub: string
  qGradeFloor: string
  extractLive: string
  extractTds: string
  extractBody: string
  extractPlace: string
  extractLimit: string
  giesenSub: string
  giesen: string
  reserveEyebrow: string
  reserveTitle: string
  reserveBody: string
  reserveBadge: string
  zoneStep: string
  slotStep: string
  slotsLeft: string
  party: string
  guestsWord: string
  guestWord: string
  method: string
  methods: string[]
  zones: CafeZone[]
  slotNotes: string[]
  passTitle: string
  passVerified: string
  passZone: string
  passSlot: string
  passParty: string
  passMethod: string
  passWater: string
  passWaterVal: string
  namePh: string
  phonePh: string
  confirm: string
  confirmed: string
  successTitle: string
  successBody: string
  policy: string
  beansEyebrow: string
  beansTitle: string
  beansSub: string
  dispatch: string
  roastLabel: string
  mapEyebrow: string
  mapTitle: string
  mapBody: string
  pin: string
  maps: string
  walkTitle: string
  walkHint: string
  hoursHint: string
  footerAr: string
  navBeans: string
  navReserve: string
  navPlace: string
  roastBadge: string
  products: CafeProductMeta[]
}

export const cafeUi: Record<Locale, CafeUi> = {
  en: {
    roasting: 'Roasting batch #419 live',
    originLive: 'Yemen Haraz',
    audio: 'AM 432Hz acoustic vinyl salon',
    titleLead: 'Tactile single-origin roasters. Roasted daily on',
    titlePlace: 'Road 9, Maadi.',
    notesLabel: "Today's cupping notes on tap",
    notes: ['White jasmine', 'Bergamot zest', 'Raw acacia honey', 'Green cardamom', '42h cold drip'],
    heroCta: 'Reserve tasting table',
    heroOrder: 'Order beans',
    heroHint: '15m',
    qGrade: '88.5+',
    qGradeSub: 'Q-Grader',
    qGradeFloor: 'Cupping floor',
    extractLive: "Today's extraction flow",
    extractTds: 'TDS 72 PPM',
    extractBody: '42-hour slow drip cold elixir pouring until 7 PM.',
    extractPlace: 'Maadi villa 14 · Road 9',
    extractLimit: 'Limited 18 pours',
    giesenSub: 'Nordic calibration',
    giesen: 'Giesen Drum Pro · 2025',
    reserveEyebrow: 'Intimate salon reservations',
    reserveTitle: 'Reserve your brew bar or tasting table',
    reserveBody: 'We keep an unhurried sanctuary on Road 9. Calibrated water, quiet seating, barista flight pairings.',
    reserveBadge: 'No deposit · Confirmation stays on this page',
    zoneStep: '1. Choose atmosphere / zone',
    slotStep: '2. Select tasting slot',
    slotsLeft: 'Today · 4 slots left',
    party: 'Party size',
    guestsWord: 'Guests',
    guestWord: 'Guest',
    method: 'Extraction method',
    methods: [
      'Hario V60 single-origin flight',
      'Japanese siphon slow extraction',
      'Kalita Wave dual bean pair',
      '42h cold drip tasting service',
    ],
    zones: [
      { title: 'Sunken garden', body: 'Leafy Road 9 patio under eucalyptus shade.' },
      { title: 'Roaster counter', body: 'Front-row view of the Giesen drum and cuppings.' },
      { title: 'AC library', body: 'Deep focus, 150 Mbps fiber and power.' },
    ],
    slotNotes: ['Morning extraction', 'Siphon ritual', 'Cold drip flight', 'Sunset pour-over', 'Barista cupping', 'Acoustic late brew'],
    passTitle: 'Qahwa Pass',
    passVerified: 'Road 9 verified',
    passZone: 'Zone',
    passSlot: 'Scheduled slot',
    passParty: 'Party size',
    passMethod: 'Extraction',
    passWater: 'Barista water recipe',
    passWaterVal: '72 PPM Nordic TDS',
    namePh: 'Your name',
    phonePh: 'Mobile',
    confirm: 'Confirm tasting pass',
    confirmed: 'Reservation pass active',
    successTitle: 'Table reserved on Road 9',
    successBody: 'This is a demo. No WhatsApp was sent.',
    policy: 'Tables held 15 minutes past the start. On a live cafe site, changes would go to WhatsApp up to 30 minutes prior.',
    beansEyebrow: 'Direct-trade micro batches',
    beansTitle: 'Single-origin roasts & cold elixirs',
    beansSub: 'Sealed in nitrogen-valved tins within two hours of the drum.',
    dispatch: 'Same-day dispatch across Cairo (Maadi, Zamalek, New Cairo)',
    roastLabel: 'Roast profile',
    mapEyebrow: 'Road 9 flagship haven',
    mapTitle: 'Under the jacarandas of South Cairo.',
    mapBody:
      'Far from mall bustle, Qahwa House sits in a 1940s garden villa on Road 9. Vinyl against the measured tick of EK43 grinders.',
    pin: 'Road 9 flagship roastery',
    maps: 'Open Google Maps',
    walkTitle: 'Road 9, Maadi, Cairo',
    walkHint: '3 min stroll from Degla Metro · Valet assisted',
    hoursHint: 'Roaster runs Mondays & Thursdays at 11:00 AM',
    footerAr: 'استوديو تحميص القهوة المختصة المعادي',
    navBeans: 'Single origins',
    navReserve: 'Tasting & tables',
    navPlace: 'Road 9 roastery',
    roastBadge: 'Roasters',
    products: [
      { origin: 'Ethiopia Gedeo', roast: 'Nordic light', roastPct: 34, tags: ['Jasmine flower', 'Meyer lemon', 'Bergamot'], badge: 'Light roast', alt: '2,100 MASL' },
      { origin: 'Colombia Huila', roast: 'Medium-light', roastPct: 50, tags: ['Blood orange', 'Wild honey', 'Papaya'], badge: 'Micro-lot', alt: '1,950 MASL' },
      { origin: 'Yemen Haraz extraction', roast: '42 hours tower', roastPct: 100, tags: ['Dark fig', 'Cacao nibs', 'Cardamom'], badge: 'Slow tower', alt: '500ml glass' },
      { origin: 'Artisanal bakery', roast: 'Twice daily', roastPct: 75, tags: ['Siwa date caramel', 'Green cardamom', 'Pistachio'], badge: 'Daily 8 AM', alt: 'From our oven' },
    ],
  },
  ar: {
    roasting: 'تحميص دفعة #٤١٩ مباشر',
    originLive: 'يمن حراز',
    audio: 'صالون فينيل صوتي ٤٣٢ هرتز',
    titleLead: 'محمصة أصول مفردة. تحميص يومي على',
    titlePlace: 'شارع ٩، المعادي.',
    notesLabel: 'نوتات التذوق النهاردة',
    notes: ['ياسمين أبيض', 'برغموت', 'عسل أكاسيا', 'هيل أخضر', 'تقطير ٤٢ ساعة'],
    heroCta: 'احجز ترابيزة تذوق',
    heroOrder: 'اطلب بن',
    heroHint: '١٥ د',
    qGrade: '٨٨٫٥+',
    qGradeSub: 'كيو-جريد',
    qGradeFloor: 'أرضية التذوق',
    extractLive: 'استخلاص النهاردة',
    extractTds: 'TDS ٧٢ PPM',
    extractBody: 'إكسير كولد دريب ٤٢ ساعة لحد ٧ مساءً.',
    extractPlace: 'فيلا ١٤ المعادي · شارع ٩',
    extractLimit: '١٨ صب فقط',
    giesenSub: 'معايرة نوردية',
    giesen: 'جيزن درم برو · ٢٠٢٥',
    reserveEyebrow: 'حجوزات صالون هادية',
    reserveTitle: 'احجز بار التخمير أو ترابيزة التذوق',
    reserveBody: 'مكان هادي على شارع ٩. مية متعايرة، قعدة ساكتة، وتذوق مع الباريستا.',
    reserveBadge: 'من غير ديبوزيت · التأكيد على الصفحة',
    zoneStep: '١. اختار الجو / الزون',
    slotStep: '٢. اختار ميعاد التذوق',
    slotsLeft: 'النهاردة · ٤ مواعيد فاضية',
    party: 'عدد الناس',
    guestsWord: 'ضيوف',
    guestWord: 'ضيف',
    method: 'طريقة الاستخلاص',
    methods: [
      'هاريو V60 أصول مفردة',
      'سيفون ياباني بطيء',
      'كاليتا ويف زوج بن',
      'تذوق كولد دريب ٤٢ ساعة',
    ],
    zones: [
      { title: 'الجاردن الغاطس', body: 'بلكونة شارع ٩ تحت ظل الكافور.' },
      { title: 'كاونتر المحمصة', body: 'صف أول على درم جيزن والتذوق.' },
      { title: 'مكتبة التكييف', body: 'تركيز، فايبر ١٥٠ والباور.' },
    ],
    slotNotes: ['استخلاص الصباح', 'طقس السيفون', 'فلايت كولد دريب', 'صب الغروب', 'تذوق باريستا', 'تخمير ليلي'],
    passTitle: 'كاهوا باس',
    passVerified: 'شارع ٩ موثّق',
    passZone: 'الزون',
    passSlot: 'الميعاد',
    passParty: 'العدد',
    passMethod: 'الاستخلاص',
    passWater: 'وصفة المية',
    passWaterVal: '٧٢ PPM نوردية',
    namePh: 'الاسم',
    phonePh: 'الموبايل',
    confirm: 'أكد باس التذوق',
    confirmed: 'الباس شغال',
    successTitle: 'الترابيزة اتحجزت على شارع ٩',
    successBody: 'ده ديمو. مفيش واتساب اتبعت.',
    policy: 'نمسك الترابيزة ربع ساعة بعد الميعاد. على موقع حي، التعديل يروح واتساب لحد ٣٠ دقيقة قبلها.',
    beansEyebrow: 'دفعات تجارة مباشرة',
    beansTitle: 'تحميص أصول مفردة وإكسير بارد',
    beansSub: 'يتقفل في علب نيتروجين خلال ساعتين من الدرم.',
    dispatch: 'توصيل نفس اليوم في القاهرة (المعادي، الزمالك، القاهرة الجديدة)',
    roastLabel: 'بروفايل التحميص',
    mapEyebrow: 'ملاذ شارع ٩',
    mapTitle: 'تحت الجاكرندا في جنوب القاهرة.',
    mapBody: 'بعيد عن المولات، قهوة هاوس في فيلا جنينة من الأربعينات على شارع ٩. فينيل على تكتكة الجريندر.',
    pin: 'محمصة شارع ٩',
    maps: 'افتح خرائط جوجل',
    walkTitle: 'شارع ٩، المعادي، القاهرة',
    walkHint: '٣ دقايق من مترو دجلة · فاليه',
    hoursHint: 'المحمصة الاثنين والخميس الساعة ١١ ص',
    footerAr: 'استوديو تحميص القهوة المختصة المعادي',
    navBeans: 'الأصول',
    navReserve: 'تذوق وترابيزات',
    navPlace: 'محمصة شارع ٩',
    roastBadge: 'محمصة',
    products: [
      { origin: 'إثيوبيا جيدو', roast: 'نورديك لايت', roastPct: 34, tags: ['ياسمين', 'ليمون ماير', 'برغموت'], badge: 'تحميص فاتح', alt: '٢٬١٠٠ متر' },
      { origin: 'كولومبيا ويلا', roast: 'وسط-فاتح', roastPct: 50, tags: ['برتقال دم', 'عسل بري', 'بابايا'], badge: 'مايكرو-لوت', alt: '١٬٩٥٠ متر' },
      { origin: 'استخلاص يمن حراز', roast: 'برج ٤٢ ساعة', roastPct: 100, tags: ['تين غامق', 'كاكاو', 'هيل'], badge: 'تاور بطيء', alt: '٥٠٠ مل' },
      { origin: 'مخبز', roast: 'مرتين في اليوم', roastPct: 75, tags: ['كراميل عجوة سيوة', 'هيل', 'فستق'], badge: 'يومياً ٨ ص', alt: 'من الفرن' },
    ],
  },
}
