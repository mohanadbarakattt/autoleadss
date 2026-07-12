import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Copy, Check, Globe, RefreshCw, Sparkles, Plus, Trash2, FlaskConical, Info, Download } from 'lucide-react'
import AppShell from '../components/AppShell'
import FunnelRenderer from '../components/FunnelRenderer'
import ChatSimulator from '../components/ChatSimulator'
import FunnelAnalytics from '../components/FunnelAnalytics'
import BrowserFrame from '../components/BrowserFrame'
import { useI18n, toContentLocale } from '../i18n'
import { useFunnel, updateSpec, updateFunnel, publishFunnel, setLeadStatus, getDb, hasSampleData, clearSampleData } from '../store'
import { generateFromTemplate } from '../ai/generate'
import { useUpgrade } from '../billing/UpgradeContext'
import { useCapGate, isCapHit } from '../billing/usage'
import { remoteEnabled } from '../config'
import { FUNNEL_ROOT } from '../publish/host'
import { listDomains, addDomain, deleteDomain, type Domain } from '../db/domains'
import type { FunnelSpec, Lead, Funnel } from '../types'

type Tab = 'page' | 'ads' | 'chatbot' | 'social' | 'leads' | 'insights' | 'settings' | 'domain'

export default function Editor() {
  return (
    <AppShell>
      <EditorInner />
    </AppShell>
  )
}

function EditorInner() {
  const { t, isRTL, locale } = useI18n()
  const { id = '' } = useParams()
  const funnel = useFunnel(id)
  const [tab, setTab] = useState<Tab>('page')
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const openUpgrade = useUpgrade()
  const whatsappGate = useCapGate('whatsapp')

  if (!funnel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Helmet defer={false}>
          <title>{isRTL ? 'القمع غير موجود' : 'Funnel not found'} — AutoLeadss</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <p className="text-muted-fg">{isRTL ? 'القمع غير موجود.' : 'Funnel not found.'}</p>
        <Link to="/app" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white">{t.nav.dashboard}</Link>
      </div>
    )
  }

  const spec = funnel.spec
  const accent = funnel.accent
  const publicUrl = `/p/${funnel.slug}`

  function set(mutate: (s: FunnelSpec) => FunnelSpec) {
    updateSpec(id, mutate)
  }

  function copyLink() {
    const url = typeof window !== 'undefined' ? window.location.origin + publicUrl : publicUrl
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function regenerate() {
    if (!funnel) return
    setRegenerating(true)
    await new Promise((r) => setTimeout(r, 700))
    const fresh = generateFromTemplate({ industry: funnel.industry, businessName: funnel.name, language: funnel.language, region: 'gulf', goal: 'leads', tone: 'bold', accent })
    updateFunnel(id, { spec: fresh })
    setRegenerating(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'page', label: t.editor.tabs.page },
    { id: 'ads', label: t.editor.tabs.ads },
    { id: 'chatbot', label: t.editor.tabs.chatbot },
    { id: 'social', label: t.editor.tabs.social },
    { id: 'leads', label: `${t.editor.tabs.leads} (${funnel.leads.length})` },
    { id: 'insights', label: isRTL ? 'التحليلات' : 'Insights' },
    { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings' },
    { id: 'domain', label: isRTL ? 'النطاق' : 'Domain' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <Helmet defer={false}>
        <title>{funnel.name} — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-fg transition-colors hover:text-foreground">
            <ArrowLeft size={17} className={isRTL ? 'rotate-180' : ''} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{funnel.name}</h1>
            <p className="text-xs text-muted-fg">{funnel.status === 'published' ? `${t.editor.publishedAt} ${funnel.slug}.autoleadss.site` : t.common.draft}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={regenerate} disabled={regenerating} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-fg transition-colors hover:text-foreground disabled:opacity-50">
            {regenerating ? <Sparkles size={14} className="animate-pulse text-accent" /> : <RefreshCw size={14} />} {t.editor.regenerate}
          </button>
          <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-fg transition-colors hover:text-foreground">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} {t.editor.copyLink}
          </button>
          <Link to={publicUrl} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-fg transition-colors hover:text-foreground">
            <ExternalLink size={14} /> {t.common.preview}
          </Link>
          {funnel.status === 'published' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t.common.published}
            </span>
          ) : (
            <button onClick={() => publishFunnel(id)} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-medium text-white transition-transform hover:-translate-y-0.5">
              <Globe size={14} /> {t.common.publish}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab === tb.id ? 'border-accent text-accent' : 'border-transparent text-muted-fg hover:text-foreground'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {spec.isDemoContent && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <Info size={15} className="mt-0.5 shrink-0" />
            <p>{isRTL ? 'نموذج تجريبي — عدّله من المحرر قبل النشر ليعكس نشاطك بدقة.' : 'Demo template — edit it in the editor below before publishing so it accurately reflects your business.'}</p>
          </div>
        )}
        {tab === 'page' && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className="flex flex-col gap-5">
              <FieldGroup title={isRTL ? 'القسم الرئيسي' : 'Hero'}>
                <EditField label={isRTL ? 'العنوان الفرعي' : 'Eyebrow'} value={spec.page.hero.eyebrow} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, eyebrow: v } } }))} />
                <EditArea label={isRTL ? 'العنوان' : 'Headline'} value={spec.page.hero.headline} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, headline: v } } }))} />
                <EditArea label={isRTL ? 'الوصف' : 'Subhead'} value={spec.page.hero.subhead} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, subhead: v } } }))} />
                <div className="grid grid-cols-2 gap-2">
                  <EditField label={isRTL ? 'زر رئيسي' : 'Primary CTA'} value={spec.page.hero.ctaPrimary} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, ctaPrimary: v } } }))} />
                  <EditField label={isRTL ? 'زر ثانوي' : 'Secondary CTA'} value={spec.page.hero.ctaSecondary} onChange={(v) => set((s) => ({ ...s, page: { ...s.page, hero: { ...s.page.hero, ctaSecondary: v } } }))} />
                </div>
              </FieldGroup>

              <FieldGroup title={isRTL ? 'المميزات' : 'Features'}>
                {spec.page.features.map((f, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/40 p-3">
                    <EditField label={`#${i + 1}`} value={f.title} onChange={(v) => set((s) => { const feats = [...s.page.features]; feats[i] = { ...feats[i], title: v }; return { ...s, page: { ...s.page, features: feats } } })} />
                    <EditArea label="" value={f.body} onChange={(v) => set((s) => { const feats = [...s.page.features]; feats[i] = { ...feats[i], body: v }; return { ...s, page: { ...s.page, features: feats } } })} />
                  </div>
                ))}
              </FieldGroup>
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-fg"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t.editor.livePreview}</p>
              <BrowserFrame url={`${funnel.slug}.autoleadss.site`}>
                <div className="h-[600px] overflow-y-auto">
                  <FunnelRenderer spec={spec} accent={accent} />
                </div>
              </BrowserFrame>
            </div>
          </div>
        )}

        {tab === 'ads' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {spec.ads.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase text-accent">{a.platform}</span>
                  <CopyBtn text={`${a.headline}\n${a.description}`} />
                </div>
                <input value={a.headline} onChange={(e) => set((s) => { const ads = [...s.ads]; ads[i] = { ...ads[i], headline: e.target.value }; return { ...s, ads } })} className="w-full bg-transparent font-display text-base font-semibold text-[#1a0dab] outline-none" />
                <textarea value={a.description} onChange={(e) => set((s) => { const ads = [...s.ads]; ads[i] = { ...ads[i], description: e.target.value }; return { ...s, ads } })} rows={3} className="mt-2 w-full resize-none bg-transparent text-sm text-muted-fg outline-none" />
                <span className="mt-2 inline-block rounded-md bg-muted px-3 py-1 text-xs font-medium text-foreground">{a.cta}</span>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'chatbot' && (
          <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr]">
            <div>
              <p className="mb-3 text-xs font-medium text-muted-fg">{t.editor.simulator}</p>
              <ChatSimulator
                spec={spec}
                accent={accent}
                locked={isCapHit(whatsappGate.status)}
                lockedMessage={isRTL ? 'وصلت لحد محادثات واتساب الذكي لهذا الشهر — رقِّ باقتك لمزيد من المحادثات.' : 'This month’s WhatsApp-AI conversation limit has been reached — upgrade for more.'}
                onConversationStart={() => {
                  const ok = whatsappGate.record()
                  if (!ok) openUpgrade('whatsappCap')
                }}
              />
            </div>
            <div className="flex flex-col gap-4">
              <FieldGroup title={isRTL ? 'رسالة الترحيب' : 'Greeting'}>
                <EditArea label="" value={spec.chatbot.greeting} onChange={(v) => set((s) => ({ ...s, chatbot: { ...s.chatbot, greeting: v } }))} />
              </FieldGroup>
              <FieldGroup title={isRTL ? 'مسار المحادثة' : 'Conversation flow'}>
                {spec.chatbot.flow.map((f, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-accent">{isRTL ? 'محفّز' : 'Trigger'}: {f.trigger}</p>
                    <EditArea label="" value={f.response} onChange={(v) => set((s) => { const flow = [...s.chatbot.flow]; flow[i] = { ...flow[i], response: v }; return { ...s, chatbot: { ...s.chatbot, flow } } })} />
                  </div>
                ))}
              </FieldGroup>
            </div>
          </div>
        )}

        {tab === 'social' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spec.social.map((sp, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase text-accent">{sp.platform}</span>
                  <CopyBtn text={`${sp.caption}\n${sp.hashtags.join(' ')}`} />
                </div>
                <textarea value={sp.caption} onChange={(e) => set((s) => { const social = [...s.social]; social[i] = { ...social[i], caption: e.target.value }; return { ...s, social } })} rows={4} className="w-full flex-1 resize-none bg-transparent text-sm text-foreground outline-none" />
                <p className="mt-3 text-xs font-medium text-accent">{sp.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'leads' && (
          <>
            {hasSampleData(funnel) && <SampleDataBanner funnelId={id} isRTL={isRTL} />}
            {funnel.leads.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => downloadLeadsCsv(funnel.name, funnel.leads)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-fg transition-colors hover:text-foreground"
                >
                  <Download size={14} /> {isRTL ? 'تصدير CSV' : 'Export CSV'}
                </button>
              </div>
            )}
            <LeadsTable funnelId={id} leads={funnel.leads} locale={toContentLocale(locale)} isRTL={isRTL} />
          </>
        )}

        {tab === 'insights' && (
          <>
            {hasSampleData(funnel) && <SampleDataBanner funnelId={id} isRTL={isRTL} />}
            <FunnelAnalytics funnel={funnel} isRTL={isRTL} />
          </>
        )}

        {tab === 'settings' && <SettingsPanel spec={spec} set={set} isRTL={isRTL} />}

        {tab === 'domain' && <DomainPanel funnel={funnel} isRTL={isRTL} />}
      </div>
    </div>
  )
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** Client-side CSV export — leads already live fully in `funnel.leads`, no API call needed. */
function downloadLeadsCsv(funnelName: string, leads: Lead[]) {
  const header = ['Name', 'Phone', 'Email', 'Source', 'Status', 'Created At']
  const rows = leads.map((l) => [l.name, l.phone, l.email ?? '', l.source, l.status, new Date(l.createdAt).toISOString()])
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${funnelName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'leads'}-leads.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function SettingsPanel({ spec, set, isRTL }: { spec: FunnelSpec; set: (mutate: (s: FunnelSpec) => FunnelSpec) => void; isRTL: boolean }) {
  const thankYou = spec.page.thankYou
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <FieldGroup title={isRTL ? 'تتبّع التحويل' : 'Conversion tracking'}>
        <p className="-mt-1 mb-1 text-xs text-muted-fg">
          {isRTL ? 'أضف معرّفات البكسل/GA4 لتتبّع أداء الإعلانات على هذه الصفحة.' : 'Add your pixel/GA4 IDs to measure ad performance on this page.'}
        </p>
        <EditField
          label="Meta Pixel ID"
          value={spec.tracking?.metaPixelId ?? ''}
          onChange={(v) => set((s) => ({ ...s, tracking: { ...s.tracking, metaPixelId: v || undefined } }))}
        />
        <EditField
          label="GA4 Measurement ID"
          value={spec.tracking?.ga4Id ?? ''}
          onChange={(v) => set((s) => ({ ...s, tracking: { ...s.tracking, ga4Id: v || undefined } }))}
        />
      </FieldGroup>

      <FieldGroup title={isRTL ? 'صفحة الشكر' : 'Thank-you step'}>
        <p className="-mt-1 mb-1 text-xs text-muted-fg">
          {isRTL ? 'تُعرض بدلاً من رسالة "تم الإرسال" الافتراضية بعد إرسال النموذج.' : 'Shown instead of the default "Sent" message after the lead form is submitted.'}
        </p>
        <EditField
          label={isRTL ? 'العنوان' : 'Headline'}
          value={thankYou?.headline ?? ''}
          onChange={(v) => set((s) => ({ ...s, page: { ...s.page, thankYou: { ...s.page.thankYou, headline: v, body: s.page.thankYou?.body ?? '' } } }))}
        />
        <EditArea
          label={isRTL ? 'النص' : 'Body'}
          value={thankYou?.body ?? ''}
          onChange={(v) => set((s) => ({ ...s, page: { ...s.page, thankYou: { ...s.page.thankYou, headline: s.page.thankYou?.headline ?? '', body: v } } }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <EditField
            label={isRTL ? 'نص الزر (اختياري)' : 'CTA label (optional)'}
            value={thankYou?.ctaLabel ?? ''}
            onChange={(v) => set((s) => ({ ...s, page: { ...s.page, thankYou: { headline: s.page.thankYou?.headline ?? '', body: s.page.thankYou?.body ?? '', ctaLabel: v, ctaHref: s.page.thankYou?.ctaHref } } }))}
          />
          <EditField
            label={isRTL ? 'رابط الزر (اختياري)' : 'CTA link (optional)'}
            value={thankYou?.ctaHref ?? ''}
            onChange={(v) => set((s) => ({ ...s, page: { ...s.page, thankYou: { headline: s.page.thankYou?.headline ?? '', body: s.page.thankYou?.body ?? '', ctaLabel: s.page.thankYou?.ctaLabel, ctaHref: v } } }))}
          />
        </div>
      </FieldGroup>
    </div>
  )
}

function SampleDataBanner({ funnelId, isRTL }: { funnelId: string; isRTL: boolean }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <span className="flex items-center gap-2 font-medium">
        <FlaskConical size={14} /> {isRTL ? 'يتضمن هذا بيانات تجريبية (عملاء وزيارات وهمية) لتوضيح الشكل النهائي.' : 'This includes sample data (fake leads/visits) to show what a live funnel looks like.'}
      </span>
      <button
        onClick={() => {
          if (window.confirm(isRTL ? 'مسح كل العملاء والزيارات التجريبية وابدأ من صفر؟' : 'Clear all sample leads/visits and start from scratch?')) {
            clearSampleData(funnelId)
          }
        }}
        className="shrink-0 font-semibold underline decoration-dotted hover:text-amber-950"
      >
        {isRTL ? 'ابدأ من صفر' : 'Start from scratch'}
      </button>
    </div>
  )
}

function LeadsTable({ funnelId, leads, locale, isRTL }: { funnelId: string; leads: Lead[]; locale: 'en' | 'ar'; isRTL: boolean }) {
  const statuses: Lead['status'][] = ['new', 'qualified', 'won', 'lost']
  const labels: Record<Lead['status'], { en: string; ar: string }> = {
    new: { en: 'New', ar: 'جديد' }, qualified: { en: 'Qualified', ar: 'مؤهّل' }, won: { en: 'Won', ar: 'مكسوب' }, lost: { en: 'Lost', ar: 'مفقود' },
  }
  const colors: Record<Lead['status'], string> = {
    new: 'bg-blue-500/15 text-blue-600', qualified: 'bg-amber-500/15 text-amber-600', won: 'bg-emerald-500/15 text-emerald-600', lost: 'bg-red-500/15 text-red-600',
  }
  if (!leads.length) return <p className="py-16 text-center text-sm text-muted-fg">{isRTL ? 'لا يوجد عملاء بعد.' : 'No leads yet.'}</p>
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-fg">
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الاسم' : 'Name'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الهاتف' : 'Phone'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'المصدر' : 'Source'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الحالة' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-3 font-medium">
                {l.name}
                {l.sample && (
                  <span className="ms-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {isRTL ? 'تجريبي' : 'Sample'}
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-muted-fg" dir="ltr">{l.phone}</td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-fg">
                  {l.source === 'whatsapp' ? '🟢 WhatsApp' : '🌐 Page'}
                </span>
              </td>
              <td className="px-5 py-3">
                <select value={l.status} onChange={(e) => setLeadStatus(funnelId, l.id, e.target.value as Lead['status'])} className={`rounded-full px-3 py-1 text-xs font-semibold outline-none ${colors[l.status]}`}>
                  {statuses.map((s) => <option key={s} value={s}>{labels[s][locale]}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DomainPanel({ funnel, isRTL }: { funnel: Funnel; isRTL: boolean }) {
  const subdomain = `${funnel.slug}.${FUNNEL_ROOT}`
  const [domains, setDomains] = useState<Domain[]>([])
  const [host, setHost] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const sb = getDb()
    // Custom domains aren't migrated to the Neon backend yet (remoteEnabled is
    // hardcoded false — see src/saas/config.ts); skip the call entirely rather than
    // hitting a stub that always throws/returns empty.
    if (!sb || !remoteEnabled) return
    listDomains(sb, funnel.id).then(setDomains).catch(() => {})
  }, [funnel.id])

  async function add() {
    const sb = getDb()
    if (!sb || !remoteEnabled || !host.trim()) return
    setBusy(true)
    try {
      await addDomain(sb, funnel.id, host)
      setHost('')
      setDomains(await listDomains(sb, funnel.id))
    } catch (e) {
      console.error(e)
    }
    setBusy(false)
  }
  async function remove(domId: string) {
    const sb = getDb()
    if (!sb || !remoteEnabled) return
    await deleteDomain(sb, domId)
    setDomains(await listDomains(sb, funnel.id))
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-display font-semibold">{isRTL ? 'النطاق الفرعي المجاني' : 'Free subdomain'}</p>
        <p className="mt-1 text-sm text-muted-fg">{isRTL ? 'أقماعك المنشورة متاحة هنا فوراً.' : 'Your published funnel goes live here.'}</p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
          <Globe size={14} className="text-accent" />
          <code className="flex-1 text-sm" dir="ltr">{subdomain}</code>
          {funnel.status === 'published' ? (
            <a href={`https://${subdomain}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-accent">{isRTL ? 'زيارة ↗' : 'Visit ↗'}</a>
          ) : (
            <span className="text-xs text-muted-fg">{isRTL ? 'انشر أولاً' : 'publish first'}</span>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <p className="font-display font-semibold">{isRTL ? 'نطاق مخصّص' : 'Custom domain'}</p>
        {!remoteEnabled ? (
          <p className="mt-2 text-sm text-muted-fg">{isRTL ? 'النطاقات المخصّصة غير متاحة بعد — قريباً.' : 'Custom domains aren’t available yet in this version — coming soon.'}</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-fg">{isRTL ? 'أضف نطاقك ثم وجّه سجل CNAME إلى cname.vercel-dns.com' : 'Add your domain, then point a CNAME record to cname.vercel-dns.com'}</p>
            <div className="mt-3 flex gap-2">
              <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="funnel.yourbrand.com" dir="ltr" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
              <button onClick={add} disabled={busy || !host.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Plus size={15} /> {isRTL ? 'أضف' : 'Add'}</button>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${d.verified ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <code className="flex-1 text-sm" dir="ltr">{d.hostname}</code>
                  <span className="text-[11px] text-muted-fg">{d.verified ? (isRTL ? 'مفعّل' : 'live') : (isRTL ? 'بانتظار DNS' : 'pending DNS')}</span>
                  <button onClick={() => remove(d.id)} className="text-muted-fg hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-fg">{isRTL ? 'أضف النطاق أيضاً في مشروع الاستضافة ليصدر شهادة SSL.' : 'Also add the domain in your hosting project so it issues an SSL cert.'}</p>
          </>
        )}
      </div>
    </div>
  )
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 font-display text-sm font-semibold">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function EditField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-medium uppercase text-muted-fg">{label}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
    </label>
  )
}

function EditArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-medium uppercase text-muted-fg">{label}</span>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
    </label>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setC(true); setTimeout(() => setC(false), 1400) }} className="text-muted-fg transition-colors hover:text-foreground">
      {c ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  )
}
