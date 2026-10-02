import { useMemo, useState } from 'react'
import { ArrowRight, Check, MessageCircle } from 'lucide-react'
import { useLocale } from '../../i18n/LocaleProvider'
import { track } from '../../lib/analytics'
import { waLink } from '../../site'

const options = {
  business: ['Barber / salon', 'Car wash / laundry', 'Cafe / bakery', 'Pet shop / other'],
  repeat: ['Weekly', 'Every 2 weeks', 'Monthly', 'Not sure yet'],
  package: ['Visits / services', 'Credits / EGP value', 'Product delivery', 'Help me design it'],
  payment: ['Paymob account', 'Another merchant account', 'Cash / InstaPay first', 'Not sure'],
  website: ['I have a website', 'Instagram only', 'No website yet', 'Not sure'],
} as const

export default function QuoteBuilder() {
  const { isRTL } = useLocale()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const labels = isRTL
    ? { eye: 'اختبار مناسبة الاشتراك', title: 'هل الاشتراك مناسب لنشاطك؟', sub: 'جاوب خمس أسئلة. نرتب لك فكرة الباقة قبل ما تفتح واتساب.', send: 'افتح واتساب بفكرة الباقة', done: 'اكتمل' }
    : { eye: 'Subscription fit check', title: 'Could this work for your business?', sub: 'Answer five questions. We turn them into a useful package brief before WhatsApp opens.', send: 'Open WhatsApp with package brief', done: 'complete' }

  const fields = isRTL
    ? [
        ['business', 'نوع النشاط', ['حلاق / صالون', 'غسيل سيارات / مغسلة', 'كافيه / مخبز', 'حيوانات أليفة / غير ذلك']],
        ['repeat', 'تكرار الشراء', ['أسبوعي', 'كل أسبوعين', 'شهري', 'غير متأكد']],
        ['package', 'شكل الباقة', ['زيارات / خدمات', 'رصيد بقيمة مالية', 'توصيل منتجات', 'ساعدني أصممها']],
        ['payment', 'الدفع الحالي', ['عندي Paymob', 'بوابة دفع أخرى', 'كاش / إنستاباي أولاً', 'غير متأكد']],
        ['website', 'وجودك أونلاين', ['عندي موقع', 'إنستجرام فقط', 'مفيش موقع', 'غير متأكد']],
      ] as const
    : (Object.entries(options).map(([key, values]) => [key, ({ business: 'Business', repeat: 'Repeat purchase', package: 'Package format', payment: 'Current payment setup', website: 'Online presence' } as Record<string, string>)[key], values]) as unknown as ReadonlyArray<readonly [string, string, readonly string[]]>)

  const completed = Object.keys(answers).length
  const message = useMemo(() => {
    const intro = isRTL ? 'مرحباً أوتوليدز، عايز أحول خدماتي لاشتراكات شهرية. ده الموجز:' : 'Hi AutoLeadss — I want to turn repeat services into monthly subscriptions. Here is my brief:'
    return [intro, ...fields.map(([key, label]) => `- ${label}: ${answers[key] || '—'}`), isRTL ? '- متوسط سعر الخدمة:' : '- Current average service price:'].join('\n')
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
