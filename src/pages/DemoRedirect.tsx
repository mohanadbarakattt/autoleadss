import { Navigate, useParams } from 'react-router-dom'

export default function DemoRedirect() {
  const { kind } = useParams()
  return <Navigate to={`/en/demo/${kind ?? ''}`} replace />
}
