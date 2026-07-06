import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { clerkEnabled } from '../config'
import { signOut as demoSignOut } from '../store'

function Btn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:bg-muted hover:text-foreground">
      <LogOut size={17} /> {label}
    </button>
  )
}

function DemoLogout({ label }: { label: string }) {
  const navigate = useNavigate()
  return <Btn label={label} onClick={() => { demoSignOut(); navigate('/') }} />
}

function ClerkLogout({ label }: { label: string }) {
  const { signOut } = useClerk()
  return <Btn label={label} onClick={() => signOut({ redirectUrl: '/' })} />
}

/** clerkEnabled is a build-time constant, so exactly one variant ever mounts. */
export default function LogoutButton({ label }: { label: string }) {
  return clerkEnabled ? <ClerkLogout label={label} /> : <DemoLogout label={label} />
}
