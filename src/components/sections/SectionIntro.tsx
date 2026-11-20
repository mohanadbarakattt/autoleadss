export default function SectionIntro({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
      <div>
        <p className={`eyebrow ${dark ? 'text-[#fe8c58]' : 'text-accent'}`}>{eyebrow}</p>
        <h2 className={`mt-3 max-w-2xl font-display text-[clamp(2.1rem,5vw,4rem)] font-bold leading-[0.98] tracking-[-0.045em] ${dark ? 'text-white' : 'text-[#0A0A0B]'}`}>{title}</h2>
      </div>
      {body ? <p className={`max-w-xl text-base leading-relaxed lg:justify-self-end ${dark ? 'text-white/55' : 'text-muted-fg'}`}>{body}</p> : null}
    </div>
  )
}
