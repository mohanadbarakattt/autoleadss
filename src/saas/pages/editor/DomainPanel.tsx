import { useEffect, useState } from 'react'
import { Globe, Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { getDb } from '../../store'
import { remoteEnabled } from '../../config'
import { FUNNEL_ROOT } from '../../publish/host'
import { listDomains, addDomain, deleteDomain, verifyDomain, type Domain, type VerifyReason } from '../../db/domains'
import type { Funnel } from '../../types'

/** Custom-domain management (Phase 4c) — real add/verify/delete against
 * api/domains/*. Verification is a genuine DNS TXT lookup server-side
 * (api/domains/verify.ts); this panel only ever reports what that lookup
 * returned, never marks a domain live on its own. */
export default function DomainPanel({ funnel }: { funnel: Funnel }) {
  const { t } = useI18n()
  const d = t.domains
  const subdomain = `${funnel.slug}.${FUNNEL_ROOT}`
  const sb = getDb()

  const [domains, setDomains] = useState<Domain[]>([])
  const [host, setHost] = useState('')
  const [busy, setBusy] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [reasons, setReasons] = useState<Record<string, VerifyReason>>({})

  useEffect(() => {
    if (!sb) return
    listDomains(sb, funnel.id).then(setDomains).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnel.id])

  async function add() {
    if (!sb || !host.trim()) return
    setBusy(true)
    setAddError(null)
    try {
      await addDomain(sb, funnel.id, host.trim())
      setHost('')
      setDomains(await listDomains(sb, funnel.id))
    } catch (e) {
      setAddError(e instanceof Error ? e.message : String(e))
    }
    setBusy(false)
  }

  async function remove(domId: string) {
    if (!sb) return
    await deleteDomain(sb, domId)
    setDomains(await listDomains(sb, funnel.id))
  }

  async function verify(domId: string) {
    if (!sb) return
    setVerifyingId(domId)
    try {
      const result = await verifyDomain(sb, domId)
      setReasons((r) => {
        if (result.verified || !result.reason) {
          const { [domId]: _drop, ...rest } = r
          return rest
        }
        return { ...r, [domId]: result.reason }
      })
      if (result.verified) setDomains(await listDomains(sb, funnel.id))
    } catch (e) {
      console.error(e)
    }
    setVerifyingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-display font-semibold">{d.freeSubdomainTitle}</p>
        <p className="mt-1 text-sm text-muted-fg">{d.freeSubdomainBody}</p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
          <Globe size={14} className="text-accent" />
          <code className="flex-1 text-sm" dir="ltr">{subdomain}</code>
          {funnel.status === 'published' ? (
            <a href={`https://${subdomain}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-accent">{d.visit}</a>
          ) : (
            <span className="text-xs text-muted-fg">{d.publishFirst}</span>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <p className="font-display font-semibold">{d.customTitle}</p>
        {!remoteEnabled ? (
          <p className="mt-2 text-sm text-muted-fg">{d.comingSoon}</p>
        ) : !sb ? (
          <p className="mt-2 text-sm text-muted-fg">{d.signInRequired}</p>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              <input value={host} onChange={(e) => setHost(e.target.value)} placeholder={d.placeholder} dir="ltr" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent" />
              <button onClick={add} disabled={busy || !host.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Plus size={15} /> {d.add}</button>
            </div>
            {addError && <p className="mt-2 text-xs text-red-500">{addError}</p>}

            <div className="mt-4 flex flex-col gap-3">
              {domains.map((dom) => (
                <DomainRow
                  key={dom.id}
                  dom={dom}
                  reason={reasons[dom.id]}
                  verifying={verifyingId === dom.id}
                  onVerify={() => verify(dom.id)}
                  onRemove={() => remove(dom.id)}
                  d={d}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-fg">{d.cnameNote}</p>
          </>
        )}
      </div>
    </div>
  )
}

function DomainRow({
  dom,
  reason,
  verifying,
  onVerify,
  onRemove,
  d,
}: {
  dom: Domain
  reason: VerifyReason | undefined
  verifying: boolean
  onVerify: () => void
  onRemove: () => void
  d: ReturnType<typeof useI18n>['t']['domains']
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dom.verified ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        <code className="flex-1 text-sm" dir="ltr">{dom.hostname}</code>
        <span className="text-[11px] text-muted-fg">{dom.verified ? d.verified : d.pending}</span>
        {!dom.verified && (
          <button onClick={onVerify} disabled={verifying} className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-fg transition-colors hover:text-foreground disabled:opacity-50">
            {verifying ? d.verifying : d.verify}
          </button>
        )}
        <button onClick={onRemove} aria-label={d.remove} className="text-muted-fg hover:text-red-500"><Trash2 size={14} /></button>
      </div>
      {!dom.verified && (
        <div className="mt-2.5 rounded-md bg-background px-3 py-2 text-xs" dir="ltr">
          <p className="text-muted-fg">{d.recordIntro}</p>
          <p className="mt-1"><span className="text-muted-fg">{d.recordName}:</span> <code>_autoleadss.{dom.hostname}</code></p>
          <p className="mt-0.5"><span className="text-muted-fg">{d.recordValue}:</span> <code>{dom.verificationToken}</code></p>
        </div>
      )}
      {reason && <p className="mt-2 text-[11px] text-amber-700">{d.reasons[reason]}</p>}
    </div>
  )
}
