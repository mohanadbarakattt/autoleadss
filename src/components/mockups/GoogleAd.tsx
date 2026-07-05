import { BrowserFrame } from './Frames'

export default function GoogleAd() {
  return (
    <BrowserFrame url="google.com/search?q=villas+for+sale+dubai" className="w-full">
      <div className="bg-white px-5 py-4">
        {/* search bar */}
        <div className="mb-4 flex items-center gap-2">
          <span className="font-display text-lg font-bold">
            <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span>
          </span>
          <div className="flex flex-1 items-center rounded-full border border-black/15 px-3 py-1.5 text-[11px] text-black/70">
            villas for sale dubai
            <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#4285F4" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        {/* sponsored client result */}
        <div className="mb-4 rounded-lg bg-[#FAFAF7] p-3">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-[10px] font-bold text-black/80">Sponsored</span>
            <span className="text-[10px] text-[#0A0A0B]/50">palmvillas.ae</span>
          </div>
          <p className="text-[15px] leading-tight text-[#1a0dab]">Palm Jumeirah &amp; Ranches Villas — Private Viewings This Week</p>
          <p className="mt-0.5 text-[11px] leading-snug text-black/60">
            4–6 bed luxury villas from AED 4.2M. Flexible payment plans, 0% commission. Book a viewing in 60 seconds.
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#0A0A0B]/70">
            <span className="text-[#FBBC05]">★★★★★</span> 4.9 · 380 reviews
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {['Arabian Ranches III', 'Palm Jumeirah', 'Payment plans', 'Book a viewing →'].map(t => (
              <span key={t} className="text-[10px] text-[#1a0dab]">{t}</span>
            ))}
          </div>
        </div>

        {/* faded organic results */}
        {[74, 60].map((w, i) => (
          <div key={i} className="mb-3 opacity-45">
            <p className="text-[11px] text-black/50">competitor{i + 1}.com</p>
            <div className="mt-0.5 h-3 rounded bg-[#1a0dab]/30" style={{ width: `${w}%` }} />
            <div className="mt-1 h-2 rounded bg-black/10" style={{ width: '90%' }} />
            <div className="mt-1 h-2 rounded bg-black/10" style={{ width: '70%' }} />
          </div>
        ))}

        <div className="rounded-md bg-accent/10 py-1.5 text-center text-[10px] font-medium text-accent">
          You show up first — before every competitor
        </div>
      </div>
    </BrowserFrame>
  )
}
