import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Lock, MessageCircle, Send, Loader2 } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { Panel } from '../suite/ui'
import { useI18n } from '../i18n'
import { useFunnels, getDb } from '../store'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import {
  getConnectionForFunnel,
  listConversations,
  listMessages,
  sendReply,
  type WhatsAppConnection,
  type Conversation,
  type Message,
} from '../db/whatsapp'

/** The shared WhatsApp inbox (Phase 5c) — conversation list, thread view, and a
 * reply box wired to the existing `api/whatsapp/send.ts` (no second send path).
 * Exported separately from the routed page, same split as Hub/Leads/Insights,
 * so it can be tested without an authenticated session.
 *
 * WhatsApp has no localStorage-backed demo data (see `src/saas/db/whatsapp.ts`
 * doc) — with no Neon backend bridged (`getDb()` null), this always renders the
 * honest "not connected" state rather than fabricating a conversation. */
export function WhatsappContent() {
  const { t, isRTL } = useI18n()
  const w = t.whatsapp
  const funnels = useFunnels()
  const ent = useEntitlements()
  const openUpgrade = useUpgrade()
  const remote = getDb()

  const [funnelId, setFunnelId] = useState(funnels[0]?.id ?? '')
  useEffect(() => {
    if (!funnelId && funnels[0]) setFunnelId(funnels[0].id)
  }, [funnels, funnelId])

  const [connection, setConnection] = useState<WhatsAppConnection | null>(null)
  useEffect(() => {
    if (!remote || !funnelId) {
      setConnection(null)
      return
    }
    let cancelled = false
    getConnectionForFunnel(remote, funnelId)
      .then((c) => { if (!cancelled) setConnection(c) })
      .catch(() => { if (!cancelled) setConnection(null) })
    return () => { cancelled = true }
  }, [remote, funnelId])

  const [conversations, setConversations] = useState<Conversation[]>([])
  useEffect(() => {
    if (!remote || !connection?.id) {
      setConversations([])
      return
    }
    let cancelled = false
    listConversations(remote, connection.id)
      .then((c) => { if (!cancelled) setConversations(c) })
      .catch(() => { if (!cancelled) setConversations([]) })
    return () => { cancelled = true }
  }, [remote, connection?.id])

  const [activeContact, setActiveContact] = useState<string | null>(null)
  useEffect(() => {
    setActiveContact((prev) => (prev && conversations.some((c) => c.waId === prev) ? prev : (conversations[0]?.waId ?? null)))
  }, [conversations])

  const [messages, setMessages] = useState<Message[]>([])
  useEffect(() => {
    if (!remote || !connection?.id || !activeContact) {
      setMessages([])
      return
    }
    let cancelled = false
    listMessages(remote, connection.id, activeContact)
      .then((m) => { if (!cancelled) setMessages(m) })
      .catch(() => { if (!cancelled) setMessages([]) })
    return () => { cancelled = true }
  }, [remote, connection?.id, activeContact])

  function handleSent(text: string) {
    if (!activeContact) return
    const now = Date.now()
    setMessages((prev) => [...prev, { id: `local_${now}`, waFrom: activeContact, body: text, direction: 'out', at: now }])
    setConversations((prev) => prev.map((c) => (c.waId === activeContact ? { ...c, lastBody: text, lastDirection: 'out', at: now } : c)))
  }

  if (!ent.whatsappBot) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-suite-gold/10">
          <Lock size={24} className="text-suite-gold-l" />
        </div>
        <h1 className="mt-5 font-luxe text-2xl font-semibold text-suite-text">{w.locked.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-suite-muted">{w.locked.body}</p>
        <button
          onClick={() => openUpgrade('whatsappBot')}
          className="mt-6 rounded-full bg-suite-gold px-7 py-3 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90"
        >
          {w.locked.cta}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1080px] px-[30px] pb-[60px] pt-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-luxe text-[34px] font-semibold text-suite-text">{w.title}</h1>
          <p className="mt-1 text-[15px] text-suite-muted">{w.subtitle}</p>
        </div>
        {funnels.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-suite-muted">
            {w.funnelLabel}
            <select
              value={funnelId}
              onChange={(e) => setFunnelId(e.target.value)}
              className="rounded-lg border border-suite-line bg-suite-panel2 px-3 py-2 text-sm text-suite-text outline-none focus:border-suite-gold"
            >
              {funnels.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!connection ? (
        <Panel className="mt-8 flex flex-col items-center gap-3 p-14 text-center" data-testid="whatsapp-not-connected">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
            <MessageCircle size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <p className="font-luxe text-xl font-semibold text-suite-text">{w.notConnected.title}</p>
          <p className="max-w-[360px] text-sm text-suite-muted">{w.notConnected.body}</p>
          <Link
            to="/app/connect"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-suite-gold px-6 py-2.5 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90"
          >
            {w.notConnected.cta}
          </Link>
        </Panel>
      ) : conversations.length === 0 ? (
        <Panel className="mt-8 flex flex-col items-center gap-3 p-14 text-center" data-testid="whatsapp-empty">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
            <MessageCircle size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <p className="font-luxe text-xl font-semibold text-suite-text">{w.empty.title}</p>
          <p className="max-w-[360px] text-sm text-suite-muted">{w.empty.body}</p>
        </Panel>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[280px_1fr]" dir={isRTL ? 'rtl' : 'ltr'}>
          <Panel className="overflow-hidden">
            <p className="border-b border-suite-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-suite-muted">{w.list.title}</p>
            <div className="flex max-h-[520px] flex-col overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.waId}
                  type="button"
                  onClick={() => setActiveContact(c.waId)}
                  data-testid={`whatsapp-convo-${c.waId}`}
                  className={`flex items-center gap-3 border-b border-suite-line/60 px-4 py-3 text-start transition-colors last:border-0 ${activeContact === c.waId ? 'bg-suite-panel2' : 'hover:bg-suite-panel2/60'}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#25D366' }}>
                    <MessageCircle size={15} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-suite-text" dir="ltr">{c.name ?? c.waId}</p>
                    <p className="truncate text-xs text-suite-muted">{c.lastDirection === 'out' ? '↩ ' : ''}{c.lastBody}</p>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="flex flex-col">
            {activeContact ? (
              <>
                <p className="border-b border-suite-line px-5 py-3 text-sm font-semibold text-suite-text" dir="ltr">{activeContact}</p>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-5" style={{ minHeight: 360 }}>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      data-testid="whatsapp-message"
                      data-direction={m.direction}
                      className={`flex max-w-[75%] flex-col gap-1 rounded-2xl px-3.5 py-2 text-sm ${m.direction === 'out' ? 'self-end bg-suite-gold/15 text-suite-text' : 'self-start bg-suite-panel2 text-suite-text'}`}
                    >
                      <p>{m.body}</p>
                      <p className="text-[10px] text-suite-muted" dir="ltr">
                        {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
                <ReplyBox connectionId={connection.id ?? ''} to={activeContact} labels={w.reply} onSent={handleSent} />
              </>
            ) : (
              <p className="p-6 text-sm text-suite-muted">{w.selectThread}</p>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

function ReplyBox({
  connectionId,
  to,
  labels,
  onSent,
}: {
  connectionId: string
  to: string
  labels: { placeholder: string; send: string; sending: string; windowClosed: string; error: string }
  onSent: (text: string) => void
}) {
  const remote = getDb()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    const trimmed = text.trim()
    if (!trimmed || busy || !remote) return
    setBusy(true)
    setError(null)
    try {
      await sendReply(remote, connectionId, to, trimmed)
      onSent(trimmed)
      setText('')
    } catch (e) {
      // 'service_window_closed' is the coded error api/whatsapp/send.ts throws
      // for a real, existing quota rule (Meta's 24h window) — same pattern as
      // db/api.ts's placeOrder 'payments_not_connected': surface it as the
      // honest, specific reason rather than a generic failure.
      setError(e instanceof Error && e.message === 'service_window_closed' ? labels.windowClosed : labels.error)
    }
    setBusy(false)
  }

  return (
    <div className="border-t border-suite-line p-4">
      {error && (
        <p className="mb-2 text-xs text-red-400" data-testid="whatsapp-send-error">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          placeholder={labels.placeholder}
          disabled={busy}
          className="flex-1 rounded-lg border border-suite-line bg-suite-panel2 px-3 py-2.5 text-sm text-suite-text outline-none focus:border-suite-gold disabled:opacity-60"
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !text.trim()}
          data-testid="whatsapp-send"
          className="inline-flex items-center gap-1.5 rounded-full bg-suite-gold px-4 py-2.5 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Send size={14} aria-hidden />}
          {busy ? labels.sending : labels.send}
        </button>
      </div>
    </div>
  )
}

export default function Whatsapp() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>AutoLeadss — WhatsApp</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <WhatsappContent />
    </SuiteShell>
  )
}
