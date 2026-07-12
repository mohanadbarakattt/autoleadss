import { useState, useRef, useEffect, useMemo } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useT } from '../i18n/LocaleProvider'

const CAL_URL = 'https://calendar.app.google/JU1WaieYFBNYpmhN9'

type Message = {
  id: number
  role: 'bot' | 'user'
  text: string
  link?: { label: string; href: string }
  chips?: string[]
}

const EN_KEYWORDS = {
  services: ['what do you offer', 'services', 'service'],
  pricing: ['how much', 'price', 'cost', 'pricing'],
  start: ['how do i get started', 'get started', 'start', 'sign up', 'signup'],
  landing: ['landing page'],
  chatbot: ['chatbot', 'whatsapp'],
  ads: ['ads', 'advertising', 'meta', 'google'],
  social: ['social media', 'instagram', 'tiktok'],
  egypt: ['egypt', 'cairo', 'alexandria'],
  contact: ['contact', 'talk', 'human', 'speak'],
}

const AR_KEYWORDS: typeof EN_KEYWORDS = {
  services: ['ماذا تقدّمون', 'ماذا تقدمون', 'خدمات', 'خدماتكم'],
  pricing: ['كم', 'سعر', 'تكلفة', 'الأسعار', 'بكم'],
  start: ['كيف أبدأ', 'كيف ابدأ', 'البدء', 'أبدأ'],
  landing: ['صفحة هبوط', 'صفحات هبوط', 'لاندينج'],
  chatbot: ['شات بوت', 'واتساب', 'بوت'],
  ads: ['إعلانات', 'اعلانات', 'ميتا', 'جوجل', 'فيسبوك'],
  social: ['سوشيال', 'سوشال', 'انستجرام', 'إنستجرام', 'تيك توك'],
  egypt: ['مصر', 'القاهرة', 'الإسكندرية', 'الاسكندرية'],
  contact: ['تواصل', 'كلم', 'مكالمة', 'اتصل'],
}

/** Franco (Latin-script Egyptian Arabic) keywords — same intents, casual spelling. */
const FRANCO_KEYWORDS: typeof EN_KEYWORDS = {
  services: ['betqademo eh', 'khadamat', 'services'],
  pricing: ['be kam', 'kam', 'sa3r', 'price', 'pricing'],
  start: ['ezay abda2', 'abda2', 'start', 'sign up'],
  landing: ['landing page', 'landing'],
  chatbot: ['chatbot', 'shat bot', 'whatsapp', 'bot'],
  ads: ['ads', 'e3lanat', 'meta', 'google', 'facebook'],
  social: ['social', 'soshal', 'instagram', 'tiktok'],
  egypt: ['masr', 'el 2ahera', '2ahera', 'eskendareya'],
  contact: ['kallemna', 'kallem', 'mokalma', 'contact'],
}

export default function ChatWidget() {
  const t = useT()
  const { isRTL, locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const keywords = locale === 'ar' ? AR_KEYWORDS : locale === 'fr-eg' ? FRANCO_KEYWORDS : EN_KEYWORDS
  const resp = t.chat.responses

  function getResponse(input: string): { text: string; link?: { label: string; href: string } } {
    const q = input.toLowerCase()
    const has = (...words: string[]) => words.some(w => q.includes(w.toLowerCase()))
    if (has(...keywords.services)) return { text: resp.services }
    if (has(...keywords.pricing)) return { text: resp.pricing }
    if (has(...keywords.start)) return { text: resp.start, link: { label: t.chat.bookLabel, href: CAL_URL } }
    if (has(...keywords.landing)) return { text: resp.landing }
    if (has(...keywords.chatbot)) return { text: resp.chatbot }
    if (has(...keywords.ads)) return { text: resp.ads }
    if (has(...keywords.social)) return { text: resp.social }
    if (has(...keywords.egypt)) return { text: resp.egypt }
    if (has(...keywords.contact)) return { text: resp.contact, link: { label: t.chat.bookLabel, href: CAL_URL } }
    return { text: t.chat.fallback, link: { label: t.chat.bookFreeLabel, href: CAL_URL } }
  }

  const greeting = useMemo<Message>(() => ({
    id: 1, role: 'bot', text: t.chat.greet, chips: [...t.chat.quickReplies],
  }), [t])

  const [messages, setMessages] = useState<Message[]>([greeting])
  useEffect(() => { setMessages([greeting]) }, [locale, greeting])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, open])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: Message = { id: Date.now(), role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const r = getResponse(trimmed)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: r.text, link: r.link }])
    }, 450)
  }

  // RTL → chatbot moves to bottom-left; LTR stays bottom-right
  const sideClass = isRTL ? 'left-6' : 'right-6'
  const panelSideClass = isRTL ? 'left-6' : 'right-6'

  return (
    <>
      <div className={`fixed bottom-6 z-50 ${sideClass}`}>
        {!open && <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />}
        <button onClick={() => setOpen(o => !o)} aria-label={open ? t.chat.closeLabel : t.chat.openLabel}
          className="relative w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center hover:bg-orange-600 transition-colors">
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle size={22} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed bottom-24 z-50 w-80 max-h-[520px] bg-white rounded-2xl border border-border overflow-hidden flex flex-col ${panelSideClass}`}>
            <div className="bg-foreground text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inset-0 rounded-full bg-accent/60 animate-ping" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-accent" />
                </span>
                <div className="leading-tight">
                  <p className="font-display font-semibold text-sm">{t.chat.title}</p>
                  <p className="text-[11px] text-white/60">{t.chat.sub}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label={t.chat.minimize} className="text-white/60 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[260px]">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-accent text-white rounded-2xl rounded-tr-sm' : 'bg-muted text-foreground rounded-2xl rounded-tl-sm'
                  }`}>
                    {m.text}
                    {m.link && (
                      <>{' '}<a href={m.link.href} target="_blank" rel="noopener noreferrer" className="underline font-medium text-accent hover:text-orange-600">{m.link.label}</a></>
                    )}
                  </div>
                  {m.chips && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {m.chips.map(chip => (
                        <button key={chip} onClick={() => send(chip)}
                          className="border border-border rounded-full text-xs px-3 py-1.5 text-foreground hover:border-accent hover:text-accent transition-colors">
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={e => { e.preventDefault(); send(input) }} className="border-t border-border p-3 flex items-center gap-2">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder={t.chat.placeholder}
                className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-1 focus:ring-accent" />
              <button type="submit" aria-label={t.chat.sendLabel}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-orange-600 transition-colors shrink-0">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
