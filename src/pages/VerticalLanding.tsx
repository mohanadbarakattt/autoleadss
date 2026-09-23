import { Helmet } from 'react-helmet-async'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { waLink } from '../site'
import Footer from '../components/Footer'

const pages = {
  'dentist-websites': { industry: 'dental clinics', demo: 'dentist', image: '/demos/dentist.png', hook: 'Turn searches into booked consultations.', bullets: ['Treatment pages that answer first-visit questions', 'Appointment requests on the page', 'Local FAQ assistant and direct WhatsApp handoff'] },
  'salon-websites': { industry: 'salons and beauty studios', demo: 'lashes', image: '/demos/lashes.png', hook: 'Show the work. Make the next appointment easy.', bullets: ['Service and set catalogue', 'Booking flow with preparation questions', 'FAQ assistant for pricing, fills, and policies'] },
  'restaurant-booking-websites': { industry: 'cafes and restaurants', demo: 'cafe', image: '/demos/cafe.png', hook: 'From menu discovery to a reserved table.', bullets: ['Mobile menu or signature-item showcase', 'Table or tasting reservations', 'Hours, location, and delivery FAQ assistant'] },
  'gym-websites': { industry: 'gyms and fitness studios', demo: 'gym', image: '/demos/gym.png', hook: 'Convert interest into trial sessions.', bullets: ['Class and coaching offer pages', 'Trial-session booking', 'FAQ assistant for hours, location, and what to bring'] },
  'website-design-cairo': { industry: 'businesses in Cairo', demo: 'cafe', image: '/demos/cafe.png', hook: 'A fast, bilingual website built for local conversion.', bullets: ['English, Arabic, or bilingual layout', 'Booking and contact forms', 'Local FAQ assistant and your existing domain connected'] },
  'website-design-dubai': { industry: 'businesses in Dubai and the Gulf', demo: 'agency', image: '/demos/agency.png', hook: 'A clear commercial site without a bloated monthly stack.', bullets: ['English, Arabic, or bilingual layout', 'Booking and lead capture', 'Local FAQ assistant and full handoff'] },
} as const

export default function VerticalLanding() {
  const { slug } = useParams()
  const page = pages[slug as keyof typeof pages]
  if (!page) return <Navigate to="/en" replace />
  const title = `Website design for ${page.industry} | AutoLeadss`
  const brief = `Hi AutoLeadss — I want a website for ${page.industry}.\nLanguage:\nCurrent domain:\nBooking requirement:\nDesired launch date:`
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Helmet><title>{title}</title><meta name="description" content={`${page.hook} Website, booking, forms, and a local FAQ assistant from AutoLeadss.`} /><link rel="canonical" href={`https://autoleadss.com/en/${slug}`} /></Helmet>
      <header className="content-width flex items-center justify-between py-6">
        <Link to="/en" className="font-display text-xl font-bold">AutoLeadss<span className="text-accent">.</span></Link>
        <Link to="/en#examples" className="text-sm text-white/60 hover:text-white">See all demos</Link>
      </header>
      <main>
        <section className="content-width grid min-h-[76vh] items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-accent">Website + booking + FAQ assistant</p>
            <h1 className="mt-4 font-display text-[clamp(2.8rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-tight">{page.hook}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">Built specifically for {page.industry}. The Egypt package starts at 10,000 EGP; outside Egypt, $200. Larger scopes are quoted from the brief.</p>
            <ul className="mt-8 space-y-3">{page.bullets.map(item => <li key={item} className="flex gap-3 text-white/80"><Check size={18} className="mt-0.5 shrink-0 text-[#4edea3]" />{item}</li>)}</ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={waLink(brief)} target="_blank" rel="noopener noreferrer" data-track-location={`vertical_${slug}`} className="inline-flex items-center gap-2 rounded-full bg-wa px-6 py-3.5 text-sm font-semibold text-white"><MessageCircle size={17} /> Get a quote</a>
              <Link to={`/en/demo/${page.demo}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm">Open matching demo <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl"><img src={page.image} alt={`${page.industry} website demo`} className="aspect-[4/3] w-full rounded-2xl object-cover" /></div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
