import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ConnectContent } from './Connect'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { UpgradeProvider } from '../billing/UpgradeContext'
import { signUp, setPlan, createFunnel } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

function renderConnect() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <UpgradeProvider>
          <ConnectContent />
        </UpgradeProvider>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

function makeFunnel(id: string, name: string): Funnel {
  const spec = generateFromTemplate({ industry: 'services', businessName: name, language: 'en', region: 'gulf', goal: 'leads', tone: 'bold', accent: '#FF5C2A' })
  const funnel: Funnel = {
    id,
    name,
    slug: `slug-${id}`,
    industry: 'services',
    language: 'en',
    status: 'draft',
    accent: '#FF5C2A',
    spec,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    visits: 0,
    leads: [],
  }
  createFunnel(funnel)
  return funnel
}

beforeEach(() => {
  window.localStorage.clear()
})

// LocaleProvider sets dir="rtl"/lang="ar" on <html> as a side effect and never
// unsets them — same cleanup as Hub.test.tsx/Whatsapp.test.tsx/Agency.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Connect — entitlement gate', () => {
  it('locks the page behind the Growth entitlement when the plan has no WhatsApp bot (default/starter plan)', () => {
    renderConnect()
    expect(screen.getByText('WhatsApp bot is a Growth feature')).toBeInTheDocument()
    expect(screen.queryByText('Connect WhatsApp')).not.toBeInTheDocument()
  })

  it('unlocks the connection form on a plan with whatsappBot (e.g. growth)', () => {
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('growth')
    makeFunnel('f_connect_1', 'Demo Site')
    renderConnect()
    expect(screen.getByText('Connect WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Cloud API credentials')).toBeInTheDocument()
  })
})

describe('Connect — locale', () => {
  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('growth')
    makeFunnel('f_connect_2', 'Demo Site 2')
    renderConnect()
    expect(screen.getByText('ربط واتساب')).toBeInTheDocument()
    expect(screen.getByText('بيانات Cloud API')).toBeInTheDocument()
  })
})
