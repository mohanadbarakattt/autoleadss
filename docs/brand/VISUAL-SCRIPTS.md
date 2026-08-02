# AutoLeadss — visual scripts & engineered prompts

**Date:** 2026-08-02 · **For:** Higgsfield generation to repolish the marketing site.

Written **before** any prompt, because a prompt without a script produces
pretty images that sell nothing. Each script states the job the image has to do
on the page, then the prompt is engineered from it.

---

## Ground truth these are built on

**The offer** (`src/agency/offer.ts`) — from **$3,500/month**, including **$500 of
ad spend**. Four deliverables, every month:

| Deliverable | The real thing being sold |
|---|---|
| 4 social posts a day | Volume + consistency the owner can't sustain alone |
| A new ad campaign weekly | Someone actively testing, not a boosted post |
| Website — built, hosted, current | Not a one-off project that rots |
| AI chatbot, 24/7 | Enquiries answered at 1am |

**The brand palette** (`tailwind.config.js`, non-negotiable — these are the site's
real tokens, not a mood):

- `#0A0A0B` near-black (hero, dark sections)
- `#FAFAF7` warm off-white (light sections)
- `#FF5C2A` accent orange · `#FF8A5C` secondary
- `#F1EFE9` muted · `#E2DED4` borders

**Market:** Gulf + Egypt. Dubai · Abu Dhabi · Cairo · Alexandria.

---

## The honesty constraint on every image

The site's copy was audited and stripped of invented results; a guard test
(`src/i18n/claims.test.ts`) now fails CI if a measured-outcome claim reappears.
**Images can smuggle the same lie past that guard.** So:

- **No fake dashboards with numbers.** A chart reading "+312%" is a fabricated
  result whether it's in text or pixels.
- **No fake social proof** — invented follower counts, review stars, "as seen in".
- **No lookalike logos** of real brands or platforms.
- **No invented UI text.** Generators produce garbled pseudo-text (the attached
  Lash Cartel arcade frame reads "for beaty vindtthout commmnse" and a mangled
  URL). Anything with legible-looking words gets rejected or regenerated.
- Abstract, atmospheric, material — not screenshots of results that don't exist.

Where a mockup is genuinely useful, it is labelled illustrative (the hero panel
already is).

---

## Script 01 — Hero atmosphere

**Job:** Make a Gulf business owner feel this is a premium operator, in the first
two seconds, without claiming anything.
**Placement:** Behind/beside the hero headline "Stop chasing customers."
**Must not:** show a dashboard, numbers, or a person's face (the headline carries
the message; a face competes with it).

**Prompt:**
> Abstract premium brand atmosphere for a growth agency. Deep near-black
> background #0A0A0B with a single warm orange #FF5C2A light bleeding from the
> upper right, falling off into darkness. Fine geometric grid, barely visible,
> like architectural drafting film. Soft volumetric haze. Editorial, restrained,
> expensive. No text, no logos, no user interface, no charts, no people.
> Cinematic wide composition with generous empty space on the left for
> typography.

---

## Script 02 — Content engine (4 posts a day)

**Job:** Convey *volume and rhythm* — the thing an owner cannot personally keep up.
**Placement:** Services / the social content card.
**Must not:** show invented posts, captions, follower counts, or platform UI.

**Prompt:**
> An orderly grid of blank warm off-white #FAFAF7 cards floating in soft
> three-quarter perspective on a near-black #0A0A0B field, receding into depth
> like a content calendar extending beyond frame. Thin orange #FF5C2A edge light
> on the nearest few cards. Matte paper texture, soft studio shadows. Sense of
> steady cadence and abundance. No text, no photographs on the cards, no icons,
> no interface, no logos.

---

## Script 03 — Ads, actively managed

**Job:** Convey deliberate testing and iteration — not "boost post".
**Placement:** Services / ads card.
**Must not:** show metrics, graphs, currency, or platform branding.

**Prompt:**
> Several matte cards of slightly different sizes arranged like variants under
> test on a dark #0A0A0B surface, one card lifted and lit with warm orange
> #FF5C2A rim light while the others rest in shadow. Overhead studio lighting,
> shallow depth of field, precise and clinical but warm. Suggests deliberate
> selection. No text, no charts, no numbers, no interface, no logos.

---

## Script 04 — The chatbot that answers at 1am

**Job:** Convey after-hours responsiveness — the emotional beat is *someone is
awake*.
**Placement:** Services / chatbot card.
**Must not:** render chat bubbles with words (garbled text), or WhatsApp branding.

**Prompt:**
> A single warm orange #FF5C2A glow source alone in a vast dark #0A0A0B space,
> like one lit window in a sleeping city, reflected softly on a smooth dark
> surface below. Deep night atmosphere, minimal, calm, patient. Cinematic
> stillness. No text, no chat bubbles, no interface, no logos, no people.

---

## Script 05 — Website, built and kept current

**Job:** Convey craft and permanence — a made thing, not a template.
**Placement:** Services / website card.
**Must not:** show a browser window or a fake site (invents UI text).

**Prompt:**
> Layered translucent panels of warm off-white #FAFAF7 stacked in precise
> parallel planes, edge-lit in orange #FF5C2A, floating against near-black
> #0A0A0B. Architectural, structural, deliberately constructed. Soft directional
> studio light, fine material grain. Suggests something built with care in
> layers. No text, no browser chrome, no interface, no logos.

---

## Script 06 — Open Graph / share card

**Job:** Survive being seen at thumbnail size in a WhatsApp or LinkedIn preview.
**Placement:** `public/og-image.png` (1200×630).
**Must not:** contain generated text — the wordmark is composited in afterwards
in the real typeface, never generated.

**Prompt:**
> Minimal premium brand card. Near-black #0A0A0B field with a warm orange
> #FF5C2A gradient sweeping from the lower left corner, dissolving into darkness.
> Subtle fine grid texture. Large clear empty centre area reserved for a logo to
> be placed later. Extremely simple, high contrast, readable at small size. No
> text, no logos, no interface.

---

## Model choice & cost discipline

Account at time of writing: **785 credits, "max" plan, no unlimited window active**
(`unlim.available: false`) — so these cost credits and are preflighted with
`get_cost` before submitting.

- **`recraft_v4_1`** (`model_type: utility`, `colors` pinned to the brand hexes) —
  the palette parameter is why it wins here: it constrains output to the real
  tokens instead of hoping the prompt lands the colour.
- **`z_image`** — fast/budget, for cheap exploration before committing.
- Avoid character/Soul models entirely: no people means no likeness questions.

## Acceptance — reject and regenerate if any of these

1. Any legible or pseudo-legible text anywhere in the frame.
2. Any number, chart, gauge, or percentage.
3. Any logo or platform mark.
4. Colours drifting off the brand hexes.
5. A face (out of scope by design).
