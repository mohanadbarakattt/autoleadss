import { useEffect, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import type { Funnel, Lead } from '../types'
import { generateFollowUp } from '../ai/followUp'
import { clearSampleData } from '../store'

/**
 * Shared instant-reply draft logic — drafts (and lets the merchant edit/redraft)
 * a WhatsApp follow-up for a lead via `generateFollowUp` (AI gateway, template
 * fallback baked in) and builds the wa.me send link. Used by both Editor.tsx's
 * per-funnel leads tab (InstantReplyPanel) and the cross-site /app/leads CRM, so
 * the AI logic lives in exactly one place — only the surrounding markup differs
 * per surface's theme.
 */
export function useFollowUpDraft(funnel: Funnel, lead: Lead) {
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function regenerate() {
    setBusy(true)
    try {
      setDraft(await generateFollowUp(funnel, lead))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    regenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id])

  const digits = lead.phone.replace(/[^0-9]/g, '')
  const waHref = draft ? `https://wa.me/${digits}?text=${encodeURIComponent(draft)}` : undefined

  return { draft, setDraft, busy, regenerate, waHref }
}

/**
 * Warns that a funnel's leads/visits include `seedDemoLeads`'s fictitious sample
 * data (defect class T5 — unlabeled seeded data), with a one-click "start from
 * scratch". Shared by Editor.tsx's leads tab and the cross-site /app/leads CRM —
 * reused as-is (same copy, same amber alert styling) rather than duplicated.
 */
export function SampleDataBanner({ funnelId, isRTL }: { funnelId: string; isRTL: boolean }) {
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
