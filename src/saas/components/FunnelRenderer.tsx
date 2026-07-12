
import { useState } from 'react'
import { Plus, Check, Star } from 'lucide-react'
import { Icon } from './Icon'
import type { FunnelSpec } from '../types'

export default function FunnelRenderer({
  spec,
  accent = '#FF5C2A',
  onLead,
  scale = false,
}: {
  spec: FunnelSpec
  accent?: string
  onLead?: (data: { name: string; phone: string; extra?: string }) => void
  scale?: boolean
}) {
  const rtl = spec.language === 'ar'
  const [open, setOpen] = useState(0)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const p = spec.page

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const vals = Object.values(form)
    onLead?.({ name: vals[0] || 'Lead', phone: vals[1] || '', extra: vals[2] })
    setSent(true)
  }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className={`bg-white text-[#0A0A0B] ${rtl ? 'font-arabic' : ''}`} style={{ fontSize: scale ? 13 : undefined }}>
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden px-6 py-16 md:px-12 md:py-24" style={{ background: '#0A0A0B' }}>
        <div aria-hidden className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(ellipse 70% 60% at 70% 30%, ${accent}44 0%, transparent 70%)` }} />
        <div aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse at center, black, transparent 75%)' }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border px-4 py-1.5 text-xs font-medium" style={{ borderColor: `${accent}55`, color: accent }}>
            {p.hero.eyebrow}
          </span>
          <h1 className="mt-5 font-display font-bold text-white" style={{ fontSize: scale ? '2rem' : 'clamp(2.2rem, 5vw, 3.6rem)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {p.hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70" style={{ fontSize: scale ? 14 : 17, lineHeight: 1.6 }}>
            {p.hero.subhead}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#lead" className="rounded-full px-7 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5" style={{ background: accent }}>
              {p.hero.ctaPrimary}
            </a>
            <a href="#lead" className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/5">
              {p.hero.ctaSecondary}
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {p.hero.badges.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-white/60">
                <Check size={13} style={{ color: accent }} /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Stats ---- */}
      <section className="border-b border-[#E2DED4] bg-[#FAFAF7] px-6 py-10 md:px-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 text-center">
          {p.stats.map((s, i) => (
            <div key={i}>
              <p className="font-display font-bold" style={{ color: accent, fontSize: scale ? '1.6rem' : 'clamp(1.6rem, 3vw, 2.4rem)', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p className="mt-1 text-xs text-[#57544E]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {p.features.map((f, i) => (
            <div key={i} className="rounded-2xl border border-[#E2DED4] bg-white p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${accent}18` }}>
                <Icon name={f.icon} size={20} className="" />
              </span>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#57544E]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Testimonials ---- */}
      <section className="bg-[#F1EFE9] px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
          {p.testimonials.map((tt, i) => (
            <div key={i} className="rounded-2xl border border-[#E2DED4] bg-white p-6">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} style={{ fill: accent, color: accent }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#0A0A0B]/90">“{tt.quote}”</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: accent }}>{tt.name.charAt(0)}</span>
                <div>
                  <p className="text-xs font-semibold">{tt.name}</p>
                  <p className="text-[11px] text-[#57544E]">{tt.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-3">
            {p.faq.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={i} className={`overflow-hidden rounded-xl border bg-white transition-colors ${isOpen ? '' : 'border-[#E2DED4]'}`} style={isOpen ? { borderColor: `${accent}66` } : undefined}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start">
                    <span className="text-sm font-semibold">{item.q}</span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform ${isOpen ? 'rotate-45 text-white' : 'bg-[#F1EFE9] text-[#57544E]'}`} style={isOpen ? { background: accent } : undefined}>
                      <Plus size={14} />
                    </span>
                  </button>
                  {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-[#57544E]">{item.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---- Lead form + final CTA ---- */}
      <section id="lead" className="relative overflow-hidden px-6 py-16 md:px-12" style={{ background: '#0A0A0B' }}>
        <div aria-hidden className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${accent}33, transparent 70%)` }} />
        <div className="relative mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display font-bold text-white" style={{ fontSize: scale ? '1.6rem' : 'clamp(1.6rem, 3.5vw, 2.6rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{p.finalCta.headline}</h2>
            <p className="mt-3 text-white/70">{p.finalCta.sub}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${accent}22` }}>
                  <Check size={24} style={{ color: accent }} />
                </span>
                <p className="font-display text-lg font-semibold text-white">
                  {p.thankYou?.headline || (rtl ? 'تم الإرسال ✅' : 'Sent ✅')}
                </p>
                <p className="text-sm text-white/60">
                  {p.thankYou?.body || (rtl ? 'سنتواصل معك قريباً.' : 'We’ll reach out shortly.')}
                </p>
                {p.thankYou?.ctaHref && (
                  <a
                    href={p.thankYou.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                    style={{ background: accent }}
                  >
                    {p.thankYou.ctaLabel || (rtl ? 'التالي' : 'Next step')}
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <p className="mb-1 font-display font-semibold text-white">{p.leadForm.title}</p>
                {p.leadForm.fields.map((field, i) => (
                  <input
                    key={i}
                    required={i < 2}
                    placeholder={field}
                    value={form[field] || ''}
                    onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                ))}
                <button type="submit" className="mt-1 rounded-full py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5" style={{ background: accent }}>
                  {p.leadForm.button}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
