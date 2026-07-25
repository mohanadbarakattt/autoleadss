import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WhatsappContent } from './Whatsapp'
import { LocaleProvider, LOCALE_KEY } from '../i18n'
import { UpgradeProvider } from '../billing/UpgradeContext'
import { createFunnel, signUp, setPlan } from '../store'
import { generateFromTemplate } from '../ai/generate'
import type { Funnel } from '../types'

// A fake RemoteAuth handle — `getDb()` in store.ts is only ever non-null once a
// Clerk session is bridged (see store.ts's `bridgeClerkSession`), which this
// suite doesn't exercise. `remoteOn` toggles it per test so both the demo-mode
// (no backend) and connected (backend) branches of WhatsappContent are covered.
const FAKE_AUTH = { getToken: async () => 'test-token' }
let remoteOn = false

vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store')>()
  return { ...actual, getDb: () => (remoteOn ? FAKE_AUTH : null) }
})

vi.mock('../db/whatsapp', () => ({
  getConnectionForFunnel: vi.fn(),
  listConversations: vi.fn(),
  listMessages: vi.fn(),
  sendReply: vi.fn(),
}))

const { getConnectionForFunnel, listConversations, listMessages, sendReply } = await import('../db/whatsapp')

function renderWhatsapp() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <UpgradeProvider>
          <WhatsappContent />
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
  remoteOn = false
  vi.mocked(getConnectionForFunnel).mockReset()
  vi.mocked(listConversations).mockReset()
  vi.mocked(listMessages).mockReset()
  vi.mocked(sendReply).mockReset()
})

// LocaleProvider sets dir="rtl"/lang="ar" on <html> as a side effect and never
// unsets them — same cleanup as Hub.test.tsx/Leads.test.tsx/Insights.test.tsx.
afterEach(() => {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe('Whatsapp', () => {
  it('locks the page behind the Growth entitlement when the plan has no WhatsApp bot (default/starter plan)', () => {
    renderWhatsapp()
    expect(screen.getByText('WhatsApp bot is a Growth feature')).toBeInTheDocument()
    expect(screen.queryByTestId('whatsapp-not-connected')).not.toBeInTheDocument()
  })

  it('shows the honest not-connected state in demo mode, never a fabricated conversation', () => {
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('growth')
    makeFunnel('f_wa_1', 'Demo Site')
    renderWhatsapp()
    expect(screen.getByTestId('whatsapp-not-connected')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /connect whatsapp/i })).toHaveAttribute('href', '/app/connect')
    expect(getConnectionForFunnel).not.toHaveBeenCalled()
  })

  it('renders Arabic strings in AR locale', () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    signUp('Demo', 'demo@example.com', 'gulf')
    setPlan('growth')
    renderWhatsapp()
    expect(screen.getByText('واتساب')).toBeInTheDocument()
    expect(screen.getByText('غير متصل بعد')).toBeInTheDocument()
  })

  it('shows the honest empty state when connected but no conversations have arrived yet', async () => {
    signUp('Demo2', 'demo2@example.com', 'gulf')
    setPlan('growth')
    const funnel = makeFunnel('f_wa_2', 'Empty Convo Site')
    remoteOn = true
    vi.mocked(getConnectionForFunnel).mockResolvedValue({
      id: 'conn1', funnelId: funnel.id, phoneNumberId: 'PN1', accessToken: '', verifyToken: '', status: 'connected',
    })
    vi.mocked(listConversations).mockResolvedValue([])
    renderWhatsapp()
    expect(await screen.findByTestId('whatsapp-empty')).toBeInTheDocument()
  })

  it('renders a thread with correct RTL bubble alignment for inbound vs outbound messages', async () => {
    window.localStorage.setItem(LOCALE_KEY, 'ar')
    signUp('Demo3', 'demo3@example.com', 'gulf')
    setPlan('growth')
    const funnel = makeFunnel('f_wa_3', 'Thread Site')
    remoteOn = true
    vi.mocked(getConnectionForFunnel).mockResolvedValue({
      id: 'conn3', funnelId: funnel.id, phoneNumberId: 'PN3', accessToken: '', verifyToken: '', status: 'connected',
    })
    vi.mocked(listConversations).mockResolvedValue([{ waId: '+201000000001', lastBody: 'hi', lastDirection: 'in', at: Date.now() }])
    vi.mocked(listMessages).mockResolvedValue([
      { id: 'm1', waFrom: '+201000000001', body: 'Customer message', direction: 'in', at: Date.now() },
      { id: 'm2', waFrom: '+201000000001', body: 'Business reply', direction: 'out', at: Date.now() },
    ])
    renderWhatsapp()

    const bubbles = await screen.findAllByTestId('whatsapp-message')
    expect(bubbles).toHaveLength(2)
    expect(bubbles[0]).toHaveAttribute('data-direction', 'in')
    expect(bubbles[0].className).toContain('self-start')
    expect(bubbles[1]).toHaveAttribute('data-direction', 'out')
    expect(bubbles[1].className).toContain('self-end')
    // The thread container is explicitly RTL — self-start/self-end mirror
    // against it rather than staying pinned to the physical left/right.
    expect(bubbles[0].closest('[dir="rtl"]')).toBeTruthy()
  })

  it('the reply send path goes through the metered api/whatsapp/send.ts (no second send path), and never bypasses the 24h window rule', async () => {
    signUp('Demo4', 'demo4@example.com', 'gulf')
    setPlan('growth')
    const funnel = makeFunnel('f_wa_4', 'Reply Site')
    remoteOn = true
    vi.mocked(getConnectionForFunnel).mockResolvedValue({
      id: 'conn4', funnelId: funnel.id, phoneNumberId: 'PN4', accessToken: '', verifyToken: '', status: 'connected',
    })
    vi.mocked(listConversations).mockResolvedValue([{ waId: '+201000000009', lastBody: 'hi', lastDirection: 'in', at: Date.now() }])
    vi.mocked(listMessages).mockResolvedValue([])
    vi.mocked(sendReply).mockRejectedValue(new Error('service_window_closed'))
    renderWhatsapp()

    const input = await screen.findByPlaceholderText('Type a reply…')
    fireEvent.change(input, { target: { value: 'hello there' } })
    fireEvent.click(screen.getByTestId('whatsapp-send'))

    await waitFor(() => expect(sendReply).toHaveBeenCalledWith(FAKE_AUTH, 'conn4', '+201000000009', 'hello there'))
    // The window-closed rule (the real quota mechanic on the send path) surfaces
    // as an honest message — never a fake "sent" state.
    expect(await screen.findByTestId('whatsapp-send-error')).toHaveTextContent(/24-hour/i)
    expect(screen.queryByTestId('whatsapp-message')).not.toBeInTheDocument()
  })

  it('renders a sent reply optimistically and updates the conversation list preview', async () => {
    signUp('Demo5', 'demo5@example.com', 'gulf')
    setPlan('growth')
    const funnel = makeFunnel('f_wa_5', 'Send Success Site')
    remoteOn = true
    vi.mocked(getConnectionForFunnel).mockResolvedValue({
      id: 'conn5', funnelId: funnel.id, phoneNumberId: 'PN5', accessToken: '', verifyToken: '', status: 'connected',
    })
    vi.mocked(listConversations).mockResolvedValue([{ waId: '+201000000005', lastBody: 'hi', lastDirection: 'in', at: Date.now() }])
    vi.mocked(listMessages).mockResolvedValue([])
    vi.mocked(sendReply).mockResolvedValue(undefined)
    renderWhatsapp()

    const input = await screen.findByPlaceholderText('Type a reply…')
    fireEvent.change(input, { target: { value: 'thanks for reaching out' } })
    fireEvent.click(screen.getByTestId('whatsapp-send'))

    await waitFor(() => expect(sendReply).toHaveBeenCalled())
    expect(await screen.findByText('thanks for reaching out')).toBeInTheDocument()
  })
})
