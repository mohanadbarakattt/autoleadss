import { useEffect, useState } from 'react'
import { BarChart3, Check, QrCode, ScanLine, Users } from 'lucide-react'
import { useLocale } from '../i18n/LocaleProvider'

type View = 'pass' | 'scan' | 'admin'

const QR_CELLS = new Set([
  0, 1, 2, 6, 7, 8, 9, 11, 15, 17, 18, 19, 20, 24, 25, 26, 30, 32, 34, 36,
  38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 70, 72, 73, 74,
  78, 79, 80,
])

function DecorativeQr({ onActivate, unlocked }: { onActivate: () => void; unlocked: boolean }) {
  return (
    <button type="button" onClick={onActivate} aria-label="Membership QR pass" title="A few taps may reveal something" className={`grid h-28 w-28 grid-cols-9 gap-[2px] rounded-xl bg-white p-3 shadow-xl transition-transform active:scale-95 ${unlocked ? 'ring-4 ring-[#ff5c2a]/35' : ''}`}>
      {Array.from({ length: 81 }, (_, index) => <span aria-hidden key={index} className={QR_CELLS.has(index) ? 'rounded-[1px] bg-[#111214]' : 'rounded-[1px] bg-transparent'} />)}
    </button>
  )
}

export default function MembershipStage() {
  const { isRTL } = useLocale()
  const [view, setView] = useState<View>('pass')
  const [qrTaps, setQrTaps] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const labels = isRTL
    ? { pass: 'بطاقة العميل', scan: 'المسح', admin: 'لوحة التحكم', live: 'ديمو مباشر', remaining: 'زيارات متبقية', renews: 'التجديد ٢٨ أكتوبر', verified: 'اشتراك صالح', redeem: 'خصم زيارة', members: 'مشترك نشط', revenue: 'إيراد شهري', redemptions: 'استخدام اليوم' }
    : { pass: 'Member pass', scan: 'Scan', admin: 'Dashboard', live: 'Live product demo', remaining: 'visits remaining', renews: 'Renews 28 Oct', verified: 'Membership verified', redeem: 'Redeem one visit', members: 'Active members', revenue: 'Monthly revenue', redemptions: 'Redemptions today' }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm' && !event.metaKey && !event.ctrlKey && !event.altKey) setUnlocked(value => !value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const activateQr = () => {
    const next = qrTaps + 1
    setQrTaps(next)
    if (next >= 3) setUnlocked(true)
  }

  const tabs: Array<{ id: View; label: string; icon: typeof QrCode }> = [
    { id: 'pass', label: labels.pass, icon: QrCode },
    { id: 'scan', label: labels.scan, icon: ScanLine },
    { id: 'admin', label: labels.admin, icon: BarChart3 },
  ]

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-3 rotate-1 rounded-[2rem] bg-white/[0.04]" />
      <div className="relative overflow-hidden rounded-[1.65rem] border border-white/12 bg-[#151618] shadow-[0_34px_90px_-34px_rgba(0,0,0,0.95)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{labels.live}</p>
        </div>

        <div className="grid grid-cols-3 border-b border-white/10 bg-black/20 p-1.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-medium transition-colors ${view === id ? 'bg-white text-[#111214]' : 'text-white/50 hover:text-white'}`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="min-h-[370px] p-4 sm:p-5">
          {view === 'pass' ? (
            <div className="flex min-h-[330px] flex-col justify-between overflow-hidden rounded-2xl bg-[#F0E8D8] p-5 text-[#171714]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6f6658]">Service business · Demo</p>
                  <p className="mt-3 font-display text-2xl font-bold">Regular plan</p>
                  <p className="mt-1 text-sm text-[#6f6658]">Member 0142</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#18372b]">{unlocked ? (isRTL ? 'عضو مؤسس ٠٠٠١' : 'Founder 0001') : 'Active'}</span>
              </div>
              <div className="my-5 flex items-center justify-between gap-5">
                <DecorativeQr onActivate={activateQr} unlocked={unlocked} />
                <div className="text-end">
                  <p className="font-serif text-6xl leading-none">3</p>
                  <p className="mt-2 max-w-[110px] text-xs leading-relaxed text-[#6f6658]">{labels.remaining}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-black/10 pt-4 text-xs text-[#6f6658]">
                <span>{labels.renews}</span>
                <span>{unlocked ? (isRTL ? 'اضغط M للخروج' : 'Press M to leave') : 'EGP 850 / month'}</span>
              </div>
            </div>
          ) : null}

          {view === 'scan' ? (
            <div className="flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0D0E10] p-6 text-center">
              <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-accent/50 bg-white/[0.04]">
                <QrCode size={72} className="text-white/75" strokeWidth={1.4} />
                <span className="scan-line absolute inset-x-3 top-5 h-px bg-accent shadow-[0_0_16px_3px_rgba(255,92,42,0.7)]" />
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#69D69A]"><Check size={17} /> {labels.verified}</div>
              <p className="mt-2 text-xs text-white/45">Regular plan · 3 / 4</p>
              <button type="button" className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white">{labels.redeem}</button>
            </div>
          ) : null}

          {view === 'admin' ? (
            <div className="min-h-[330px] rounded-2xl bg-[#F7F5F0] p-4 text-[#151515]">
              <div className="flex items-center justify-between">
                <div><p className="font-mono text-[10px] uppercase tracking-wider text-[#777169]">Demo business</p><p className="mt-1 font-display text-xl font-bold">Membership overview</p></div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18372b] text-xs font-bold text-white">AB</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-black/8 bg-white p-4"><Users size={17} className="text-accent" /><p className="mt-5 font-serif text-3xl">84</p><p className="mt-1 text-[11px] text-[#777169]">{labels.members}</p></div>
                <div className="rounded-xl border border-black/8 bg-[#18372b] p-4 text-white"><BarChart3 size={17} className="text-[#71D39A]" /><p className="mt-5 font-serif text-3xl">71.4k</p><p className="mt-1 text-[11px] text-white/55">{labels.revenue}</p></div>
              </div>
              <div className="mt-3 rounded-xl border border-black/8 bg-white p-4">
                <div className="flex items-center justify-between text-xs"><span className="font-semibold">{labels.redemptions}</span><span className="font-mono text-accent">18</span></div>
                <div className="mt-4 flex h-20 items-end gap-2">
                  {[24, 42, 34, 58, 48, 76, 64, 90, 72, 86].map((height, index) => <span key={index} className="flex-1 rounded-t bg-[#18372b]" style={{ height: `${height}%`, opacity: 0.42 + index * 0.055 }} />)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
