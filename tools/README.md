# tools/

## og-card.html

The source for `public/og-image.png` (1200×630), the card that renders when
autoleadss.com is shared on WhatsApp, LinkedIn, X or iMessage.

It is a real HTML page rather than a generated image on purpose: image models
mangle text, and the wordmark has to be exact. Rendering it in the browser at
1200×630 and screenshotting gives correct typography in the real brand fonts,
so there is no "composite the wordmark on afterwards" step and no dependency on
ImageMagick (which is not installed on this machine).

**The price is deliberately NOT in this card.** A number baked into a PNG
cannot be covered by `src/agency/offer.structured-data.test.ts` and would go
stale silently the next time the offer changes. The price lives in the meta
description, which IS tested.

### Regenerating

1. Serve this directory (any static server).
2. Open `og-card.html`, set the viewport to exactly 1200×630.
3. Screenshot the full viewport, save as `public/og-image.png`.
