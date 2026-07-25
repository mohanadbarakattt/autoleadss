import { useEffect, useState } from 'react'
import { Globe, Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { getDb } from '../../store'
import { remoteEnabled } from '../../config'
import { FUNNEL_ROOT } from '../../publish/host'
import { GoldButton, Panel } from '../../suite/ui'
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
      <Panel className="p-6">
        <p className="font-luxe font-semibold text-suite-text">{d.freeSubdomainTitle}</p>
        <p className="mt-1 text-sm text-suite-muted">{d.freeSubdomainBody}</p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-suite-line bg-suite-panel2/60 px-3 py-2.5">
          <Globe size={14} className="text-suite-gold-l" />
          <code className="flex-1 text-sm text-suite-text" dir="ltr">{subdomain}</code>
          {funnel.status === 'published' ? (
            <a href={`https://${subdomain}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-suite-gold-l">{d.visit}</a>
          ) : (
            <span className="text-xs text-suite-muted">{d.publishFirst}</span>
          )}
        </div>
      </Panel>

      <Panel className="mt-4 p-6">
        <p className="font-luxe font-semibold text-suite-text">{d.customTitle}</p>
        {!remoteEnabled ? (
          <p className="mt-2 text-sm text-suite-muted">{d.comingSoon}</p>
        ) : !sb ? (
          <p className="mt-2 text-sm text-suite-muted">{d.signInRequired}</p>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              <input value={host} onChange={(e) => setHost(e.target.value)} placeholder={d.placeholder} dir="ltr" className="flex-1 rounded-lg border border-suite-line bg-suite-panel2 px-3 py-2.5 text-sm text-suite-text outline-none focus:border-suite-gold" />
              <GoldButton onClick={add} disabled={busy || !host.trim()}><Plus size={15} /> {d.add}</GoldButton>
            </div>
            {addError && <p className="mt-2 text-xs text-red-400">{addError}</p>}

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
            <p className="mt-3 text-xs text-suite-muted">{d.cnameNote}</p>
          </>
        )}
      </Panel>
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
    <div className="rounded-lg border border-suite-line bg-suite-panel2/60 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dom.verified ? 'bg-suite-ok' : 'bg-amber-400'}`} />
        <code className="flex-1 text-sm text-suite-text" dir="ltr">{dom.hostname}</code>
        <span className="text-[11px] text-suite-muted">{dom.verified ? d.verified : d.pending}</span>
        {!dom.verified && (
          <button onClick={onVerify} disabled={verifying} className="rounded-full border border-suite-line px-3 py-1 text-[11px] font-medium text-suite-muted transition-colors hover:text-suite-text disabled:opacity-50">
            {verifying ? d.verifying : d.verify}
          </button>
        )}
        <button onClick={onRemove} aria-label={d.remove} className="text-suite-muted hover:text-red-400"><Trash2 size={14} /></button>
      </div>
      {!dom.verified && (
        <div className="mt-2.5 rounded-md bg-suite-panel px-3 py-2 text-xs" dir="ltr">
          <p className="text-suite-muted">{d.recordIntro}</p>
          <p className="mt-1"><span className="text-suite-muted">{d.recordName}:</span> <code className="text-suite-text">_autoleadss.{dom.hostname}</code></p>
          <p className="mt-0.5"><span className="text-suite-muted">{d.recordValue}:</span> <code className="text-suite-text">{dom.verificationToken}</code></p>
        </div>
      )}
      {reason && <p className="mt-2 text-[11px] text-amber-300">{d.reasons[reason]}</p>}
    </div>
  )
}
