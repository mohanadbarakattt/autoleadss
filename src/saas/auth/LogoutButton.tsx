import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { clerkEnabled } from '../config'
import { signOut as demoSignOut } from '../store'

type Variant = 'default' | 'suite'

function Btn({ onClick, label, variant }: { onClick: () => void; label: string; variant: Variant }) {
  const textClass = variant === 'suite' ? 'text-suite-muted hover:text-suite-text' : 'text-muted-fg hover:bg-muted hover:text-foreground'
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${textClass}`}>
      <LogOut size={17} /> {label}
    </button>
  )
}

function DemoLogout({ label, variant }: { label: string; variant: Variant }) {
  const navigate = useNavigate()
  return <Btn label={label} variant={variant} onClick={() => { demoSignOut(); navigate('/') }} />
}

function ClerkLogout({ label, variant }: { label: string; variant: Variant }) {
  const { signOut } = useClerk()
  return <Btn label={label} variant={variant} onClick={() => signOut({ redirectUrl: '/' })} />
}

/** clerkEnabled is a build-time constant, so exactly one variant ever mounts.
 * `variant="suite"` swaps the light-theme text color for suite tokens — the
 * default `text-muted-fg` (#57544E) reads at ~2.6:1 on SuiteShell's #0c0d11 bar,
 * failing WCAG AA. */
export default function LogoutButton({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  return clerkEnabled ? <ClerkLogout label={label} variant={variant} /> : <DemoLogout label={label} variant={variant} />
}
