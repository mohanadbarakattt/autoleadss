import { BrowserFrame } from './Frames'
import landingImg from '../../assets/landing-pages.jpg'

export default function LandingPreview() {
  return (
    <BrowserFrame url="palmvillas.ae" className="w-full">
      <div className="bg-[#0A0A0B]">
        {/* mock nav */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-[13px] font-bold text-white">Palm<span className="text-accent">Villas</span></span>
          <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-medium text-white">Book a viewing</span>
        </div>

        {/* hero */}
        <div className="relative h-[240px] overflow-hidden">
          <img src={landingImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.55) 55%, rgba(10,10,11,0.2) 100%)' }} />
          <div className="relative flex h-full max-w-[62%] flex-col justify-center gap-2 pl-5">
            <span className="w-fit rounded-full border border-white/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/70">Arabian Ranches III</span>
            <h3 className="font-display text-[22px] font-bold leading-tight text-white">Own a 4-bed villa with a private pool</h3>
            <p className="text-[11px] text-white/70">Handover 2026 · from AED 4.2M · 0% commission</p>
            <div className="mt-1 flex gap-2">
              <span className="rounded-md bg-accent px-3 py-1.5 text-[10px] font-medium text-white">Get the brochure</span>
              <span className="rounded-md border border-white/25 px-3 py-1.5 text-[10px] font-medium text-white/80">Watch tour</span>
            </div>
          </div>
        </div>

        {/* lead form + trust */}
        <div className="grid grid-cols-[1fr_150px] gap-4 bg-white p-5">
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[12px] font-semibold text-[#0A0A0B]">Trusted by 1,200+ buyers across the UAE</p>
            <div className="flex flex-wrap gap-1.5">
              {['RERA verified', 'Payment plan', '4.9 ★ Google'].map(t => (
                <span key={t} className="rounded-full bg-[#F1EFE9] px-2.5 py-1 text-[9px] font-medium text-black/60">{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-[#FAFAF7] p-3">
            <p className="mb-2 text-[10px] font-semibold text-[#0A0A0B]">Book a private viewing</p>
            <div className="mb-1.5 h-6 rounded-md border border-black/10 bg-white" />
            <div className="mb-2 h-6 rounded-md border border-black/10 bg-white" />
            <div className="rounded-md bg-accent py-1.5 text-center text-[10px] font-medium text-white">Request callback</div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}
