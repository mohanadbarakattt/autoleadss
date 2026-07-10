import { useState } from 'react'
import { Building2, Plus, Trash2, Check, Users } from 'lucide-react'
import AppShell from '../components/AppShell'
import { useI18n } from '../i18n'
import { useAgency, useFunnels, saveAgencySettings, createSubAccount, deleteSubAccount, setActiveSubAccount } from '../store'
import { useEntitlements } from '../billing/UpgradeContext'

const ACCENTS = ['#FF5C2A', '#2563EB', '#7C3AED', '#059669', '#E11D48', '#0A0A0B']

export default function Agency() {
  return (
    <AppShell>
      <AgencyInner />
    </AppShell>
  )
}

function AgencyInner() {
  const { isRTL } = useI18n()
  const ent = useEntitlements()
  const agency = useAgency()
  const funnels = useFunnels()

  const [brand, setBrand] = useState(agency.settings?.brandName ?? '')
  const [accent, setAccent] = useState(agency.settings?.accent ?? '#FF5C2A')
  const [hideBadge, setHideBadge] = useState(agency.settings?.hideBadge ?? true)
  const [savedBrand, setSavedBrand] = useState(false)
  const [subName, setSubName] = useState('')
  const [subEmail, setSubEmail] = useState('')

  if (!ent.whiteLabel) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10"><Building2 size={24} className="text-accent" /></div>
        <h1 className="mt-5 font-display text-2xl font-bold">{isRTL ? 'وضع الوكالة (وايت ليبل)' : 'Agency mode (white-label)'}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-fg">{isRTL ? 'أعد بيع AutoLeadss باسمك مع حسابات فرعية لعملائك وهويتك الكاملة. متاح على باقة الوكالات.' : 'Resell AutoLeadss as your own — client sub-accounts and your full branding. Available on the Agency plan.'}</p>
        <a href="https://wa.me/201100054278" target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">{isRTL ? 'تواصل مع المبيعات' : 'Talk to sales'}</a>
      </div>
    )
  }

  function saveBrand() {
    saveAgencySettings({ brandName: brand.trim() || undefined, accent, hideBadge })
    setSavedBrand(true)
    setTimeout(() => setSavedBrand(false), 2000)
  }
  function addSub() {
    if (!subName.trim()) return
    createSubAccount(subName.trim(), subEmail.trim() || undefined)
    setSubName('')
    setSubEmail('')
  }
  const countFor = (id: string) => funnels.filter((f) => f.subAccountId === id).length
  const input = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent'

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10"><Building2 size={20} className="text-accent" /></span>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>{isRTL ? 'وضع الوكالة' : 'Agency mode'}</h1>
          <p className="text-xs text-muted-fg">{isRTL ? 'هويتك وحسابات عملائك.' : 'Your branding and client sub-accounts.'}</p>
        </div>
      </div>

      {/* branding */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="mb-4 font-display font-semibold">{isRTL ? 'الهوية (وايت ليبل)' : 'White-label branding'}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-fg">{isRTL ? 'اسم العلامة' : 'Brand name'}</span>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Your Agency" className={input} />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-fg">{isRTL ? 'اللون' : 'Accent'}</span>
            <div className="flex items-center gap-2.5 pt-1.5">
              {ACCENTS.map((a) => (
                <button key={a} onClick={() => setAccent(a)} aria-label={a} className={`h-8 w-8 rounded-full transition-transform ${accent === a ? 'scale-110' : ''}`} style={{ background: a, boxShadow: accent === a ? `0 0 0 2px #FAFAF7, 0 0 0 4px ${a}` : undefined }} />
              ))}
            </div>
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={hideBadge} onChange={(e) => setHideBadge(e.target.checked)} className="h-4 w-4 rounded border-border accent-accent" style={{ accentColor: accent }} />
          {isRTL ? 'إخفاء شارة "Made with AutoLeadss" من الصفحات المنشورة' : 'Hide the “Made with AutoLeadss” badge on published pages'}
        </label>
        <button onClick={saveBrand} className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
          {savedBrand ? <><Check size={15} /> {isRTL ? 'تم الحفظ' : 'Saved'}</> : isRTL ? 'حفظ الهوية' : 'Save branding'}
        </button>
      </div>

      {/* sub-accounts */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="mb-1 font-display font-semibold">{isRTL ? 'حسابات العملاء' : 'Client sub-accounts'}</p>
        <p className="mb-4 text-sm text-muted-fg">{isRTL ? 'افصل قمم كل عميل. القمم الجديدة تُسنَد للحساب النشط.' : 'Separate each client’s funnels. New funnels attach to the active account.'}</p>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder={isRTL ? 'اسم العميل' : 'Client name'} className={input} />
          <input value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder={isRTL ? 'البريد (اختياري)' : 'Email (optional)'} className={input} dir="ltr" />
          <button onClick={addSub} disabled={!subName.trim()} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"><Plus size={15} /> {isRTL ? 'أضف' : 'Add'}</button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <SubRow active={agency.activeSubAccountId === null} onSelect={() => setActiveSubAccount(null)} name={isRTL ? 'كل الحسابات' : 'All accounts'} count={funnels.length} isRTL={isRTL} allRow />
          {agency.subAccounts.map((s) => (
            <SubRow key={s.id} active={agency.activeSubAccountId === s.id} onSelect={() => setActiveSubAccount(s.id)} onDelete={() => deleteSubAccount(s.id)} name={s.name} email={s.contactEmail} count={countFor(s.id)} isRTL={isRTL} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SubRow({ active, onSelect, onDelete, name, email, count, isRTL, allRow }: { active: boolean; onSelect: () => void; onDelete?: () => void; name: string; email?: string; count: number; isRTL: boolean; allRow?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${active ? 'border-accent bg-accent/5' : 'border-border bg-muted/30'}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10"><Users size={16} className="text-accent" /></span>
      <button onClick={onSelect} className="flex-1 text-start">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-fg">{email ? `${email} · ` : ''}{count} {isRTL ? 'قمع' : count === 1 ? 'funnel' : 'funnels'}</p>
      </button>
      {active && <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-white">{isRTL ? 'نشط' : 'Active'}</span>}
      {!allRow && onDelete && <button onClick={onDelete} className="text-muted-fg hover:text-red-500"><Trash2 size={14} /></button>}
    </div>
  )
}
