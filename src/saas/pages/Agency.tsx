import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Building2, Plus, Trash2, Check, Users, Lock, ArrowRight } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { Panel } from '../suite/ui'
import { useI18n } from '../i18n'
import { useAgency, useFunnels, saveAgencySettings, createSubAccount, deleteSubAccount, setActiveSubAccount } from '../store'
import { useEntitlements, useUpgrade } from '../billing/UpgradeContext'
import { isValidBrandName, isValidLogoUrl, MAX_BRAND_NAME_LEN } from '../lib/agencyBrand'
import type { Dict } from '../i18n'

const ACCENTS = ['#FF5C2A', '#2563EB', '#7C3AED', '#059669', '#E11D48', '#0A0A0B']

/** The agency/white-label surface (Phase 6) — first-class on the suite
 * register, matching Leads.tsx/Insights.tsx/Whatsapp.tsx. Real persistence in
 * remote mode via api/agency/*, demo mode keyless via localStorage (both
 * paths go through the same `useAgency()`/store.ts functions — see store.ts's
 * doc on `saveAgencySettings`/`createSubAccount`/`deleteSubAccount`).
 * Exported separately from the routed page, same split as Leads/Insights, so
 * it can be tested without an authenticated session. */
export function AgencyContent() {
  const { t } = useI18n()
  const a = t.agency
  const ent = useEntitlements()
  const openUpgrade = useUpgrade()
  const agency = useAgency()
  const funnels = useFunnels()

  const [brand, setBrand] = useState(agency.settings?.brandName ?? '')
  const [accent, setAccent] = useState(agency.settings?.accent ?? '#FF5C2A')
  const [logoUrl, setLogoUrl] = useState(agency.settings?.logoUrl ?? '')
  const [hideBadge, setHideBadge] = useState(agency.settings?.hideBadge ?? true)
  const [savedBrand, setSavedBrand] = useState(false)
  const [brandError, setBrandError] = useState('')
  const [subName, setSubName] = useState('')
  const [subEmail, setSubEmail] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  if (!ent.whiteLabel) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-suite-gold/10">
          <Lock size={24} className="text-suite-gold-l" />
        </div>
        <h1 className="mt-5 font-luxe text-2xl font-semibold text-suite-text">{a.locked.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-suite-muted">{a.locked.body}</p>
        <button
          type="button"
          onClick={() => openUpgrade('whiteLabel')}
          className="mt-6 rounded-full bg-suite-gold px-7 py-3 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90"
        >
          {a.locked.cta}
        </button>
      </div>
    )
  }

  function saveBrand() {
    const trimmedName = brand.trim()
    if (trimmedName && !isValidBrandName(trimmedName)) {
      setBrandError(a.brand.nameError)
      return
    }
    const trimmedLogo = logoUrl.trim()
    if (trimmedLogo && !isValidLogoUrl(trimmedLogo)) {
      setBrandError(a.brand.logoUrlError)
      return
    }
    setBrandError('')
    saveAgencySettings({ brandName: trimmedName || undefined, accent, logoUrl: trimmedLogo || undefined, hideBadge })
    setSavedBrand(true)
    setTimeout(() => setSavedBrand(false), 2000)
  }
  function addSub() {
    if (!subName.trim()) return
    createSubAccount(subName.trim(), subEmail.trim() || undefined)
    setSubName('')
    setSubEmail('')
  }
  function confirmDelete(id: string) {
    deleteSubAccount(id)
    setConfirmingId(null)
  }
  const countFor = (id: string) => funnels.filter((f) => f.subAccountId === id).length
  const activeSub = agency.subAccounts.find((s) => s.id === agency.activeSubAccountId)
  const input =
    'w-full rounded-xl border border-suite-line bg-suite-panel2 px-3 py-2.5 text-sm text-suite-text outline-none focus:border-suite-gold'

  return (
    <div className="mx-auto max-w-[820px] px-[30px] pb-[60px] pt-9">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-suite-line bg-suite-panel2 text-suite-gold-l">
          <Building2 size={20} strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="font-luxe text-[28px] font-semibold text-suite-text">{a.title}</h1>
          <p className="text-[13px] text-suite-muted">{a.subtitle}</p>
        </div>
      </div>

      {activeSub && (
        <Panel className="mt-6 flex flex-wrap items-center justify-between gap-3 p-4" data-testid="agency-building-for">
          <p className="text-sm text-suite-text">
            <span className="text-suite-muted">{a.sub.buildingFor}</span> <span className="font-semibold">{activeSub.name}</span>
          </p>
          <Link
            to="/app/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-suite-gold px-4 py-2 text-xs font-semibold text-[#1c150a] transition-opacity hover:opacity-90"
          >
            {a.sub.buildCta} <ArrowRight size={13} aria-hidden />
          </Link>
        </Panel>
      )}

      {/* branding */}
      <Panel className="mt-6 p-6">
        <p className="mb-4 font-luxe font-semibold text-suite-text">{a.brand.title}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-suite-muted">{a.brand.name}</span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder={a.brand.namePh}
              maxLength={MAX_BRAND_NAME_LEN}
              className={input}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-suite-muted">{a.brand.accent}</span>
            <div className="flex items-center gap-2.5 pt-1.5">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={c}
                  className={`h-8 w-8 rounded-full transition-transform ${accent === c ? 'scale-110' : ''}`}
                  style={{ background: c, boxShadow: accent === c ? `0 0 0 2px #15161c, 0 0 0 4px ${c}` : undefined }}
                />
              ))}
            </div>
          </div>
        </div>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-suite-muted">{a.brand.logoUrl}</span>
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder={a.brand.logoUrlPh} dir="ltr" className={input} />
          <span className="text-xs text-suite-muted">{a.brand.logoUrlHint}</span>
        </label>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-suite-text">
          <input
            type="checkbox"
            checked={hideBadge}
            onChange={(e) => setHideBadge(e.target.checked)}
            className="h-4 w-4 rounded border-suite-line accent-suite-gold"
          />
          {a.brand.hideBadge}
        </label>
        {brandError && <p className="mt-3 text-xs text-red-400">{brandError}</p>}
        <button
          type="button"
          onClick={saveBrand}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-suite-gold px-6 py-2.5 text-sm font-semibold text-[#1c150a] transition-opacity hover:opacity-90"
        >
          {savedBrand ? (
            <>
              <Check size={15} /> {a.brand.saved}
            </>
          ) : (
            a.brand.save
          )}
        </button>
      </Panel>

      {/* sub-accounts */}
      <Panel className="mt-6 p-6">
        <p className="mb-1 font-luxe font-semibold text-suite-text">{a.sub.title}</p>
        <p className="mb-4 text-sm text-suite-muted">{a.sub.subtitle}</p>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder={a.sub.namePh} className={input} />
          <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder={a.sub.emailPh} dir="ltr" className={input} />
          <button
            type="button"
            onClick={addSub}
            disabled={!subName.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-suite-gold px-5 py-2.5 text-sm font-semibold text-[#1c150a] disabled:opacity-50"
          >
            <Plus size={15} /> {a.sub.add}
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <SubRow
            active={agency.activeSubAccountId === null}
            onSelect={() => setActiveSubAccount(null)}
            name={a.sub.allAccounts}
            count={funnels.length}
            labels={a}
            allRow
          />
          {agency.subAccounts.map((s) => (
            <SubRow
              key={s.id}
              active={agency.activeSubAccountId === s.id}
              onSelect={() => setActiveSubAccount(s.id)}
              onDelete={() => setConfirmingId(s.id)}
              name={s.name}
              email={s.contactEmail}
              count={countFor(s.id)}
              labels={a}
              confirming={confirmingId === s.id}
              onConfirmDelete={() => confirmDelete(s.id)}
              onCancelDelete={() => setConfirmingId(null)}
            />
          ))}
        </div>
      </Panel>
    </div>
  )
}

function SubRow({
  active,
  onSelect,
  onDelete,
  name,
  email,
  count,
  labels,
  allRow,
  confirming,
  onConfirmDelete,
  onCancelDelete,
}: {
  active: boolean
  onSelect: () => void
  onDelete?: () => void
  name: string
  email?: string
  count: number
  labels: Dict['agency']
  allRow?: boolean
  confirming?: boolean
  onConfirmDelete?: () => void
  onCancelDelete?: () => void
}) {
  return (
    <div
      data-testid={allRow ? undefined : `agency-sub-${name}`}
      className={`rounded-xl border transition-colors ${active ? 'border-suite-gold bg-suite-gold/5' : 'border-suite-line bg-suite-panel2'}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-suite-gold/10 text-suite-gold-l">
          <Users size={16} />
        </span>
        <button type="button" onClick={onSelect} className="flex-1 text-start">
          <p className="text-sm font-semibold text-suite-text">{name}</p>
          <p className="text-xs text-suite-muted">
            {email ? `${email} · ` : ''}
            {count} {count === 1 ? labels.sub.funnelOne : labels.sub.funnelOther}
          </p>
        </button>
        {active && <span className="rounded-full bg-suite-gold px-2.5 py-0.5 text-[10px] font-semibold text-[#1c150a]">{labels.sub.active}</span>}
        {!allRow && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={labels.sub.delete}
            data-testid={`agency-sub-delete-${name}`}
            className="text-suite-muted hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {confirming && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-suite-line px-4 py-3">
          <p className="text-xs text-suite-muted">{labels.sub.deleteConfirm}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onCancelDelete} className="rounded-full border border-suite-line px-3 py-1.5 text-xs text-suite-muted hover:text-suite-text">
              {labels.sub.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              className="rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
            >
              {labels.sub.confirmDelete}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Agency() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>AutoLeadss — agency</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <AgencyContent />
    </SuiteShell>
  )
}
