import { Navigate, useParams } from 'react-router-dom'
import { demoById } from '../demos/data'
import NotFound from './NotFound'
import CafeDemo from './demos/CafeDemo'
import DentistDemo from './demos/DentistDemo'
import GymDemo from './demos/GymDemo'
import AgencyDemo from './demos/AgencyDemo'
import LashCartelDemo from './demos/LashCartelDemo'

export default function DemoPage() {
  const { kind } = useParams()
  const demo = demoById(kind)
  if (!demo) return <NotFound />

  if (demo.id === 'cafe') return <CafeDemo demo={demo} />
  if (demo.id === 'dentist') return <DentistDemo demo={demo} />
  if (demo.id === 'gym') return <GymDemo demo={demo} />
  if (demo.id === 'lashes') return <LashCartelDemo demo={demo} />
  return <AgencyDemo demo={demo} />
}

export function DemoRedirect() {
  const { kind } = useParams()
  return <Navigate to={`/en/demo/${kind ?? ''}`} replace />
}
