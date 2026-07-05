import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import FunnelRenderer from '../components/FunnelRenderer'
import { LogoMark } from '../../components/Logo'
import { getFunnelBySlug, recordVisit, addLead } from '../store'
import type { Funnel } from '../types'

export default function Published() {
  const { slug = '' } = useParams()
  const [funnel, setFunnel] = useState<Funnel | null | undefined>(undefined)

  useEffect(() => {
    const f = getFunnelBySlug(slug)
    setFunnel(f ?? null)
    if (f) recordVisit(slug)
  }, [slug])

  if (funnel === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>
  }

  if (!funnel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0B] px-6 text-center text-white">
        <LogoMark size={44} />
        <h1 className="font-display text-2xl font-bold">This funnel isn’t published here yet</h1>
        <p className="max-w-md text-sm text-white/60">
          Published funnels are stored in the browser that created them (demo mode). Generate one and publish it to see it live.
        </p>
        <Link to="/signup" className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">Build one with AutoLeadss</Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <FunnelRenderer
        spec={funnel.spec}
        accent={funnel.accent}
        onLead={(d) => addLead(slug, { name: d.name, phone: d.phone, message: d.extra, source: 'page' })}
      />
      <Link to="/" target="_blank" className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-[#0A0A0B] px-3 py-2 text-[11px] font-medium text-white shadow-lg">
        <LogoMark size={16} /> Made with AutoLeadss
      </Link>
    </div>
  )
}
