import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vite only exposes VITE_-prefixed env vars to client code by default. The MBAI shared
  // env contract (~/projects/mbai-ecosystem/docs/ENV-CONTRACT.md) uses NEXT_PUBLIC_ for
  // vars safe to expose in the browser (e.g. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY), so both
  // prefixes need to reach import.meta.env.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
