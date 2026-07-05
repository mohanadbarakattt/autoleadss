import { PhoneFrame } from './Frames'
import social from '../../assets/social-content.jpg'
import leads from '../../assets/leads-flowing.jpg'
import ads from '../../assets/ads-management.jpg'
import chatbot from '../../assets/chatbot-action.jpg'

const TILES = [social, leads, ads, chatbot, social, leads, ads, chatbot, social]

export default function SocialGrid() {
  return (
    <PhoneFrame className="w-full max-w-[300px]">
      <div className="bg-white" style={{ height: 560 }}>
        {/* profile header */}
        <div className="px-4 pb-3 pt-9">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full p-[2px]" style={{ background: 'conic-gradient(from 210deg, #FF5C2A, #FF8A5C, #FEBC2E, #FF5C2A)' }}>
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-[#0A0A0B]">ن</span>
            </span>
            <div className="flex flex-1 justify-around text-center">
              {[['128', 'posts'], ['24.6k', 'followers'], ['312', 'following']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-[13px] font-bold text-[#0A0A0B]">{n}</p>
                  <p className="text-[10px] text-black/50">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[12px] font-semibold text-[#0A0A0B]">Nour Interiors · نور</p>
            <p className="text-[11px] text-black/55">Handmade furniture · Dubai &amp; Cairo 🇦🇪🇪🇬</p>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="flex-1 rounded-md bg-accent py-1.5 text-center text-[10px] font-medium text-white">Follow</span>
            <span className="flex-1 rounded-md bg-[#F1EFE9] py-1.5 text-center text-[10px] font-medium text-[#0A0A0B]">Message</span>
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {TILES.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden">
              <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
              {i === 1 && (
                <span className="absolute right-1 top-1 text-white drop-shadow">▶</span>
              )}
              {i % 4 === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[8px] text-white">❤ {2 + i}.{i}k</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}
