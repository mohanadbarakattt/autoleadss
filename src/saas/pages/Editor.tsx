import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Copy, Check, Globe, RefreshCw, Sparkles } from 'lucide-react'
import AppShell from '../components/AppShell'
import FunnelRenderer from '../components/FunnelRenderer'
import ChatSimulator from '../components/ChatSimulator'
import BrowserFrame from '../components/BrowserFrame'
import { useI18n } from '../i18n'
import { useFunnel, updateSpec, updateFunnel, publishFunnel, setLeadStatus } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { FunnelSpec, Lead } from '../types'

type Tab = 'page' | 'ads' | 'chatbot' | 'social' | 'leads'

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

  if (!funnel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
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
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
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
              <ChatSimulator spec={spec} accent={accent} />
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

        {tab === 'leads' && <LeadsTable funnelId={id} leads={funnel.leads} locale={locale} isRTL={isRTL} />}
      </div>
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
              <td className="px-5 py-3 font-medium">{l.name}</td>
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
