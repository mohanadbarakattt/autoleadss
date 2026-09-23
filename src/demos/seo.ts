import type { Locale } from '../i18n/translations'
import type { DemoId } from './data'

type DemoSeo = { title: string; description: string }

export const DEMO_SEO: Record<DemoId, Record<Locale, DemoSeo>> = {
  cafe: {
    en: {
      title: 'Cafe website with table booking | Qahwa House demo | AutoLeadss',
      description:
        'Qahwa House demo — a cafe website with table booking and a local FAQ chatbot on the page. Demo only. Booking does not create a real appointment. AutoLeadss, Cairo.',
    },
    ar: {
      title: 'موقع كافيه مع حجز ترابيزة | ديمو قهوة هاوس | أوتوليدز',
      description:
        'ديمو قهوة هاوس — موقع كافيه بحجز ترابيزة وشات بوت أسئلة على الصفحة. ديمو فقط. الحجز مش حقيقي. أوتوليدز، القاهرة.',
    },
  },
  dentist: {
    en: {
      title: 'Clinic website with visit booking | Nile Dental demo | AutoLeadss',
      description:
        'Nile Dental demo — a clinic website with visit booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Egypt.',
    },
    ar: {
      title: 'موقع عيادة مع حجز زيارة | ديمو نايل دينتال | أوتوليدز',
      description:
        'ديمو نايل دينتال — موقع عيادة بحجز زيارة وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، مصر.',
    },
  },
  gym: {
    en: {
      title: 'Gym website with trial booking | Forge demo | AutoLeadss',
      description:
        'Forge demo — a gym website with trial booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Egypt.',
    },
    ar: {
      title: 'موقع جيم مع حجز تجربة | ديمو فورج | أوتوليدز',
      description:
        'ديمو فورج — موقع جيم بحجز تجربة وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، مصر.',
    },
  },
  agency: {
    en: {
      title: 'Studio website with call booking | Noon Studio demo | AutoLeadss',
      description:
        'Noon Studio demo — a studio website with call booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Cairo.',
    },
    ar: {
      title: 'موقع استوديو مع حجز مكالمة | ديمو نون ستوديو | أوتوليدز',
      description:
        'ديمو نون ستوديو — موقع استوديو بحجز مكالمة وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، القاهرة.',
    },
  },
  lashes: {
    en: {
      title: 'Lash salon website with set booking | Lash Cartel demo | AutoLeadss',
      description:
        'Lash Cartel demo — a lash salon website with set booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Cairo.',
    },
    ar: {
      title: 'موقع رموش مع حجز جلسة | ديمو لاش كارتل | أوتوليدز',
      description:
        'ديمو لاش كارتل — موقع رموش بحجز جلسة وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، القاهرة.',
    },
  },
}
