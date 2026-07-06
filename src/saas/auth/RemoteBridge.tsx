import { useEffect } from 'react'
import { useUser, useSession } from '@clerk/clerk-react'
import { remoteEnabled } from '../config'
import { getSupabase } from '../db/client'
import { configureRemote, teardownRemote, setBridgedSession } from '../store'
import type { Session } from '../types'

/** Map a Clerk user into the app's Session shape (demo-parity). */
function toSession(user: {
  id: string
  fullName: string | null
  firstName: string | null
  primaryEmailAddress: { emailAddress: string } | null
}): Session {
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  return {
    user: { id: user.id, name: user.fullName || email || 'You', email },
    workspace: {
      id: user.id,
      name: user.firstName ? `${user.firstName}'s workspace` : 'My workspace',
      region: 'gulf',
      plan: 'starter',
      createdAt: Date.now(),
    },
  }
}

/**
 * Bridges Clerk auth into the store: on sign-in it builds a token-scoped Supabase
 * client and loads the user's funnels; on sign-out it tears everything down.
 * Rendered only when Clerk is enabled (so the Clerk hooks always have a provider).
 */
export default function RemoteBridge() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { session } = useSession()

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !user) {
      teardownRemote()
      return
    }
    const sess = toSession(user)
    if (remoteEnabled && session) {
      const sb = getSupabase(async () => (await session.getToken()) ?? null)
      configureRemote(sb, sess)
    } else {
      setBridgedSession(sess)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id, session?.id])

  return null
}
