import { Fragment, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Copy, Check, Globe, RefreshCw, Sparkles, Info, Download, MessageCircle } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { GoldButton, StatusDot } from '../suite/ui'
import FunnelRenderer from '../components/FunnelRenderer'
import ChatSimulator from '../components/ChatSimulator'
import FunnelAnalytics from '../components/FunnelAnalytics'
import BrowserFrame from '../components/BrowserFrame'
import { useI18n, toContentLocale } from '../i18n'
import { useFunnel, useOrders, updateSpec, updateFunnel, publishFunnel, setLeadStatus, hasSampleData, getDb } from '../store'
import { generateFromTemplate } from '../ai/generate'
import { useUpgrade } from '../billing/UpgradeContext'
import { useCapGate, isCapHit } from '../billing/usage'
import { isValidGa4, isValidPixel } from '../lib/tracking'
import { FieldGroup, EditField, EditArea } from './editor/fields'
import DomainPanel from './editor/DomainPanel'
import { StorefrontPanel, ProductsPanel, OrdersPanel } from './editor/SellPanels'
import { downloadLeadsCsv } from '../leads/csv'
import { useFollowUpDraft, SampleDataBanner } from '../leads/shared'
import type { FunnelSpec, Lead, Funnel } from '../types'

type Tab = 'page' | 'ads' | 'chatbot' | 'social' | 'leads' | 'storefront' | 'products' | 'orders' | 'insights' | 'settings' | 'domain'

export default function Editor() {
  return (
    <SuiteShell>
      <EditorContent />
    </SuiteShell>
  )
}

/** Exported separately from the routed default (same split as
 * Hub/ProductsContent) so it can be tested without SuiteShell's auth/session
 * chrome. */
export function EditorContent() {
  const { t, isRTL, locale } = useI18n()
  const { id = '' } = useParams()
  const funnel = useFunnel(id)
  const orders = useOrders()
  const [tab, setTab] = useState<Tab>(funnel?.spec.mode === 'sell' ? 'storefront' : 'page')
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const openUpgrade = useUpgrade()
  const whatsappGate = useCapGate('whatsapp')

  // `funnel` can still be loading (remote probe) on first render, so the lazy
  // useState default above may have guessed 'page' before the mode was known —
  // correct it once the real mode arrives.
  useEffect(() => {
    if (funnel?.spec.mode === 'sell' && tab === 'page') setTab('storefront')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnel?.spec.mode])

  if (!funnel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Helmet defer={false}>
          <title>{isRTL ? 'القمع غير موجود' : 'Funnel not found'} — AutoLeadss</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <p className="text-suite-muted">{isRTL ? 'القمع غير موجود.' : 'Funnel not found.'}</p>
        <Link to="/app/pages" className="rounded-full bg-suite-gold px-5 py-2.5 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90">{t.nav.dashboard}</Link>
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
    // Belt and braces: the button is hidden in sell mode, but never let a
    // regenerate silently change what KIND of site this is.
    updateFunnel(id, { spec: { ...fresh, mode: funnel.spec.mode } })
    setRegenerating(false)
  }

  const sellMode = spec.mode === 'sell'
  const sharedTail: { id: Tab; label: string }[] = [
    { id: 'insights', label: isRTL ? 'التحليلات' : 'Insights' },
    { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings' },
    { id: 'domain', label: isRTL ? 'النطاق' : 'Domain' },
  ]
  const tabs: { id: Tab; label: string }[] = sellMode
    ? [
        { id: 'storefront', label: t.editor.tabs.storefront },
        { id: 'products', label: t.editor.tabs.products },
        { id: 'orders', label: `${t.editor.tabs.orders} (${orders.length})` },
        ...sharedTail,
      ]
    : [
        { id: 'page', label: t.editor.tabs.page },
        { id: 'ads', label: t.editor.tabs.ads },
        { id: 'chatbot', label: t.editor.tabs.chatbot },
        { id: 'social', label: t.editor.tabs.social },
        { id: 'leads', label: `${t.editor.tabs.leads} (${funnel.leads.length})` },
        ...sharedTail,
      ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <Helmet defer={false}>
        <title>{funnel.name} — AutoLeadss</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/pages" className="flex h-9 w-9 items-center justify-center rounded-full border border-suite-line text-suite-muted transition-colors hover:text-suite-text">
            <ArrowLeft size={17} className={isRTL ? 'rotate-180' : ''} />
          </Link>
          <div>
            <h1 className="font-luxe text-2xl font-semibold text-suite-text" style={{ letterSpacing: '-0.02em' }}>{funnel.name}</h1>
            {/* Only claim a live URL when there is a backend that could actually
                serve it. In keyless demo mode nothing was written anywhere and
                {slug}.autoleadss.site serves nothing — saying "Live at ..." there
                was the one place demo mode pretended a remote write succeeded. */}
            <p className="text-xs text-suite-muted">
              {funnel.status !== 'published'
                ? t.common.draft
                : getDb()
                  ? `${t.editor.publishedAt} ${funnel.slug}.autoleadss.site`
                  : t.editor.publishedDemo}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Capture-only: regenerate rebuilds the lead-page copy from the industry
              template. A storefront has no such template — running it would strip
              `mode: 'sell'` (turning the store back into a lead funnel) and
              overwrite page.finalCta, which is the band section's copy. */}
          {!sellMode && (
            <button onClick={regenerate} disabled={regenerating} className="inline-flex items-center gap-2 rounded-full border border-suite-line px-4 py-2.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text disabled:opacity-50">
              {regenerating ? <Sparkles size={14} className="animate-pulse text-suite-gold-l" /> : <RefreshCw size={14} />} {t.editor.regenerate}
            </button>
          )}
          <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full border border-suite-line px-4 py-2.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text">
            {copied ? <Check size={14} className="text-suite-ok" /> : <Copy size={14} />} {t.editor.copyLink}
          </button>
          <Link to={publicUrl} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-suite-line px-4 py-2.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text">
            <ExternalLink size={14} /> {t.common.preview}
          </Link>
          {funnel.status === 'published' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-suite-ok/15 px-4 py-2.5 text-xs font-semibold text-suite-ok">
              <StatusDot /> {t.common.published}
            </span>
          ) : (
            <GoldButton onClick={() => publishFunnel(id)}>
              <Globe size={14} /> {t.common.publish}
            </GoldButton>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-suite-line">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab === tb.id ? 'border-suite-gold text-suite-gold-l' : 'border-transparent text-suite-muted hover:text-suite-text'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {spec.isDemoContent && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-300">
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
                  <div key={i} className="rounded-lg border border-suite-line bg-suite-panel2/60 p-3">
                    <EditField label={`#${i + 1}`} value={f.title} onChange={(v) => set((s) => { const feats = [...s.page.features]; feats[i] = { ...feats[i], title: v }; return { ...s, page: { ...s.page, features: feats } } })} />
                    <EditArea label="" value={f.body} onChange={(v) => set((s) => { const feats = [...s.page.features]; feats[i] = { ...feats[i], body: v }; return { ...s, page: { ...s.page, features: feats } } })} />
                  </div>
                ))}
              </FieldGroup>
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-medium text-suite-muted"><StatusDot /> {t.editor.livePreview}</p>
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
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-suite-line bg-suite-panel p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-suite-gold/10 px-3 py-1 text-[10px] font-bold uppercase text-suite-gold-l">{a.platform}</span>
                  <CopyBtn text={`${a.headline}\n${a.description}`} />
                </div>
                <input value={a.headline} onChange={(e) => set((s) => { const ads = [...s.ads]; ads[i] = { ...ads[i], headline: e.target.value }; return { ...s, ads } })} className="w-full bg-transparent font-luxe text-base font-semibold text-[#1a0dab] outline-none" />
                <textarea value={a.description} onChange={(e) => set((s) => { const ads = [...s.ads]; ads[i] = { ...ads[i], description: e.target.value }; return { ...s, ads } })} rows={3} className="mt-2 w-full resize-none bg-transparent text-sm text-suite-muted outline-none" />
                <span className="mt-2 inline-block rounded-md bg-suite-panel2 px-3 py-1 text-xs font-medium text-suite-text">{a.cta}</span>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'chatbot' && (
          <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr]">
            <div>
              <p className="mb-3 text-xs font-medium text-suite-muted">{t.editor.simulator}</p>
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
                  <div key={i} className="rounded-lg border border-suite-line bg-suite-panel2/60 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-suite-gold-l">{isRTL ? 'محفّز' : 'Trigger'}: {f.trigger}</p>
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
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex flex-col rounded-2xl border border-suite-line bg-suite-panel p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-suite-gold/10 px-3 py-1 text-[10px] font-bold uppercase text-suite-gold-l">{sp.platform}</span>
                  <CopyBtn text={`${sp.caption}\n${sp.hashtags.join(' ')}`} />
                </div>
                <textarea value={sp.caption} onChange={(e) => set((s) => { const social = [...s.social]; social[i] = { ...social[i], caption: e.target.value }; return { ...s, social } })} rows={4} className="w-full flex-1 resize-none bg-transparent text-sm text-suite-text outline-none" />
                <p className="mt-3 text-xs font-medium text-suite-gold-l">{sp.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'storefront' && <StorefrontPanel spec={spec} set={set} />}

        {tab === 'products' && <ProductsPanel />}

        {tab === 'orders' && <OrdersPanel orders={orders} />}

        {tab === 'leads' && (
          <>
            {hasSampleData(funnel) && <SampleDataBanner funnelId={id} isRTL={isRTL} />}
            {funnel.leads.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => downloadLeadsCsv(funnel.name, funnel.leads)}
                  className="inline-flex items-center gap-2 rounded-full border border-suite-line px-4 py-2.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text"
                >
                  <Download size={14} /> {isRTL ? 'تصدير CSV' : 'Export CSV'}
                </button>
              </div>
            )}
            <LeadsTable funnel={funnel} leads={funnel.leads} locale={toContentLocale(locale)} isRTL={isRTL} />
          </>
        )}

        {tab === 'insights' && (
          <>
            {hasSampleData(funnel) && <SampleDataBanner funnelId={id} isRTL={isRTL} />}
            <FunnelAnalytics funnel={funnel} isRTL={isRTL} />
          </>
        )}

        {tab === 'settings' && <SettingsPanel spec={spec} set={set} isRTL={isRTL} />}

        {tab === 'domain' && <DomainPanel funnel={funnel} />}
      </div>
    </div>
  )
}

function SettingsPanel({ spec, set, isRTL }: { spec: FunnelSpec; set: (mutate: (s: FunnelSpec) => FunnelSpec) => void; isRTL: boolean }) {
  const thankYou = spec.page.thankYou
  const metaPixelId = spec.tracking?.metaPixelId ?? ''
  const ga4Id = spec.tracking?.ga4Id ?? ''
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <FieldGroup title={isRTL ? 'تتبّع التحويل' : 'Conversion tracking'}>
        <p className="-mt-1 mb-1 text-xs text-suite-muted">
          {isRTL ? 'أضف معرّفات البكسل/GA4 لتتبّع أداء الإعلانات على هذه الصفحة.' : 'Add your pixel/GA4 IDs to measure ad performance on this page.'}
        </p>
        <EditField
          label="Meta Pixel ID"
          value={metaPixelId}
          onChange={(v) => set((s) => ({ ...s, tracking: { ...s.tracking, metaPixelId: v || undefined } }))}
          error={metaPixelId && !isValidPixel(metaPixelId) ? (isRTL ? 'صيغة غير صحيحة (أرقام فقط، 6-20 رقم)' : 'Invalid format (digits only, 6-20 chars)') : undefined}
        />
        <EditField
          label="GA4 Measurement ID"
          value={ga4Id}
          onChange={(v) => set((s) => ({ ...s, tracking: { ...s.tracking, ga4Id: v || undefined } }))}
          error={ga4Id && !isValidGa4(ga4Id) ? (isRTL ? 'صيغة غير صحيحة (مثال: G-ABC1234)' : 'Invalid format (e.g. G-ABC1234)') : undefined}
        />
      </FieldGroup>

      <FieldGroup title={isRTL ? 'صفحة الشكر' : 'Thank-you step'}>
        <p className="-mt-1 mb-1 text-xs text-suite-muted">
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

const LEAD_STATUS_TONE: Record<Lead['status'], string> = {
  new: 'bg-blue-500/15 text-blue-300',
  qualified: 'bg-amber-500/15 text-amber-300',
  won: 'bg-suite-ok/15 text-suite-ok',
  lost: 'bg-red-500/15 text-red-300',
}

function LeadsTable({ funnel, leads, locale, isRTL }: { funnel: Funnel; leads: Lead[]; locale: 'en' | 'ar'; isRTL: boolean }) {
  const funnelId = funnel.id
  const statuses: Lead['status'][] = ['new', 'qualified', 'won', 'lost']
  const labels: Record<Lead['status'], { en: string; ar: string }> = {
    new: { en: 'New', ar: 'جديد' }, qualified: { en: 'Qualified', ar: 'مؤهّل' }, won: { en: 'Won', ar: 'مكسوب' }, lost: { en: 'Lost', ar: 'مفقود' },
  }
  const [openId, setOpenId] = useState<string | null>(null)
  if (!leads.length) return <p className="py-16 text-center text-sm text-suite-muted">{isRTL ? 'لا يوجد عملاء بعد.' : 'No leads yet.'}</p>
  return (
    <div className="overflow-x-auto rounded-2xl border border-suite-line bg-suite-panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-suite-line text-xs text-suite-muted">
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الاسم' : 'Name'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الهاتف' : 'Phone'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'المصدر' : 'Source'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'الحالة' : 'Status'}</th>
            <th className="px-5 py-3 text-start font-medium">{isRTL ? 'رد فوري' : 'Instant reply'}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <Fragment key={l.id}>
              <tr className="border-b border-suite-line/60 last:border-0">
                <td className="px-5 py-3 font-medium text-suite-text">
                  {l.name}
                  {l.sample && (
                    <span className="ms-2 rounded-full bg-suite-gold/15 px-2 py-0.5 text-[10px] font-semibold text-suite-gold-l">
                      {isRTL ? 'تجريبي' : 'Sample'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-suite-muted" dir="ltr">{l.phone}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-suite-muted">
                    {l.source === 'whatsapp' ? '🟢 WhatsApp' : '🌐 Page'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <select value={l.status} onChange={(e) => setLeadStatus(funnelId, l.id, e.target.value as Lead['status'])} className={`rounded-full px-3 py-1 text-xs font-semibold outline-none ${LEAD_STATUS_TONE[l.status]}`}>
                    {statuses.map((s) => <option key={s} value={s}>{labels[s][locale]}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setOpenId(openId === l.id ? null : l.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-suite-line px-3 py-1.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text"
                  >
                    <MessageCircle size={13} /> {isRTL ? 'رد فوري' : 'Instant reply'}
                  </button>
                </td>
              </tr>
              {openId === l.id && (
                <tr className="border-b border-suite-line/60 bg-suite-panel2/60 last:border-0">
                  <td colSpan={5} className="px-5 py-4">
                    <InstantReplyPanel funnel={funnel} lead={l} isRTL={isRTL} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InstantReplyPanel({ funnel, lead, isRTL }: { funnel: Funnel; lead: Lead; isRTL: boolean }) {
  const { draft, setDraft, busy, regenerate, waHref } = useFollowUpDraft(funnel, lead)

  return (
    <div className="flex flex-col gap-3">
      <textarea
        dir={funnel.language === 'ar' ? 'rtl' : 'ltr'}
        value={busy ? (isRTL ? 'جارٍ الكتابة…' : 'Drafting…') : (draft ?? '')}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={busy}
        rows={3}
        className="w-full resize-none rounded-xl border border-suite-line bg-suite-panel px-3 py-2 text-sm text-suite-text outline-none focus:border-suite-gold"
      />
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!waHref}
          onClick={(e) => { if (!waHref) e.preventDefault() }}
          className={`inline-flex items-center gap-1.5 rounded-full bg-suite-ok px-4 py-2 text-xs font-semibold text-[#0c0d11] transition-opacity ${waHref ? 'hover:opacity-90' : 'pointer-events-none opacity-50'}`}
        >
          <MessageCircle size={13} /> {isRTL ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
        </a>
        <button
          onClick={regenerate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-suite-line px-4 py-2 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text disabled:opacity-50"
        >
          <RefreshCw size={13} /> {isRTL ? 'إعادة الصياغة' : 'Regenerate'}
        </button>
      </div>
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setC(true); setTimeout(() => setC(false), 1400) }} className="text-suite-muted transition-colors hover:text-suite-text">
      {c ? <Check size={14} className="text-suite-ok" /> : <Copy size={14} />}
    </button>
  )
}
