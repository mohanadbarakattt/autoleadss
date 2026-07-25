import { describe, expect, it } from 'vitest'
import { denseUtcDays, dayLabel, lastNDaysFromRollup } from './series'

describe('denseUtcDays', () => {
  it('zero-fills every day in the window when the rollup is empty/undefined', () => {
    const days = denseUtcDays(undefined, 5)
    expect(days).toHaveLength(5)
    expect(days.every((d) => d.count === 0)).toBe(true)
    expect(days.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.day))).toBe(true)
  })

  it("today's UTC day is always the last bucket", () => {
    const days = denseUtcDays(undefined, 3)
    const todayKey = new Date().toISOString().slice(0, 10)
    expect(days[days.length - 1].day).toBe(todayKey)
  })

  it('reads counts straight from the rollup by UTC day key', () => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const days = denseUtcDays({ [todayKey]: 7 }, 3)
    expect(days[days.length - 1].count).toBe(7)
    expect(days[0].count).toBe(0)
  })

  it('drops rollup entries outside the window', () => {
    const days = denseUtcDays({ '2000-01-01': 99 }, 3)
    expect(days.reduce((sum, d) => sum + d.count, 0)).toBe(0)
  })
})

describe('dayLabel', () => {
  it('formats a YYYY-MM-DD key as M/D, stripping leading zeros', () => {
    expect(dayLabel('2026-07-04')).toBe('7/4')
    expect(dayLabel('2026-12-31')).toBe('12/31')
  })
})

describe('lastNDaysFromRollup', () => {
  it('is denseUtcDays with a display label instead of the raw day key', () => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const rows = lastNDaysFromRollup({ [todayKey]: 4 }, 2)
    expect(rows[rows.length - 1]).toEqual({ label: dayLabel(todayKey), count: 4 })
  })
})
