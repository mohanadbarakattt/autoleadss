import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'

export type LocalFaq = { keys: string[]; a: string }

export type LocalChatCopy = {
  open: string
  close: string
  title: string
  subtitle: string
  placeholder: string
  send: string
  hello: string
  fallback: string
  suggestions: string[]
  faq: LocalFaq[]
}

type Msg = { role: 'bot' | 'user'; text: string }

function answerFor(q: string, faq: LocalFaq[], fallback: string) {
  const n = q.trim().toLowerCase()
  if (!n) return fallback
  let best: { a: string; score: number } | null = null
  for (const item of faq) {
    const score = item.keys.reduce((s, k) => (n.includes(k.toLowerCase()) ? s + k.length : s), 0)
    if (score > 0 && (!best || score > best.score)) best = { a: item.a, score }
  }
  return best?.a ?? fallback
}

export default function LocalChat({
  copy,
  accent = '#FF5C2A',
  rtl = false,
  footer,
  docked = false,
  inline = false,
}: {
  copy: LocalChatCopy
  accent?: string
  rtl?: boolean
  footer?: ReactNode
  docked?: boolean
  inline?: boolean
}) {
  const [open, setOpen] = useState(inline)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([{ role: 'bot', text: copy.hello }])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ role: 'bot', text: copy.hello }])
  }, [copy.hello])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function ask(text: string) {
    const q = text.trim()
    if (!q) return
    const a = answerFor(q, copy.faq, copy.fallback)
    setMessages(m => [...m, { role: 'user', text: q }, { role: 'bot', text: a }])
    setInput('')
  }

  const side = rtl ? 'left-6' : 'right-6'
  const showPanel = inline || open

  const panel = showPanel && (
    <div
      className={`${
        inline
          ? 'flex h-[min(32rem,70vh)] w-full'
          : docked
            ? `fixed z-[70] bottom-24 ${rtl ? 'left-6' : 'right-6'} flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))]`
            : 'mb-3 flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))]'
      } flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: accent }}>
        <div>
          <p className="text-sm font-semibold">{copy.title}</p>
          <p className="text-[11px] text-white/80">{copy.subtitle}</p>
        </div>
        {!inline && (
          <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className="rounded-full p-1 hover:bg-white/15">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'text-white' : 'bg-neutral-100 text-neutral-900'}`}
              style={m.role === 'user' ? { background: accent } : undefined}
            >
              {m.text}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-neutral-200 px-3 py-2">
        {copy.suggestions.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-600 hover:border-neutral-400"
          >
            {s}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-neutral-200 p-2"
        onSubmit={e => {
          e.preventDefault()
          ask(input)
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={copy.placeholder}
          className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label={copy.send}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: accent }}
        >
          <Send size={14} />
        </button>
      </form>
      {footer}
    </div>
  )

  if (inline) {
    return <div className="relative">{panel}</div>
  }

  return (
    <div className={docked ? 'relative' : `fixed bottom-6 z-[60] ${side}`}>
      {panel}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? copy.close : copy.open}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: accent }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
