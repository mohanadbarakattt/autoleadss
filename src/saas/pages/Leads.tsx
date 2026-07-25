import { Fragment, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Download, Users, MessageCircle, RefreshCw } from 'lucide-react'
import SuiteShell from '../suite/SuiteShell'
import { Panel } from '../suite/ui'
import { useI18n } from '../i18n'
import { useSession, useFunnels, getDb, setLeadStatus } from '../store'
import { listLeadsRemote } from '../db/api'
import { downloadLeadsCsv } from '../leads/csv'
import { useFollowUpDraft, SampleDataBanner } from '../leads/shared'
import type { Funnel, Lead, LeadWithFunnel } from '../types'

const STATUSES: Lead['status'][] = ['new', 'qualified', 'won', 'lost']

const STATUS_TONE: Record<Lead['status'], string> = {
  new: 'bg-blue-500/15 text-blue-300',
  qualified: 'bg-amber-500/15 text-amber-300',
  won: 'bg-suite-ok/15 text-suite-ok',
  lost: 'bg-red-500/15 text-red-300',
}

// Mirrors api/leads/index.ts's MAX_LIMIT — the single largest page this page
// fetches in remote mode; status/site/search filtering below all happen
// client-side over it rather than round-tripping per filter change.
const LEADS_PAGE_SIZE = 200

function inputClass() {
  return 'rounded-lg border border-suite-line bg-suite-panel2 px-3 py-2 text-sm text-suite-text outline-none transition-colors focus:border-suite-gold'
}

/** The cross-site CRM content (Phase 5a). Exported separately from the routed
 * page, same split as Hub/Products, so it can be tested without an
 * authenticated session. */
export function LeadsContent() {
  const { t, isRTL } = useI18n()
  const l = t.leads
  const session = useSession()
  const funnels = useFunnels()
  const remote = getDb()

  // Demo mode: funnels already carry `.leads` locally (store.ts) — just flatten
  // them. Remote mode: fetch the cross-site list fresh from GET /api/leads, since
  // `state.funnels` was only snapshotted once at sign-in and won't reflect leads
  // captured since.
  const [remoteLeads, setRemoteLeads] = useState<LeadWithFunnel[] | null>(null)
  useEffect(() => {
    if (!remote) {
      setRemoteLeads(null)
      return
    }
    let cancelled = false
    listLeadsRemote(remote, { limit: LEADS_PAGE_SIZE })
      .then((leads) => {
        if (!cancelled) setRemoteLeads(leads)
      })
      .catch(() => {
        if (!cancelled) setRemoteLeads([])
      })
    return () => {
      cancelled = true
    }
  }, [remote])

  const demoLeads: LeadWithFunnel[] = useMemo(
    () =>
      funnels
        .flatMap((f) => f.leads.map((lead) => ({ ...lead, funnelId: f.id, funnelName: f.name })))
        .sort((a, b) => b.createdAt - a.createdAt),
    [funnels],
  )

  const allLeads = remote ? remoteLeads ?? [] : demoLeads
  const funnelsById = useMemo(() => new Map(funnels.map((f) => [f.id, f])), [funnels])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | ''>('')
  const [siteFilter, setSiteFilter] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allLeads.filter((lead) => {
      if (statusFilter && lead.status !== statusFilter) return false
      if (siteFilter && lead.funnelId !== siteFilter) return false
      if (q) {
        const haystack = `${lead.name} ${lead.phone} ${lead.email ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [allLeads, statusFilter, siteFilter, search])

  // Sample-seeded funnels contributing to the current view — one banner each,
  // reusing the same funnel-scoped "start from scratch" component the Editor's
  // leads tab uses (defect class T5: seeded data must never pass as real).
  const sampleFunnelIds = useMemo(
    () => [...new Set(filtered.filter((lead) => lead.sample).map((lead) => lead.funnelId))],
    [filtered],
  )

  function handleStatusChange(lead: LeadWithFunnel, status: Lead['status']) {
    setLeadStatus(lead.funnelId, lead.id, status)
    if (remote) setRemoteLeads((prev) => (prev ? prev.map((x) => (x.id === lead.id ? { ...x, status } : x)) : prev))
  }

  return (
    <div className="mx-auto max-w-[1080px] px-[30px] pb-[60px] pt-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-luxe text-[34px] font-semibold text-suite-text">{l.title}</h1>
          <p className="mt-1 text-[15px] text-suite-muted">{l.subtitle}</p>
        </div>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={() => downloadLeadsCsv(session?.workspace.name ?? 'leads', filtered)}
            className="inline-flex items-center gap-2 rounded-[11px] border border-suite-line px-4 py-2.5 text-sm font-medium text-suite-muted transition-colors hover:text-suite-text"
          >
            <Download size={15} strokeWidth={1.8} aria-hidden /> {l.export}
          </button>
        )}
      </div>

      {sampleFunnelIds.map((fid) => (
        <div key={fid} className="mt-6">
          <SampleDataBanner funnelId={fid} isRTL={isRTL} />
        </div>
      ))}

      {allLeads.length === 0 ? (
        <Panel className="mt-8 flex flex-col items-center gap-3 p-14 text-center" data-testid="leads-empty">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-suite-line bg-suite-panel2 text-suite-gold-l">
            <Users size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <p className="font-luxe text-xl font-semibold text-suite-text">{l.empty.title}</p>
          <p className="max-w-[360px] text-sm text-suite-muted">{l.empty.body}</p>
        </Panel>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} strokeWidth={1.8} aria-hidden className="pointer-events-none absolute inset-y-0 start-3 my-auto text-suite-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={l.searchPh}
                className={`w-full py-2 ps-9 pe-3 placeholder:text-suite-muted/60 ${inputClass()}`}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Lead['status'] | '')} className={inputClass()}>
              <option value="">{l.filters.allStatuses}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {l.status[s]}
                </option>
              ))}
            </select>
            <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className={inputClass()}>
              <option value="">{l.filters.allSites}</option>
              {funnels.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-suite-muted">{l.noResults}</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-suite-line bg-suite-panel">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-suite-line text-xs text-suite-muted">
                    <th className="px-5 py-3 text-start font-medium">{l.table.name}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.phone}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.email}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.site}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.source}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.status}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.created}</th>
                    <th className="px-5 py-3 text-start font-medium">{l.table.followUp}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <Fragment key={lead.id}>
                      <tr className="border-b border-suite-line/60 last:border-0" data-testid={`lead-${lead.id}`}>
                        <td className="px-5 py-3 font-medium text-suite-text">
                          {lead.name}
                          {lead.sample && (
                            <span className="ms-2 rounded-full bg-suite-gold/15 px-2 py-0.5 text-[10px] font-semibold text-suite-gold-l">{l.sampleBadge}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-suite-muted" dir="ltr">
                          {lead.phone}
                        </td>
                        <td className="px-5 py-3 text-suite-muted">{lead.email || '—'}</td>
                        <td className="px-5 py-3 text-suite-muted">{lead.funnelName}</td>
                        <td className="px-5 py-3 text-suite-muted">{lead.source === 'whatsapp' ? l.source.whatsapp : l.source.page}</td>
                        <td className="px-5 py-3">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead, e.target.value as Lead['status'])}
                            className={`rounded-full px-3 py-1 text-xs font-semibold outline-none ${STATUS_TONE[lead.status]}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {l.status[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-suite-muted">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => setOpenId(openId === lead.id ? null : lead.id)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-suite-line px-3 py-1.5 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text"
                          >
                            <MessageCircle size={13} aria-hidden /> {l.followUp.toggle}
                          </button>
                        </td>
                      </tr>
                      {openId === lead.id && (
                        <tr className="border-b border-suite-line/60 bg-suite-panel2/60 last:border-0">
                          <td colSpan={8} className="px-5 py-4">
                            {(() => {
                              const funnel = funnelsById.get(lead.funnelId)
                              return funnel ? <LeadFollowUp funnel={funnel} lead={lead} labels={l.followUp} /> : null
                            })()}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function LeadFollowUp({
  funnel,
  lead,
  labels,
}: {
  funnel: Funnel
  lead: Lead
  labels: { toggle: string; drafting: string; send: string; regenerate: string }
}) {
  const { draft, setDraft, busy, regenerate, waHref } = useFollowUpDraft(funnel, lead)

  return (
    <div className="flex flex-col gap-3">
      <textarea
        dir={funnel.language === 'ar' ? 'rtl' : 'ltr'}
        value={busy ? labels.drafting : draft ?? ''}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={busy}
        rows={3}
        className="w-full resize-none rounded-xl border border-suite-line bg-suite-panel2 px-3 py-2 text-sm text-suite-text outline-none focus:border-suite-gold"
      />
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!waHref}
          onClick={(e) => {
            if (!waHref) e.preventDefault()
          }}
          className={`inline-flex items-center gap-1.5 rounded-full bg-suite-ok px-4 py-2 text-xs font-semibold text-[#0c0d11] transition-opacity ${waHref ? 'hover:opacity-90' : 'pointer-events-none opacity-50'}`}
        >
          <MessageCircle size={13} aria-hidden /> {labels.send}
        </a>
        <button
          type="button"
          onClick={regenerate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-suite-line px-4 py-2 text-xs font-medium text-suite-muted transition-colors hover:text-suite-text disabled:opacity-50"
        >
          <RefreshCw size={13} aria-hidden /> {labels.regenerate}
        </button>
      </div>
    </div>
  )
}

export default function Leads() {
  return (
    <SuiteShell>
      <Helmet defer={false}>
        <title>AutoLeadss — leads</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <LeadsContent />
    </SuiteShell>
  )
}
