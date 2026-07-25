import { describe, expect, it } from 'vitest'
import { buildLeadsCsv } from './csv'

describe('buildLeadsCsv', () => {
  it('starts with a UTF-8 BOM', () => {
    const csv = buildLeadsCsv([{ name: 'Sara', phone: '+971500000001', source: 'page', status: 'new', createdAt: Date.parse('2026-01-01T00:00:00Z') }])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
  })

  it('preserves an Arabic name verbatim (round-trips through the row unescaped)', () => {
    const csv = buildLeadsCsv([{ name: 'محمد أحمد', phone: '+201001234567', source: 'whatsapp', status: 'qualified', createdAt: Date.parse('2026-01-01T00:00:00Z') }])
    const [, dataLine] = csv.slice(1).split('\n') // slice(1) drops the BOM before splitting rows
    expect(dataLine.split(',')[0]).toBe('محمد أحمد')
  })

  it('omits the Site column when no lead carries a funnelName', () => {
    const csv = buildLeadsCsv([{ name: 'Sara', phone: '1', source: 'page', status: 'new', createdAt: 0 }])
    expect(csv.slice(1).split('\n')[0]).toBe('Name,Phone,Email,Source,Status,Created At')
  })

  it('adds a Site column with the funnel name when present (cross-site export)', () => {
    const csv = buildLeadsCsv([{ name: 'Sara', phone: '1', source: 'page', status: 'new', createdAt: 0, funnelName: 'Marina Realty' }])
    const lines = csv.slice(1).split('\n')
    expect(lines[0]).toBe('Name,Phone,Email,Source,Status,Created At,Site')
    expect(lines[1].endsWith(',Marina Realty')).toBe(true)
  })

  it('quotes values containing commas', () => {
    const csv = buildLeadsCsv([{ name: 'Sara, Owner', phone: '1', source: 'page', status: 'new', createdAt: 0 }])
    expect(csv.split('\n')[1]).toContain('"Sara, Owner"')
  })
})
