# Client visual scripts & engineered prompts

**Date:** 2026-08-02 · **For:** website rebuilds for Felicity, Sereen Care, Kemetra.

Written **before** any prompt, same discipline as `docs/brand/VISUAL-SCRIPTS.md`.
A prompt without a script produces pretty images that sell nothing.

Higgsfield balance at time of writing: **737.72 credits**, plan `max`,
no unlimited window active — so every generation costs and the set below is
deliberately small. Hero motion is built in **code (CSS/SVG)**, not generated
video: crisper, responsive, instant to load, and zero credits.

---

## The honesty constraint — read before generating

Same rule that governs autoleadss.com's own copy (`src/i18n/claims.test.ts`):
**an image can smuggle a lie past a copy guard.** Three hard limits here, and the
first one is not a style preference — it is a legal and ethical line.

### 1. No generated depictions of real, purchasable property

Felicity sells **DAMAC Islands 2, Altan, Albero and Silva** — real buildings, by
Emaar and DAMAC, that people buy off-plan for AED 1M+.

A generated "render" of any of them would be a fabricated depiction of a real
product, shown to buyers making a seven-figure decision, in a RERA-regulated
market. **Never generate these.** The genuine renders exist and Muhannad has
access to them as an official partner of 20+ developers — that access is his
entire business model.

So: generated imagery for Felicity is **abstract and atmospheric only**, and every
project card is built with a clearly-marked slot for the developer's real render.

### 2. No generated before/after cleaning photos

Sereen Care's whole positioning is *"With Proof, Not Promises."* Generating fake
proof would invert the one thing they stand for. Their current site already uses
generic stock cleaning photography; replacing stock with *fabricated* stock is a
step backwards.

The rebuild ships a real before/after gallery **component** with placeholders and
a note to the owner: these must be their own jobs. That gap is a deliverable to
fill, not a hole to paper over.

### 3. The usual set

- No fake dashboards, charts, percentages or counters.
- No invented social proof — follower counts, review stars, "as seen in".
- No lookalike logos of real brands, developers or platforms.
- No legible or pseudo-legible generated text. Generators produce garbage
  ("for beaty vindtthout commmnse" on the old Lash Cartel frame). Any frame with
  word-shaped marks is rejected and regenerated.
- No faces on generated assets — Kemetra's sisters and Sereen's crew must be
  photographed, not invented.

---

## FELICITY PROPERTIES

**Palette:** deep navy `#0B1220` · warm sand `#C9A227` · off-white `#F7F5F1`
**Feel:** institutional, calm, expensive. An advisor, not a hype account.
**Site has zero photography today** — logo and Mapbox tiles only. This is the
largest visual gap of the three.

### F-01 — Hero atmosphere

**Job:** Convey Dubai waterfront premium in two seconds without depicting any
identifiable building.
**Placement:** Behind the hero headline, under the code-built motion layer.
**Must not:** show a recognisable skyline silhouette, a named tower, or anything
a buyer could mistake for a specific project.

> Abstract architectural atmosphere at dusk. Deep navy #0B1220 field with warm
> golden #C9A227 light raking across from the lower right, dissolving into
> darkness. Suggestion of still water and soft horizontal light bands, like a
> calm marina after sunset, heavily abstracted. Fine haze, generous negative
> space upper left for typography. Cinematic, restrained, editorial. No
> buildings, no skyline, no text, no logos, no people, no interface.

### F-02 — "Allocations before the portals"

**Job:** Make the one real differentiator visual. The feeling is *early access* —
being inside before the doors open.
**Placement:** The differentiator section card.

> Layered translucent panels in warm sand #C9A227 and off-white, stacked in
> precise parallel planes receding into deep navy #0B1220, the nearest panel
> lifted and edge-lit as if drawn out ahead of the others. Architectural,
> deliberate, structural. Soft directional studio light, fine material grain. No
> text, no numbers, no buildings, no interface, no logos.

### F-03 — The WhatsApp brief

**Job:** Convey a private, recurring signal to a small list. Calm, not noisy.
**Placement:** The brief opt-in band.

> A single warm golden #C9A227 point of light in a vast deep navy #0B1220 field,
> with faint concentric rings spreading outward and fading, like a quiet signal
> repeating. Deep, still, minimal. Soft reflection below. No text, no chat
> bubbles, no phone, no interface, no logos, no people.

---

## SEREEN CARE

**Palette:** deep blue `#0E2A47` · bright accent blue `#2E8BC0` · white `#FFFFFF`
(taken from their blue-diamond mark)
**Feel:** clinical, systematic, trustworthy. Process over sparkle.
**Real assets:** logo + stock cleaning photography. No genuine job photos.

### S-01 — Hero atmosphere

**Job:** Convey *restored* — surfaces returned to correct. Calm, clean light.
**Must not:** be a sparkle/shine cliché, and must not imply a before/after.

> Abstract clean interior light study. Broad soft daylight falling across a plain
> pale surface, deep blue #0E2A47 shadow gradients at the edges, one clean bright
> #2E8BC0 highlight. Matte, calm, architectural. Sense of order and stillness. No
> people, no cleaning equipment, no text, no logos, no interface, no sparkles or
> star glints.

### S-02 — Process / checklist

**Job:** Convey *system, repeated identically every visit* — their core claim.

> An orderly grid of plain white cards receding in soft three-quarter perspective
> on a deep blue #0E2A47 field, each identical, evenly lit, edges catching a thin
> #2E8BC0 light. Rhythm and repetition, precise and clinical. No text, no ticks,
> no icons, no interface, no logos.

### S-03 — Coverage / property types

**Job:** Convey breadth — villas, apartments, commercial, handover units.

> Abstract arrangement of simple pale geometric volumes of varying size on a deep
> blue #0E2A47 plane, lit from above with clean directional studio light and soft
> contact shadows. Architectural model feel, matte materials. No windows, no
> doors, no recognisable buildings, no text, no logos.

### Placeholder, not generated

`before-after/` ships **empty**, with a labelled component. Owner supplies real
job photographs. This is listed as an open item, not hidden.

---

## KEMETRA NATURALS

**Palette:** warm clay `#B98A6A` · deep olive `#3E4B3C` · cream `#F5EFE6`
**Feel:** handmade, Egyptian, earthy, unhurried.
**Real assets — use these, do not replace them.** Kemetra already has genuine
product photography (extracted 2026-08-02):

| Asset | Use |
|---|---|
| `IMG_0571.png` | brand mark |
| `IMG_0457_-_Edited.jpg` | lifestyle |
| `beauty-natural-1-top.jpg` | flat-lay |
| `DSC05979.jpg` | wide lifestyle |
| `Photoroom_20250930_122137.jpg` | Artisan Curve trays |
| `851A8034.jpg` | Balance&Glow Soap Bar |
| `Photoroom_20250827_185242.jpg` | BREATHE oil |
| `Photoroom_20250828_150951.jpg` | CALM oil |

Generated art here is **atmosphere around real product shots**, never a
substitute for them.

### K-01 — Hero atmosphere

**Job:** Handcrafted Egyptian warmth. The feeling is *made slowly, by hand*.
**Must not:** include hands or faces (the sisters must be photographed, not
invented), or any product that could be mistaken for a real SKU.

> Warm abstract craft atmosphere. Soft raking daylight across cream #F5EFE6 linen
> and raw clay #B98A6A surfaces, deep olive #3E4B3C shadow in the corners. Fine
> natural texture — woven fibre, unglazed ceramic, dried botanical forms heavily
> abstracted. Slow, quiet, sunlit, unhurried. No hands, no faces, no products, no
> text, no logos, no packaging.

### K-02 — Ingredient texture

**Job:** "Pure ingredients, conscious care" made tactile. Sits behind the story
section.

> Extreme close abstract texture of natural raw materials — soft mineral powder,
> dried botanical fragments, unrefined oils catching light — in clay #B98A6A and
> deep olive #3E4B3C on cream #F5EFE6. Macro, shallow depth of field, warm
> daylight. Purely material and abstract. No products, no packaging, no hands, no
> text, no logos.

### K-03 — Gifting / bundles

**Job:** Support the bundle strategy (raising AOV is the whole commercial point).
Wrapping and ribbon as *material*, not a depicted gift box.

> Abstract study of natural wrapping materials — unbleached paper, coarse twine,
> raw linen folds — in cream #F5EFE6 and clay #B98A6A on deep olive #3E4B3C, lit
> with soft warm directional light. Tactile, generous, handmade. No boxes, no
> products, no ribbons forming bows, no text, no logos.

---

## Model choice & cost discipline

- **`seedream_4_5` / `nano_banana`** — first choice, strong on abstract material
  and texture, cheap per frame.
- **`recraft_v4_1`** with the `colors` parameter pinned to the hex values above —
  used where palette fidelity matters most (F-02, S-02), because the palette
  parameter constrains output instead of hoping the prompt lands the colour.
- `get_cost` preflight before any batch.
- No character/Soul models: no people means no likeness questions.
- **9 images total across 3 clients.** Hero motion is code, not video.

## Acceptance — reject and regenerate if any of these

1. Any legible or pseudo-legible text in frame.
2. Any number, chart, gauge or percentage.
3. Any logo, developer mark or platform mark.
4. Any recognisable building, skyline or real property.
5. Any face or hand.
6. Colours drifting off the stated hexes.
7. Anything that reads as evidence of a result (a before/after, a "clean vs
   dirty" pair, a sold sticker).
