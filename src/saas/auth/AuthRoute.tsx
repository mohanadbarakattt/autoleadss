import { clerkEnabled } from '../config'
import ClerkAuth from './ClerkAuth'
import AuthForm from '../components/AuthForm'

/** Renders Clerk's auth when configured, else the demo auth form (same brand shell). */
export default function AuthRoute({ mode }: { mode: 'signin' | 'signup' }) {
  if (clerkEnabled) return <ClerkAuth mode={mode} />
  return <AuthForm mode={mode === 'signup' ? 'signup' : 'login'} />
}
