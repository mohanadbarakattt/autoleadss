/** Small field primitives shared by every Editor.tsx panel (capture-mode
 * panels defined inline in Editor.tsx, sell-mode panels in this directory) —
 * pulled out on their own so neither side has to import from the other. */

export function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-suite-line bg-suite-panel p-5">
      <p className="mb-3 font-luxe text-sm font-semibold text-suite-text">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export function EditField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-medium uppercase text-suite-muted">{label}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-lg border bg-suite-panel2 px-3 py-2 text-sm text-suite-text outline-none focus:border-suite-gold ${error ? 'border-red-400/70' : 'border-suite-line'}`} />
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </label>
  )
}

export function EditArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-medium uppercase text-suite-muted">{label}</span>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-suite-line bg-suite-panel2 px-3 py-2 text-sm text-suite-text outline-none focus:border-suite-gold" />
    </label>
  )
}
