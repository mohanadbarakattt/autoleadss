# AutoLeadss — Launch Checklist

Product: premium global growth suite (functional tools + flagship luxury storefront), Gulf + worldwide. Spec/plan: `docs/superpowers/{specs,plans}/2026-07-24-autoleadss-suite-v2-*.md` (branch `autoleadss/suite-v2`).
**Launch order: after ibni, alongside nilo.** Its long pole is per-merchant gateway KYC — start those accounts early.

## 1 · Build (Fable 5, its own chat)
- [ ] Open `~/projects/autoleadss` with Fable 5. Paste `docs/superpowers/2026-07-24-build-prompt.md`.
- [ ] It executes the 8-phase plan (TDD, local commits, keep the engine). Review between phases. Biggest new build = the unified multi-gateway **payments** layer (Phase 3).

## 2 · Verify locally
- [ ] Onboard by business type → tailored toolkit assembles → luxury storefront (Sell mode) takes a **test payment** through a Gulf gateway → Capture mode logs a real lead (fail-closed) → tools (Ads/WhatsApp/Leads/Social/Insights) actually work → agency can white-label it.
- [ ] Nothing placeholder; nothing fabricated. EN + AR RTL both clean.

## 3 · Owner-side (only you) — start the ⏳ ones early
- [ ] ⏳⏳ **Gateway merchant accounts + KYC** — each gateway you want live needs its own merchant account and approval: Gulf — **Tap · PayTabs · Telr · Checkout.com · Tabby · Tamara**; global — **Stripe · PayPal · Apple Pay**. KYC takes days–weeks per provider. Each ships behind a flag until its integration is verified live. Merchants connect their *own* accounts — you just need the ones for your demo/first customers.
- [ ] ⏳ **Meta WhatsApp (WABA)** — Business account + phone number approval for the WhatsApp tool.
- [ ] **Accounts/keys:** Clerk (auth), the Neon/Supabase DB, Anthropic + Gemma (generation/bot). Set as env vars on Vercel + as Supabase secrets.
- [ ] **DNS:** register `autoleadss.site` + a **wildcard** record for customer subdomains.
- [ ] **Rotate** the old Supabase anon key that's in git history.

## 4 · Deploy to PREVIEW first
- [ ] Deploy `autoleadss/suite-v2` to a preview URL via the CLI (this project is on the **mohanadbarakattt** Vercel account — `npx vercel`, not the claude.ai connector).
- [ ] Take a **real test payment** through at least one Gulf gateway on the preview URL. Poison-test the webhook (double-charge / missed-grant) before trusting it.

## 5 · Go live
- [ ] Flip gateway keys to live, point `autoleadss.site` + wildcard, merge, `npx vercel --prod`.
- [ ] The marketing site (autoleadss.com) stays; the suite is the product.

## Long poles / notes
- ⏳⏳ Gateway KYC is the gating item — it's paperwork per provider, not code. Start the ones you need first.
- **framer-motion v12 gotcha:** never nest `AnimatePresence mode="wait"` (it hangs) — use keyed `motion.div`. PATH fix if curl/head vanish: `export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`.
- Money paths fail-closed + idempotent per gateway (C9). Functional-or-it-doesn't-ship: no fake features, no invented metrics/reviews.
