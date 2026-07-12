
import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import type { FunnelSpec } from '../types'

interface Msg { role: 'bot' | 'user'; text: string }

interface ChatSimulatorProps {
  spec: FunnelSpec
  accent?: string
  /** True once this workspace has hit its WhatsApp-AI conversation cap (hard cap
   * only) — disables the input so no further conversations start. */
  locked?: boolean
  lockedMessage?: string
  /** Fired once, on the first user message of a session — the moment a real
   * WhatsApp conversation window would open. Return value is ignored; use
   * `locked` to actually block further conversations once the cap gate says so. */
  onConversationStart?: () => void
}

export default function ChatSimulator({ spec, accent = '#FF5C2A', locked, lockedMessage, onConversationStart }: ChatSimulatorProps) {
  const rtl = spec.language === 'ar'
  const bot = spec.chatbot
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: bot.greeting }])
  const [input, setInput] = useState('')
  const [turn, setTurn] = useState(0)
  const scroll = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMsgs([{ role: 'bot', text: bot.greeting }])
    setTurn(0)
  }, [bot.greeting])

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight
  }, [msgs])

  function reply(userText: string): string {
    const q = userText.toLowerCase()
    const match = bot.flow.find((f) => q.includes(f.trigger.toLowerCase()))
    if (match) return match.response
    const next = bot.flow[Math.min(turn, bot.flow.length - 1)]
    if (turn >= bot.flow.length - 1) return bot.bookingMessage
    return next?.response ?? bot.bookingMessage
  }

  function send(text: string) {
    if (locked) return
    const trimmed = text.trim()
    if (!trimmed) return
    if (turn === 0) onConversationStart?.()
    setMsgs((m) => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setTimeout(() => {
      setMsgs((m) => [...m, { role: 'bot', text: reply(trimmed) }])
      setTurn((t) => t + 1)
    }, 650)
  }

  const chips = bot.qualifyingQuestions.slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[2rem] border border-black/10 bg-[#0A0A0B] p-2 shadow-xl" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="overflow-hidden rounded-[1.6rem] bg-white">
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">{spec.businessName.charAt(0)}</span>
          <div>
            <p className="text-[13px] font-semibold text-white">{spec.businessName}</p>
            <p className="text-[11px] text-white/70">{rtl ? 'يردّ فوراً' : 'replies instantly'}</p>
          </div>
        </div>
        <div ref={scroll} className="h-[320px] space-y-2 overflow-y-auto px-3 py-4" style={{ background: '#E5DDD5' }}>
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[12px] leading-snug shadow-sm ${m.role === 'user' ? 'text-black' : 'bg-white text-black'}`} style={m.role === 'user' ? { background: '#DCF8C6' } : undefined}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        {locked ? (
          <div className="border-t border-black/5 bg-white px-3 py-2.5 text-center text-[11px] font-medium text-black/50">
            {lockedMessage ?? (rtl ? 'وصلت لحد المحادثات لهذا الشهر.' : 'This month’s conversation limit has been reached.')}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 border-t border-black/5 bg-white px-3 py-2">
              {chips.map((c, i) => (
                <button key={i} onClick={() => send(c)} className="rounded-full border border-black/10 px-2.5 py-1 text-[10px] text-black/60 transition-colors hover:border-black/30">
                  {c}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2 border-t border-black/5 bg-white px-3 py-2.5">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={rtl ? 'اكتب رسالة…' : 'Type a message…'} className="flex-1 bg-transparent text-[12px] text-black outline-none placeholder:text-black/40" />
              <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: accent }}>
                <Send size={14} className={rtl ? 'rotate-180' : ''} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
