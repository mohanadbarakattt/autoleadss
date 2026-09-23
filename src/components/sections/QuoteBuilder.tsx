import { useMemo, useState } from 'react'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'
import { track } from '../../lib/analytics'
import { waLink } from '../../site'

const options = {
  type: ['Landing page', 'Small website', 'Product catalogue', 'Not sure'],
  business: ['Clinic / salon', 'Cafe / restaurant', 'Gym / studio', 'Services / other'],
  language: ['English', 'Arabic', 'English + Arabic'],
  booking: ['Appointments', 'Table / class', 'Contact form only', 'Not needed'],
  domain: ['I own one', 'I need one', 'Not sure'],
} as const

export default function QuoteBuilder() {
  const { isRTL } = useLocale()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const labels = isRTL
    ? { eye: 'عرض سعر أوضح', title: 'كوّن موجزك قبل فتح واتساب.', sub: 'اختر الإجابات. سنجهّز رسالة مرتبة ترسلها مباشرة.', send: 'افتح واتساب بالموجز', done: 'اكتمل' }
    : { eye: 'Better brief, faster quote', title: 'Build your brief before WhatsApp.', sub: 'Choose the basics. We turn them into a structured message you can send in one tap.', send: 'Open WhatsApp with brief', done: 'complete' }

  const fields = isRTL
    ? [
        ['type', 'نوع الموقع', ['صفحة هبوط', 'موقع صغير', 'كتالوج منتجات', 'غير متأكد']],
        ['business', 'نوع النشاط', ['عيادة / صالون', 'كافيه / مطعم', 'جيم / ستوديو', 'خدمات / غير ذلك']],
        ['language', 'اللغة', ['إنجليزي', 'عربي', 'عربي + إنجليزي']],
        ['booking', 'الحجز', ['مواعيد', 'ترابيزة / كلاس', 'نموذج تواصل فقط', 'غير مطلوب']],
        ['domain', 'الدومين', ['عندي دومين', 'محتاج دومين', 'غير متأكد']],
      ] as const
    : (Object.entries(options).map(([key, values]) => [key, ({ type: 'Site type', business: 'Business', language: 'Language', booking: 'Booking', domain: 'Domain' } as Record<string, string>)[key], values]) as unknown as ReadonlyArray<readonly [string, string, readonly string[]]>)

  const completed = Object.keys(answers).length
  const message = useMemo(() => {
    const intro = isRTL ? 'مرحباً أوتوليدز، أريد عرض سعر. هذا موجزي:' : 'Hi AutoLeadss — I would like a quote. Here is my brief:'
    return [intro, ...fields.map(([key, label]) => `- ${label}: ${answers[key] || '—'}`), isRTL ? '- الموعد المطلوب:' : '- Desired launch date:'].join('\n')
  }, [answers, fields, isRTL])

  return (
    <section id="quote-builder" className="section-padding bg-[#EFECE4]">
      <div className="content-width grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow text-accent">{labels.eye}</p>
          <h2 className="mt-3 max-w-md font-display text-4xl font-bold leading-tight">{labels.title}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-fg">{labels.sub}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider">
            <Check size={14} className="text-wa" /> {completed}/5 {labels.done}
          </p>
        </div>
        <div className="space-y-5">
          {fields.map(([key, label, values], index) => (
            <fieldset key={key} className="rounded-2xl border border-border bg-white p-5">
              <legend className="px-1 font-display text-lg font-bold">{String(index + 1).padStart(2, '0')} · {label}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {values.map(value => (
                  <button key={value} type="button" onClick={() => setAnswers(a => ({ ...a, [key]: value }))} className={`rounded-full border px-4 py-2 text-sm transition-colors ${answers[key] === value ? 'border-[#1b3b2b] bg-[#1b3b2b] text-white' : 'border-border hover:border-accent'}`}>
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="quote_builder"
            onClick={() => track('quote_builder_complete', { completed_fields: completed })}
            className="flex items-center justify-center gap-2 rounded-full bg-wa px-7 py-4 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle size={18} /> {labels.send} <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
