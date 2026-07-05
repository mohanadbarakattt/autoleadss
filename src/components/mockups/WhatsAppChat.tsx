import { PhoneFrame } from './Frames'

type Bubble = { from: 'them' | 'us'; text: string; time: string }

const CONVO: Bubble[] = [
  { from: 'them', text: 'Hi, is the 4-bed villa in Arabian Ranches still available?', time: '10:42' },
  { from: 'us', text: 'Hi Ahmed! 👋 Yes — AED 4.2M, 4 bed, private pool & maid’s room. Would you like to view it?', time: '10:42' },
  { from: 'them', text: 'Yes please, this weekend if possible', time: '10:43' },
  { from: 'us', text: 'Saturday 4:00 PM works. Shall I lock it in? ✅', time: '10:43' },
  { from: 'them', text: 'Perfect 🙏', time: '10:43' },
]

export default function WhatsAppChat() {
  return (
    <PhoneFrame className="w-full max-w-[300px]">
      <div className="flex flex-col" style={{ height: 560 }}>
        {/* header */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-8" style={{ background: '#075E54' }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">PV</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-white">Palm Villas · AutoLeadss</p>
            <p className="text-[11px] text-white/70">online · replies instantly</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity="0.9"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.25 1Z" /></svg>
        </div>

        {/* messages */}
        <div className="flex-1 space-y-2 overflow-hidden px-3 py-4" style={{ background: '#E5DDD5' }}>
          <div className="mx-auto w-fit rounded-md bg-[#FCF4CB] px-3 py-1 text-[10px] text-black/50 shadow-sm">Today</div>
          {CONVO.map((b, i) => (
            <div key={i} className={`flex ${b.from === 'us' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-lg px-3 py-1.5 text-[12px] leading-snug shadow-sm ${
                  b.from === 'us' ? 'text-black' : 'bg-white text-black'
                }`}
                style={b.from === 'us' ? { background: '#DCF8C6' } : undefined}
              >
                {b.text}
                <span className="ml-2 inline-block align-bottom text-[9px] text-black/40">
                  {b.time}
                  {b.from === 'us' && <span className="ml-0.5 text-[#34B7F1]">✓✓</span>}
                </span>
              </div>
            </div>
          ))}
          {/* automation event */}
          <div className="mx-auto w-fit rounded-full bg-[#0A0A0B]/85 px-3 py-1 text-[10px] font-medium text-white shadow">
            ✅ Viewing booked · lead pushed to CRM
          </div>
        </div>

        {/* response badge */}
        <div className="flex items-center justify-center gap-2 bg-white py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-black/60">Answered in 12 seconds — no human touched it</span>
        </div>
      </div>
    </PhoneFrame>
  )
}
