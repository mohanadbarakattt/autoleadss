import { describe, expect, it } from 'vitest'
import { SERVICE_WINDOW_MS, hasOpenServiceWindow, opensNewConversation, type Sql } from './whatsapp'

/** Fake sql that returns a row when the query's cutoff predates `lastInbound`. */
function sqlWithLastInbound(lastInbound: Date | null): Sql {
  return (async (_s: TemplateStringsArray, ...values: unknown[]) => {
    if (!lastInbound) return []
    const cutoff = new Date(String(values[2]))
    return lastInbound > cutoff ? [{ ok: 1 }] : []
  }) as unknown as Sql
}

describe('service window', () => {
  const now = new Date('2026-07-21T12:00:00Z')

  it('is open when the customer messaged within 24h', async () => {
    const sql = sqlWithLastInbound(new Date(now.getTime() - 60_000))
    expect(await hasOpenServiceWindow(sql, 'c1', '+201', now)).toBe(true)
  })

  it('is closed once 24h have passed', async () => {
    const sql = sqlWithLastInbound(new Date(now.getTime() - SERVICE_WINDOW_MS - 1000))
    expect(await hasOpenServiceWindow(sql, 'c1', '+201', now)).toBe(false)
  })

  it('is closed when the customer has never messaged', async () => {
    expect(await hasOpenServiceWindow(sqlWithLastInbound(null), 'c1', '+201', now)).toBe(false)
  })

  it('only opens a NEW conversation when no window is live — this is the billing rule', async () => {
    // Metering per MESSAGE would charge a customer several times for one
    // exchange. Meta bills per conversation.
    const open = sqlWithLastInbound(new Date(now.getTime() - 60_000))
    const stale = sqlWithLastInbound(new Date(now.getTime() - SERVICE_WINDOW_MS - 1))
    expect(await opensNewConversation(open, 'c1', '+201', now)).toBe(false)
    expect(await opensNewConversation(stale, 'c1', '+201', now)).toBe(true)
  })
})
