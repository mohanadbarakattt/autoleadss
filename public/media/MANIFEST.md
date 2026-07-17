# Explainer video manifest

Tracks every `<VideoSlot>` placement on the marketing site. Each slot renders its
`placeholder` (an existing mockup or gradient panel) until the `.mp4` at the given
path actually exists in `public/media/`, so nothing breaks before these are produced.

Video doctrine for every prompt below: physical metaphors only — **no text, letters,
numbers, UI, screens, logos, captions, or watermarks** anywhere in frame. Brand
palette: near-black `#0A0A0B` background, warm orange accent `#FF5C2A` / `#FF7A4D`,
off-white `#FAFAF7` highlights. Every clip must be a seamless loop.

Already produced (not a placeholder): `public/media/hero.mp4` + `hero-poster.jpg`,
used directly in `src/components/sections/Hero.tsx` (amber orbs orbiting an orange
sphere — leads arriving on autopilot).

---

## 1. `/media/how-it-works.mp4`

- **Section**: Process ("How It Works"), `src/components/sections/Process.tsx` — wide banner above the 4-step grid.
- **Aspect / duration**: 21:9, ~10s loop.
- **Prompt**: A single warm orange thread of light winds through darkness, coiling into four glowing knots in sequence, each igniting brighter than the last before the thread continues forward and loops back to its start. Macro lens, shallow depth of field, slow continuous camera dolly following the thread left to right. Lighting: single warm orange rim light (#FF5C2A) against a near-black void (#0A0A0B), soft bloom, no lens flare. Palette: black background, orange-to-amber gradient light trail, faint warm haze. No text, letters, numbers, UI, screens, logos, captions, or watermarks — pure light and motion. Seamless loop, 10 seconds.

## 2. `/media/benefit-chatbot.mp4`

- **Section**: Services / benefits row 1 — "AI Chatbot", `src/components/sections/Services.tsx`.
- **Aspect / duration**: 4:5 portrait card, ~6s loop.
- **Prompt**: A drop of molten-orange light falls into perfectly still black water and the instant it touches the surface, an answering ripple of the same warm orange light rises back up to meet it in mid-air, defying gravity, then everything resets and repeats. Extreme macro, static camera, slow-motion capture at high frame rate. Lighting: single soft top-down warm light (#FF7A4D) reflecting on black liquid (#0A0A0B), gentle bloom on the ripple crest. Palette: black, orange, warm amber highlights. No text, numbers, UI, chat bubbles, screens, logos, captions, or watermarks — physical light and liquid only. Seamless loop, 6 seconds.

## 3. `/media/benefit-pages.mp4`

- **Section**: Services / benefits row 2 — "Landing Pages", `src/components/sections/Services.tsx`.
- **Aspect / duration**: 4:5 portrait card, ~7s loop.
- **Prompt**: A slim vertical panel of brushed dark material stands in darkness; it splits down an invisible seam and swings open smoothly and fast, revealing a warm orange glow behind it that spills forward, then the panel closes and the motion loops. Camera: slow push-in, centered, symmetrical framing. Lighting: warm orange glow (#FF5C2A) emerging from behind the panel against a near-black room (#0A0A0B), soft volumetric haze catching the light. Palette: charcoal-black panel, warm orange interior light, faint amber dust motes. No text, letters, numbers, UI, screens, logos, captions, or watermarks. Seamless loop, 7 seconds.

## 4. `/media/benefit-ads.mp4`

- **Section**: Services / benefits row 3 — "Google & Paid Ads", `src/components/sections/Services.tsx`.
- **Aspect / duration**: 4:5 portrait card, ~6s loop.
- **Prompt**: A row of small dim gray-white orbs floats suspended in darkness in a horizontal line; from the back, one orb glows warm orange, brightens, and glides smoothly to the very front of the line, overtaking the others, then the sequence resets and repeats. Camera: static wide shot, slight parallax on the orbs. Lighting: single warm orange key light (#FF5C2A) on the moving orb, the rest lit in cool dim white against a near-black backdrop (#0A0A0B). Palette: black background, orange highlight orb, muted gray-white supporting orbs. No text, numbers, UI, screens, logos, captions, or watermarks. Seamless loop, 6 seconds.

## 5. `/media/benefit-social.mp4`

- **Section**: Services / benefits row 4 — "Social Media", `src/components/sections/Services.tsx`.
- **Aspect / duration**: 4:5 portrait card, ~8s loop.
- **Prompt**: Several small warm-orange spheres orbit continuously and smoothly around a larger matte dark-charcoal sphere at different orbital speeds and depths, never colliding, catching soft rim light as they pass in front of and behind the central sphere. Camera: slow orbit around the whole scene, shallow depth of field. Lighting: soft warm orange rim lighting (#FF7A4D) on the small spheres, a subtle cool ambient fill on the central sphere, near-black void background (#0A0A0B). Palette: charcoal, black, warm orange accents. No text, letters, numbers, UI, screens, logos, captions, or watermarks. Seamless loop, 8 seconds.
