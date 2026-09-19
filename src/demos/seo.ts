import type { Locale } from '../i18n/translations'
import type { DemoId } from './data'

type DemoSeo = { title: string; description: string }

export const DEMO_SEO: Record<DemoId, Record<Locale, DemoSeo>> = {
  cafe: {
    en: {
      title: 'Cafe website Cairo | Qahwa House booking & FAQ chatbot | AutoLeadss',
      description:
        'Qahwa House demo — a cafe website with table booking and a local FAQ chatbot on the page. Demo only. Booking does not create a real appointment. AutoLeadss, Cairo.',
    },
    ar: {
      title: 'موقع كافيه القاهرة | قهوة هاوس حجز وشات بوت | أوتوليدز',
      description:
        'ديمو قهوة هاوس — موقع كافيه بحجز ترابيزة وشات بوت أسئلة على الصفحة. ديمو فقط. الحجز مش حقيقي. أوتوليدز، القاهرة.',
    },
  },
  dentist: {
    en: {
      title: 'Dentist website Egypt | Nile Dental booking & FAQ chatbot | AutoLeadss',
      description:
        'Nile Dental demo — a clinic website with visit booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Egypt.',
    },
    ar: {
      title: 'موقع عيادة أسنان مصر | نايل دينتال حجز وشات بوت | أوتوليدز',
      description:
        'ديمو نايل دينتال — موقع عيادة بحجز زيارة وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، مصر.',
    },
  },
  gym: {
    en: {
      title: 'Gym website Egypt | Forge booking & FAQ chatbot | AutoLeadss',
      description:
        'Forge demo — a gym website with trial-class booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Egypt.',
    },
    ar: {
      title: 'موقع جيم مصر | فورج حجز وشات بوت | أوتوليدز',
      description:
        'ديمو فورج — موقع جيم بحجز كلاس تجريبي وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، مصر.',
    },
  },
  agency: {
    en: {
      title: 'Studio website Cairo | Noon Studio booking & FAQ chatbot | AutoLeadss',
      description:
        'Noon Studio demo — a studio website with discovery-call booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Cairo.',
    },
    ar: {
      title: 'موقع استوديو القاهرة | نون ستوديو حجز وشات بوت | أوتوليدز',
      description:
        'ديمو نون ستوديو — موقع استوديو بحجز مكالمة تعارف وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، القاهرة.',
    },
  },
  lashes: {
    en: {
      title: 'Lash salon website Cairo | Lash Cartel booking & FAQ chatbot | AutoLeadss',
      description:
        'Lash Cartel demo — a lash studio website with set booking and a local FAQ chatbot on the page. Demo only. AutoLeadss, Cairo.',
    },
    ar: {
      title: 'موقع رموش القاهرة | لاش كارتل حجز وشات بوت | أوتوليدز',
      description:
        'ديمو لاش كارتل — موقع استوديو رموش بحجز ست وشات بوت أسئلة على الصفحة. ديمو فقط. أوتوليدز، القاهرة.',
    },
  },
}
