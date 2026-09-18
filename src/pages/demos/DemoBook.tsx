import { useMemo, useState, type FormEvent } from 'react'
import { useLocale } from '../../i18n/LocaleProvider'
import type { Demo } from '../../demos/data'

export default function DemoBook({
  demo,
  slot,
  setSlot,
  prefers,
  preferLabel,
  counts,
  countLabel,
  dark,
}: {
  demo: Demo
  slot: string
  setSlot: (s: string) => void
  prefers?: string[]
  preferLabel?: string
  counts?: string[]
  countLabel?: string
  dark?: boolean
}) {
  const { locale } = useLocale()
  const c = demo.copy[locale]
  const [done, setDone] = useState(false)
  const [prefer, setPrefer] = useState(prefers?.[0] ?? '')
  const [count, setCount] = useState(counts?.[1] ?? counts?.[0] ?? '')
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setDone(true)
  }

  const field = {
    borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    color: demo.fg,
  }

  if (done) {
    return (
      <p className="rounded-2xl px-4 py-4 text-sm" style={{ background: `${demo.accent}22` }}>
        {c.success}
      </p>
    )
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1.5 text-xs font-medium opacity-80">
        {c.name}
        <input required name="name" autoComplete="name" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none" style={field} />
      </label>
      <label className="grid gap-1.5 text-xs font-medium opacity-80">
        {c.phone}
        <input required name="phone" dir="ltr" inputMode="tel" autoComplete="tel" className="rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none" style={field} />
      </label>
      <label className="grid gap-1.5 text-xs font-medium opacity-80">
        {c.date}
        <input type="date" required name="date" min={today} className="rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none" style={field} />
      </label>
      {prefers && prefers.length > 0 && preferLabel && (
        <div>
          <p className="mb-2 text-xs font-medium opacity-80">{preferLabel}</p>
          <div className="flex flex-wrap gap-2">
            {prefers.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPrefer(p)}
                className="rounded-full border px-3 py-1.5 text-xs"
                style={{
                  borderColor: prefer === p ? demo.accent : dark ? 'rgba(255,255,255,0.18)' : 'rgba(127,127,127,0.3)',
                  background: prefer === p ? demo.accent : 'transparent',
                  color: prefer === p ? '#111' : demo.fg,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
      {counts && counts.length > 0 && countLabel && (
        <div>
          <p className="mb-2 text-xs font-medium opacity-80">{countLabel}</p>
          <div className="flex flex-wrap gap-2">
            {counts.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className="rounded-full border px-3 py-1.5 text-xs"
                style={{
                  borderColor: count === n ? demo.accent : dark ? 'rgba(255,255,255,0.18)' : 'rgba(127,127,127,0.3)',
                  background: count === n ? demo.accent : 'transparent',
                  color: count === n ? '#111' : demo.fg,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="mb-2 text-xs font-medium opacity-80">{c.slot}</p>
        <div className="flex flex-wrap gap-2">
          {c.slots.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              className="rounded-full border px-3 py-1.5 text-xs"
              style={{
                borderColor: slot === s ? demo.accent : dark ? 'rgba(255,255,255,0.18)' : 'rgba(127,127,127,0.3)',
                background: slot === s ? demo.accent : 'transparent',
                color: slot === s ? '#111' : demo.fg,
                touchAction: 'manipulation',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={!slot}
        className="mt-2 rounded-full py-3 text-sm font-semibold text-[#111] disabled:opacity-40"
        style={{ background: demo.accent }}
      >
        {c.submit}
      </button>
    </form>
  )
}
