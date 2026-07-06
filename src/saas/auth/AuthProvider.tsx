import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { CLERK_PUBLISHABLE_KEY, clerkEnabled } from '../config'

/**
 * Wraps the SaaS routes in Clerk only when a publishable key is configured.
 * Without it, the app runs in demo mode (local session) — this is a pass-through.
 * Clerk's appearance is themed to the AutoLeadss brand so no visual layout changes.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) return <>{children}</>
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#FF5C2A',
          colorText: '#0A0A0B',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F1EFE9',
          borderRadius: '0.75rem',
          fontFamily: 'Switzer, system-ui, sans-serif',
        },
        elements: {
          card: 'shadow-none border-none',
          headerTitle: 'font-display',
          formButtonPrimary: 'bg-accent hover:bg-accent normal-case',
          footerActionLink: 'text-accent',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
