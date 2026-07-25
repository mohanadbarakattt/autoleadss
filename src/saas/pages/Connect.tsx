import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Copy, Check, Lock, MessageCircle } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { GoldButton, Panel, StatusDot } from '../suite/ui'
import { useI18n } from '../i18n'
import { useFunnels, uid, getDb } from '../store'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import { whatsappEnabled } from '../config'
import { getConnectionForFunnel, saveConnection, listConversations, type WhatsAppConnection, type Conversation } from '../db/whatsapp'

export default function Connect() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>Connect WhatsApp — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <ConnectContent />
    </SuiteShell>
  )
}

/** Exported separately from the routed default (same split as
 * Hub/Leads/Whatsapp) so it can be tested without an authenticated session. */
export function ConnectContent() {
  const { isRTL } = useI18n()
  const funnels = useFunnels()
  const ent = useEntitlements()
  const openUpgrade = useUpgrade()

  const [funnelId, setFunnelId] = useState(funnels[0]?.id ?? '')
  const [form, setForm] = useState({ phoneNumberId: '', wabaId: '', accessToken: '', displayPhone: '', verifyToken: uid('vt_') })
  const [existing, setExisting] = useState<WhatsAppConnection | null>(null)
  const [convos, setConvos] = useState<Conversation[]>([])
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  // Real endpoint. Same-origin so it follows whatever domain this workspace is
  // served from, rather than a placeholder the owner has to hand-edit.
  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/whatsapp/webhook`
      : '/api/whatsapp/webhook'

  useEffect(() => {
    const sb = getDb()
    if (!sb || !whatsappEnabled || !funnelId) return
    getConnectionForFunnel(sb, funnelId)
      .then((c) => {
        setExisting(c)
        if (c) setForm((f) => ({ ...f, phoneNumberId: c.phoneNumberId, wabaId: c.wabaId ?? '', accessToken: c.accessToken, displayPhone: c.displayPhone ?? '', verifyToken: c.verifyToken }))
      })
      .catch(() => {})
    listConversations(sb, funnelId).then(setConvos).catch(() => {})
  }, [funnelId])

  if (!ent.whatsappBot) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-suite-gold/10">
          <Lock size={24} className="text-suite-gold-l" />
        </div>
        <h1 className="mt-5 font-luxe text-2xl font-semibold text-suite-text">{isRTL ? 'بوت واتساب من مزايا Growth' : 'WhatsApp bot is a Growth feature'}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-suite-muted">{isRTL ? 'رقِّ لتجهيز بوت الذكاء الاصطناعي الخاص بقمعك. ربط رقم واتساب حقيقي وتشغيله مباشرة على العملاء قريباً.' : 'Upgrade to set up your funnel’s AI bot script. Connecting a real WhatsApp number and running it live on customers is coming soon.'}</p>
        <GoldButton onClick={() => openUpgrade('whatsappBot')} className="mt-6">
          {isRTL ? 'رقِّ الآن' : 'Upgrade'}
        </GoldButton>
      </div>
    )
  }

  async function save() {
    const sb = getDb()
    if (!sb || !whatsappEnabled) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
      return
    }
    setBusy(true)
    try {
      await saveConnection(sb, { funnelId, phoneNumberId: form.phoneNumberId, wabaId: form.wabaId, accessToken: form.accessToken, displayPhone: form.displayPhone, verifyToken: form.verifyToken })
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (e) {
      console.error(e)
    }
    setBusy(false)
  }

  const input = 'w-full rounded-lg border border-suite-line bg-suite-panel2 px-3 py-2.5 text-sm text-suite-text outline-none focus:border-suite-gold'
  const steps = isRTL
    ? ['أنشئ تطبيقاً على Meta for Developers وفعّل WhatsApp (Cloud API).', 'انسخ رابط الويبهوك ورمز التحقّق أدناه إلى إعدادات الويبهوك في Meta واشترك في حقل messages.', 'الصق phone number ID والتوكن الدائم من لوحة Meta هنا واحفظ.']
    : ['Create an app on Meta for Developers and add WhatsApp (Cloud API).', 'Paste the webhook URL + verify token below into Meta’s webhook settings and subscribe to the "messages" field.', 'Paste your phone number ID and a permanent access token from Meta here, then save.']

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#25D366' }}>
          <MessageCircle size={20} className="text-white" />
        </span>
        <div>
          <h1 className="font-luxe text-2xl font-semibold text-suite-text" style={{ letterSpacing: '-0.02em' }}>{isRTL ? 'ربط واتساب' : 'Connect WhatsApp'}</h1>
          <p className="text-xs text-suite-muted">{isRTL ? 'شغّل بوت القمع على رقم واتساب الخاص بك (BYO).' : 'Run your funnel’s bot on your own WhatsApp number (bring-your-own).'}</p>
        </div>
        {existing && (
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-suite-ok/15 px-3 py-1.5 text-xs font-semibold text-suite-ok">
            <StatusDot /> {isRTL ? 'متصل' : 'Connected'}
          </span>
        )}
      </div>

      {!whatsappEnabled && (
        <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-300">
          {isRTL ? 'وضع العرض: حفظ إعدادات واتساب غير متاح بعد — قريباً.' : 'Demo mode: saving a WhatsApp connection isn’t available yet — coming soon.'}
        </p>
      )}

      {/* funnel selector */}
      <div className="mt-6">
        <label className="mb-1.5 block text-xs font-medium text-suite-muted">{isRTL ? 'اختر القمع' : 'Funnel to connect'}</label>
        <select value={funnelId} onChange={(e) => setFunnelId(e.target.value)} className={input}>
          {funnels.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* steps */}
      <Panel className="mt-6 p-6">
        <p className="mb-4 font-luxe font-semibold text-suite-text">{isRTL ? 'خطوات الربط' : 'How to connect'}</p>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-suite-text/90">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-suite-gold/10 font-mono text-xs font-semibold text-suite-gold-l">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-3">
          <ReadOnly label={isRTL ? 'رابط الويبهوك' : 'Webhook URL'} value={webhookUrl} />
          <ReadOnly label={isRTL ? 'رمز التحقّق' : 'Verify token'} value={form.verifyToken} />
        </div>
      </Panel>

      {/* credentials */}
      <Panel className="mt-6 p-6">
        <p className="mb-4 font-luxe font-semibold text-suite-text">{isRTL ? 'بيانات Cloud API' : 'Cloud API credentials'}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number ID"><input value={form.phoneNumberId} onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })} className={input} dir="ltr" placeholder="1029384756…" /></Field>
          <Field label="WABA ID (optional)"><input value={form.wabaId} onChange={(e) => setForm({ ...form, wabaId: e.target.value })} className={input} dir="ltr" /></Field>
          <Field label={isRTL ? 'الرقم المعروض' : 'Display phone'}><input value={form.displayPhone} onChange={(e) => setForm({ ...form, displayPhone: e.target.value })} className={input} dir="ltr" placeholder="+971 5X…" /></Field>
          <Field label={isRTL ? 'توكن الوصول الدائم' : 'Permanent access token'}><input type="password" value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} className={input} dir="ltr" placeholder="EAAG…" /></Field>
        </div>
        <GoldButton onClick={save} disabled={busy || !form.phoneNumberId || !form.accessToken} className="mt-5">
          {saved ? <><Check size={15} /> {isRTL ? 'تم الحفظ' : 'Saved'}</> : isRTL ? 'حفظ الاتصال' : 'Save connection'}
        </GoldButton>
      </Panel>

      {/* lite shared inbox */}
      {whatsappEnabled && (
        <Panel className="mt-6 p-6">
          <p className="mb-4 font-luxe font-semibold text-suite-text">{isRTL ? 'المحادثات الأخيرة' : 'Recent conversations'}</p>
          {convos.length === 0 ? (
            <p className="text-sm text-suite-muted">{isRTL ? 'لا محادثات بعد.' : 'No conversations yet — they appear here once messages arrive.'}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {convos.map((c) => (
                <div key={c.waId} className="flex items-center gap-3 rounded-lg border border-suite-line bg-suite-panel2/60 px-3 py-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#25D366' }}>{(c.name ?? c.waId).charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-suite-text">{c.name ?? c.waId}</p>
                    <p className="truncate text-xs text-suite-muted">{c.lastDirection === 'out' ? '↩ ' : ''}{c.lastBody}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-suite-muted">{label}</span>
      {children}
    </label>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-suite-muted">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-suite-line bg-suite-panel2/60 px-3 py-2">
        <code className="flex-1 truncate text-xs text-suite-text" dir="ltr">{value}</code>
        <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400) }} className="text-suite-muted hover:text-suite-text">
          {copied ? <Check size={14} className="text-suite-ok" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}
