import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { clerkEnabled } from '../config'
import { useSession } from '../store'

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

/** Demo mode: the store session hydrates synchronously from localStorage, so the
 * only thing to wait for is the first client render (avoids an SSR/CSR mismatch). */
function DemoGate({ children }: { children: ReactNode }) {
  const session = useSession()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted && !session) navigate('/login', { replace: true })
  }, [mounted, session, navigate])

  if (!mounted || !session) return <Spinner />
  return <>{children}</>
}

/**
 * Clerk mode: waits for Clerk's own async init (`isLoaded`) before deciding
 * anything, so a signed-in user hard-loading /app is never bounced to /login
 * mid-init (AL-2). Once Clerk says signed-in, still waits for the store session
 * to be bridged by RemoteBridge — `bridgeClerkSession` sets it synchronously
 * before its async Neon probe, so this is at most one effect tick.
 */
function ClerkGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate('/login', { replace: true })
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded || !isSignedIn || !session) return <Spinner />
  return <>{children}</>
}

/** clerkEnabled is a build-time constant, so exactly one variant ever mounts
 * (same pattern as LogoutButton), keeping hook order legal either way. */
export default function AuthGate({ children }: { children: ReactNode }) {
  return clerkEnabled ? <ClerkGate>{children}</ClerkGate> : <DemoGate>{children}</DemoGate>
}
