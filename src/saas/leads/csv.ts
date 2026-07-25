import type { Lead } from '../types'

/** A row this CSV writer can print — a plain `Lead`, or one carrying a
 * `funnelName` (the cross-site /app/leads export) which adds a "Site" column. */
export type CsvLead = Pick<Lead, 'name' | 'phone' | 'email' | 'source' | 'status' | 'createdAt'> & { funnelName?: string }

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * Builds the CSV text for a leads export — leading BOM so Excel detects UTF-8
 * and doesn't mojibake Arabic names (defect class CSV1). Pulled out of
 * `downloadLeadsCsv` below purely so it's unit-testable without a DOM/Blob.
 */
export function buildLeadsCsv(leads: CsvLead[]): string {
  const withSite = leads.some((l) => l.funnelName)
  const header = ['Name', 'Phone', 'Email', 'Source', 'Status', 'Created At', ...(withSite ? ['Site'] : [])]
  const rows = leads.map((l) => [
    l.name,
    l.phone,
    l.email ?? '',
    l.source,
    l.status,
    new Date(l.createdAt).toISOString(),
    ...(withSite ? [l.funnelName ?? ''] : []),
  ])
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
  return '\ufeff' + csv
}

/**
 * Shared leads CSV export — used by both Editor.tsx's per-funnel leads tab and
 * the cross-site /app/leads CRM, so the BOM fix (CSV1) lives in exactly one
 * place. Do NOT reimplement this elsewhere.
 */
export function downloadLeadsCsv(filenameBase: string, leads: CsvLead[]) {
  const blob = new Blob([buildLeadsCsv(leads)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filenameBase.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'leads'}-leads.csv`
  a.click()
  URL.revokeObjectURL(url)
}
