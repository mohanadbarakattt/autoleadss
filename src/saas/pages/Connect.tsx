import { useEffect, useState } from 'react'
import { Copy, Check, Lock, MessageCircle } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useI18n } from '../i18n'
import { useFunnels, uid, getDb } from '../store'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import { SUPABASE_URL, remoteEnabled } from '../config'
import { getConnectionForFunnel, saveConnection, listConversations, type WhatsAppConnection, type Conversation } from '../db/whatsapp'

export default function Connect() {
  return (
    <AppShell>
      <ConnectInner />
    </AppShell>
  )
}

function ConnectInner() {
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

  const webhookUrl = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/whatsapp-webhook` : 'https://<project>.supabase.co/functions/v1/whatsapp-webhook'

  useEffect(() => {
    const sb = getDb()
    if (!sb || !funnelId) return
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
          <Lock size={24} className="text-accent" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">{isRTL ? 'بوت واتساب من مزايا Growth' : 'WhatsApp bot is a Growth feature'}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-fg">{isRTL ? 'رقِّ لربط رقم واتساب الخاص بك وتشغيل البوت مباشرة على العملاء.' : 'Upgrade to connect your own WhatsApp number and run the bot live on real customers.'}</p>
        <button onClick={() => openUpgrade('whatsappBot')} className="mt-6 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
          {isRTL ? 'رقِّ الآن' : 'Upgrade'}
        </button>
      </div>
    )
  }

  async function save() {
    const sb = getDb()
    if (!sb) {
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

  const input = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent'
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
          <h1 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{isRTL ? 'ربط واتساب' : 'Connect WhatsApp'}</h1>
          <p className="text-xs text-muted-fg">{isRTL ? 'شغّل بوت القمع على رقم واتساب الخاص بك (BYO).' : 'Run your funnel’s bot on your own WhatsApp number (bring-your-own).'}</p>
        </div>
        {existing && <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {isRTL ? 'متصل' : 'Connected'}</span>}
      </div>

      {!remoteEnabled && (
        <p className="mt-6 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          {isRTL ? 'وضع العرض: احفظ الإعدادات ستفعّل بعد تشغيل قاعدة البيانات (Phase 3). راجع docs/SETUP.md.' : 'Demo mode: saving activates once the database is configured (Phase 3). See docs/SETUP.md.'}
        </p>
      )}

      {/* funnel selector */}
      <div className="mt-6">
        <label className="mb-1.5 block text-xs font-medium text-muted-fg">{isRTL ? 'اختر القمع' : 'Funnel to connect'}</label>
        <select value={funnelId} onChange={(e) => setFunnelId(e.target.value)} className={input}>
          {funnels.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* steps */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="mb-4 font-display font-semibold">{isRTL ? 'خطوات الربط' : 'How to connect'}</p>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground/90">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-col gap-3">
          <ReadOnly label={isRTL ? 'رابط الويبهوك' : 'Webhook URL'} value={webhookUrl} />
          <ReadOnly label={isRTL ? 'رمز التحقّق' : 'Verify token'} value={form.verifyToken} />
        </div>
      </div>

      {/* credentials */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="mb-4 font-display font-semibold">{isRTL ? 'بيانات Cloud API' : 'Cloud API credentials'}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number ID"><input value={form.phoneNumberId} onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })} className={input} dir="ltr" placeholder="1029384756…" /></Field>
          <Field label="WABA ID (optional)"><input value={form.wabaId} onChange={(e) => setForm({ ...form, wabaId: e.target.value })} className={input} dir="ltr" /></Field>
          <Field label={isRTL ? 'الرقم المعروض' : 'Display phone'}><input value={form.displayPhone} onChange={(e) => setForm({ ...form, displayPhone: e.target.value })} className={input} dir="ltr" placeholder="+971 5X…" /></Field>
          <Field label={isRTL ? 'توكن الوصول الدائم' : 'Permanent access token'}><input type="password" value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} className={input} dir="ltr" placeholder="EAAG…" /></Field>
        </div>
        <button onClick={save} disabled={busy || !form.phoneNumberId || !form.accessToken} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50">
          {saved ? <><Check size={15} /> {isRTL ? 'تم الحفظ' : 'Saved'}</> : isRTL ? 'حفظ الاتصال' : 'Save connection'}
        </button>
      </div>

      {/* lite shared inbox */}
      {remoteEnabled && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 font-display font-semibold">{isRTL ? 'المحادثات الأخيرة' : 'Recent conversations'}</p>
          {convos.length === 0 ? (
            <p className="text-sm text-muted-fg">{isRTL ? 'لا محادثات بعد.' : 'No conversations yet — they appear here once messages arrive.'}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {convos.map((c) => (
                <div key={c.waId} className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: '#25D366' }}>{(c.name ?? c.waId).charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name ?? c.waId}</p>
                    <p className="truncate text-xs text-muted-fg">{c.lastDirection === 'out' ? '↩ ' : ''}{c.lastBody}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-fg">{label}</span>
      {children}
    </label>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-fg">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
        <code className="flex-1 truncate text-xs text-foreground" dir="ltr">{value}</code>
        <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400) }} className="text-muted-fg hover:text-foreground">
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}
