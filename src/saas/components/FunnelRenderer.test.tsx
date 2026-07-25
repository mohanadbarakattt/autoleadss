import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FunnelRenderer from './FunnelRenderer'
import type { FunnelSpec } from '../types'

function makeSpec(over: Partial<FunnelSpec['page']> = {}): FunnelSpec {
  return {
    industry: 'services',
    language: 'en',
    businessName: 'Acme Co',
    page: {
      hero: {
        eyebrow: 'New',
        headline: 'Grow your business',
        subhead: 'We help you grow',
        ctaPrimary: 'Get started',
        ctaSecondary: 'Learn more',
        badges: ['Trusted', 'Fast'],
      },
      stats: [{ value: '100+', label: 'Clients' }],
      features: [{ title: 'Fast', body: 'Very fast', icon: 'zap' }],
      testimonials: [{ quote: 'Great service', name: 'Jane Doe', role: 'CEO' }],
      faq: [{ q: 'Is it free?', a: 'Yes' }],
      finalCta: { headline: 'Ready?', sub: 'Join now', cta: 'Join' },
      leadForm: { title: 'Get in touch', fields: ['Name', 'Phone', 'Message'], button: 'Send' },
      ...over,
    },
    ads: [],
    chatbot: { greeting: 'Hi', qualifyingQuestions: [], flow: [], bookingMessage: 'Booked' },
    social: [],
  }
}

/** The first two fields are `required`, so jsdom's native constraint validation
 * blocks form submission until they're filled — fill them before every submit. */
function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John Smith' } })
  fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '555-1234' } })
}

describe('FunnelRenderer lead form (C9)', () => {
  it('shows the thank-you panel when onLead resolves', async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    render(<FunnelRenderer spec={makeSpec()} onLead={onLead} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Sent ✅')).toBeInTheDocument()
  })

  it('does NOT show the thank-you and keeps the form when onLead rejects', async () => {
    const onLead = vi.fn().mockRejectedValue(new Error('network down'))
    render(<FunnelRenderer spec={makeSpec()} onLead={onLead} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't send your details")
    expect(screen.queryByText('Sent ✅')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('disables the submit button and shows the sending label while in flight, and ignores a second click', async () => {
    let resolveLead: () => void = () => {}
    const onLead = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLead = resolve
        })
    )
    render(<FunnelRenderer spec={makeSpec()} onLead={onLead} />)

    fillRequiredFields()
    const button = screen.getByRole('button', { name: 'Send' })
    fireEvent.click(button)

    const sendingButton = await screen.findByRole('button', { name: 'Sending…' })
    expect(sendingButton).toBeDisabled()

    fireEvent.click(sendingButton)
    expect(onLead).toHaveBeenCalledTimes(1)

    resolveLead()
    expect(await screen.findByText('Sent ✅')).toBeInTheDocument()
  })

  it('passes the typed name/phone/extra values to onLead', async () => {
    const user = userEvent.setup()
    const onLead = vi.fn().mockResolvedValue(undefined)
    render(<FunnelRenderer spec={makeSpec()} onLead={onLead} />)

    await user.type(screen.getByPlaceholderText('Name'), 'John Smith')
    await user.type(screen.getByPlaceholderText('Phone'), '555-1234')
    await user.type(screen.getByPlaceholderText('Message'), 'Interested in pricing')

    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await screen.findByText('Sent ✅')
    expect(onLead).toHaveBeenCalledWith({
      name: 'John Smith',
      phone: '555-1234',
      extra: 'Interested in pricing',
    })
  })
})

// Render-side half of the SEC1 stored-XSS fix — the write-side half lives in
// api/_lib/funnelSpec.ts (sanitizeFunnelSpec), tested in api/funnels/[id].test.ts
// and api/funnels/index.test.ts. This is the render check that protects a
// visitor from a payload that reached storage some other way (a direct API
// call, or data written before the write-side guard existed).
describe('FunnelRenderer thank-you CTA href (SEC1)', () => {
  it('a javascript: ctaHref never reaches a rendered <a href> — the CTA renders inert instead', async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    const spec = makeSpec({ thankYou: { headline: 'Thanks', body: 'Body', ctaLabel: 'Next step', ctaHref: 'javascript:alert(1)' } })
    render(<FunnelRenderer spec={spec} onLead={onLead} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText('Thanks')

    expect(screen.getByText('Next step')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Next step' })).not.toBeInTheDocument()
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull()
  })

  it('a data: ctaHref never reaches a rendered <a href>', async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    const spec = makeSpec({ thankYou: { headline: 'Thanks', body: 'Body', ctaHref: 'data:text/html,<script>alert(1)</script>' } })
    render(<FunnelRenderer spec={spec} onLead={onLead} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText('Thanks')

    expect(document.querySelector('a[href^="data:"]')).toBeNull()
  })

  it('a protocol-relative ctaHref never reaches a rendered <a href>', async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    const spec = makeSpec({ thankYou: { headline: 'Thanks', body: 'Body', ctaLabel: 'Next step', ctaHref: '//evil.com/payload' } })
    render(<FunnelRenderer spec={spec} onLead={onLead} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText('Thanks')

    expect(screen.getByText('Next step')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Next step' })).not.toBeInTheDocument()
    expect(document.querySelector('a[href^="//"]')).toBeNull()
  })

  it('a valid https ctaHref still renders and still links', async () => {
    const onLead = vi.fn().mockResolvedValue(undefined)
    const spec = makeSpec({ thankYou: { headline: 'Thanks', body: 'Body', ctaLabel: 'Book a call', ctaHref: 'https://example.com/book' } })
    render(<FunnelRenderer spec={spec} onLead={onLead} />)

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText('Thanks')

    const link = screen.getByRole('link', { name: 'Book a call' })
    expect(link).toHaveAttribute('href', 'https://example.com/book')
  })
})
