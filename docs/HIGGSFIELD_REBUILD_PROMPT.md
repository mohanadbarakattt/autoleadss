# AutoLeadss — Higgsfield Visual Rebuild Prompt Pack

Higgsfield generates **cinematic video + photorealistic images** (Soul for stills, its
camera/motion models for video), not the site itself. So this pack uses it to produce the
**premium visual layer** for an AutoLeadss rebuild — hero film, ambient backgrounds, device
scenes, and a MENA cinematic — all brand-locked. Generate each asset, upscale, download, then
drop them into the sections mapped at the bottom.

Brand lock (keep constant across every generation):
- Palette: molten orange **#FF5C2A** as the only accent, near-black **#0A0A0B**, warm cream **#FAFAF7**.
- Mood: premium B2B SaaS × Gulf luxury. Cinematic, restrained, expensive. Dubai/Abu Dhabi/Cairo energy.
- No literal logos or readable UI text baked into images (added in code). No stocky clichés.

---

## 0 · Master style suffix (append to every prompt)

```
cinematic, ultra-premium, editorial commercial aesthetic, shot on ARRI Alexa, 35mm anamorphic,
shallow depth of field, volumetric light, soft rim light, matte near-black #0A0A0B environment
with a single molten-orange #FF5C2A accent glow, warm cream highlights, subtle film grain,
high dynamic range, 8k, hyper-detailed, elegant negative space, no text, no logos, no watermark
```

## Negative prompt (paste into the negative field for every asset)

```
text, letters, words, logos, watermark, ui mockup text, cluttered, busy, low-res, blurry,
oversaturated, rainbow colors, cheesy stock photo, cartoon, distorted hands, extra fingers,
plastic skin, harsh flash, generic corporate handshake, clip-art
```

---

## 1 · HERO FILM — the centerpiece (Higgsfield video · 16:9 · 5–8s loop)

```
Slow cinematic push-in through a dark, softly-lit modern space; abstract glowing orange data
streams and light particles converge and funnel downward into a single bright point of light,
symbolizing leads flowing into a sales machine; floating translucent glass panels catch a warm
orange rim light; volumetric haze, deep blacks, one molten-orange accent; camera glides on a
smooth dolly, gentle parallax; luxurious, weightless, high-end tech-brand feel.
```
Motion: **slow dolly-in + subtle parallax**, loopable, no hard cuts. Export 1920×1080, then a
9:16 variant for mobile hero.

## 2 · HERO POSTER STILL (Higgsfield Soul · 16:9) — video fallback / OG image

```
A single glowing orange funnel of light and particles descending into a bright focal point,
set in an infinite matte-black studio void with warm cream floor reflection; floating frosted-
glass shards; one accent color; vast negative space on the left for a headline.
```

## 3 · AMBIENT SECTION BACKGROUNDS (Higgsfield Soul · 16:9, generate 3 variants)

```
Extreme-minimal abstract background: soft orange volumetric glow bleeding into deep near-black,
faint geometric grid dissolving into darkness, gentle gradient mesh, lots of empty space,
barely-there film grain; premium, calm, unobtrusive — designed to sit behind white text.
```
Use as darkened section backdrops (Services / Results / CTA). Keep them **quiet** (they sit under copy).

## 4 · "WHERE WE WORK" — MENA CINEMATIC (Higgsfield video · 16:9 · 5s)

```
Cinematic aerial magic-hour drift over a stylized skyline blending Dubai's Marina towers,
Abu Dhabi's coast and Cairo's Nile bridges into one continuous dreamlike city; warm dusk light,
orange sun glow reflecting off glass towers, thin glowing orange connection lines linking the
cities like a network; premium travel-commercial grade, subtle, elegant, no text.
```

## 5 · DEVICE / PRODUCT SCENES (Higgsfield Soul · 4:5 and 9:16)

**5a — Dashboard on a floating device**
```
A sleek frameless tablet floating in a dark premium studio, screen glowing warm orange (screen
content left blank/abstract for a UI overlay in code), soft reflections, volumetric orange rim
light, luxury product-shot lighting, deep shadows, cream accent bounce.
```
**5b — WhatsApp-in-hand (the WhatsApp-first story)**
```
Close-up of a hand holding a modern smartphone in a warm dark cafe in Dubai, phone screen a soft
blank glow (chat UI added in code), shallow depth of field, bokeh city lights, intimate premium
lifestyle, orange accent from the screen on the fingertips; authentic, not stocky.
```

## 6 · TRUST / RESULTS LIFESTYLE (Higgsfield Soul · 3:2, generate 3)

```
Confident Middle-Eastern business owner (varied: a woman in modern abaya-inspired attire; a man
in smart-casual) in a beautifully lit modern office or boutique in the Gulf/Cairo, natural candid
moment, warm cinematic grade, subtle orange practical light in background, authentic and aspirational,
documentary-commercial feel.
```
Use in the Work / testimonials section for credibility (as ambient portraits, not fake screenshots).

## 7 · SOCIAL / AD CREATIVES (Higgsfield Soul · 1:1 and 9:16, 4–6 variants)

```
Bold minimalist ad-creative background: dramatic orange light sweep across matte black, dynamic
diagonal energy, generous empty space for a punchy headline and CTA; high-contrast, thumb-stopping,
premium DTC-ad aesthetic.
```

---

## Technical checklist
- Aspect ratios: hero **16:9** (+ **9:16** mobile), device **4:5 / 9:16**, social **1:1 / 9:16**, OG **1200×630**.
- Generate **3–4 variants** per asset, pick, then **upscale** in Higgsfield before download.
- Video: keep motion **slow and loopable**, 24fps, export high-bitrate MP4 + a WebM; also grab a poster frame.
- Consistency: reuse the master style suffix verbatim; keep the same seed family where the tool allows.

## Assembly map (where each asset goes in the rebuild)
| Asset | Section / usage |
|---|---|
| 1 Hero film (+ 2 poster) | `Hero` background `<video autoplay muted loop playsinline poster=…>` |
| 3 Ambient backgrounds | darkened backdrops for `Services`, `Results`, `CTABanner` |
| 4 MENA cinematic | `Regions` / "where we work" section |
| 5a / 5b device scenes | `Services` demos + hero device — real UI layered on top in code |
| 6 lifestyle portraits | `Work` / testimonials trust visuals |
| 7 ad creatives | social proof strip, OG/share images, and the SaaS funnel templates |

> Keep all real UI (dashboards, chat, headlines) as **coded overlays** on top of these visuals —
> never bake text/UI into the generated media. That keeps it crisp, editable, bilingual (AR/EN),
> and on-brand.
```
