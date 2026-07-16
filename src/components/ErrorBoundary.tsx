import { Component, type ReactNode } from 'react'

/**
 * Catches any render/effect error in the tree below it and shows a minimal
 * branded fallback instead of leaving the whole SPA as a blank <body> —
 * see main.tsx where this wraps the router.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="font-display text-xl font-bold">Something went wrong</p>
        <p className="max-w-sm text-sm text-muted-fg">
          Please reload the page. If this keeps happening, contact us on WhatsApp.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white"
        >
          Reload
        </button>
      </div>
    )
  }
}
