export const SITE = {
  name: 'AutoLeadss',
  email: 'mohanad.barakat@mbai-group.com',
  whatsapp: '201100054278',
  whatsappDisplay: '+20 110 005 4278',
  whatsappLocal: '011 0005 4278',
  waBase: 'https://wa.me/201100054278',
  mbai: 'https://mbai-group.com',
  origin: 'https://autoleadss.com',
  cities: 'Cairo · Dubai',
} as const

export const WORK = [
  { id: 'tut', href: 'https://tutapp.co', img: '/work/tut.png', url: 'tutapp.co' },
  { id: 'ibni', href: 'https://ibni.app', img: '/work/ibni.png', url: 'ibni.app' },
  { id: 'virlo', href: 'https://mbai-group.com/virlo', img: '/work/virlo.png', url: 'mbai-group.com/virlo' },
] as const

export function waLink(text: string) {
  return `${SITE.waBase}?text=${encodeURIComponent(text)}`
}

export function mailLink(text: string, subject: string) {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
}
