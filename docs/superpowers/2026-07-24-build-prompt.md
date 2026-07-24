# AutoLeadss — Build Prompt for Fable 5

Paste everything between the lines into a fresh Fable 5 session opened in `~/projects/autoleadss`.

---

You are Fable 5, the sole builder for **AutoLeadss** — a premium global growth suite (functional tools + a flagship luxury storefront) for the Gulf and worldwide. Begin immediately; do not ask permission to start.

**Read first, in full:**
1. `docs/superpowers/specs/2026-07-24-autoleadss-suite-v2-design.md` (the design)
2. `docs/superpowers/plans/2026-07-24-autoleadss-suite-v2-plan.md` (the 8-phase plan — your task list)
3. `docs/superpowers/2026-07-24-launch-checklist.md` (how it goes live)

Work on branch `autoleadss/suite-v2`. Prototypes to match: `.superpowers/{al-hub, al-storefront, al-onboarding}.html`.

**How to work:**
- Use `superpowers:subagent-driven-development`: one fresh subagent per plan task, spec-then-review, TDD. Commit locally after each task.
- Execute the plan **phase by phase, in order**. After each phase, stop and report: what shipped, tests/typecheck/build status, and the acceptance proof. Then continue.

**Non-negotiables (from the spec — do not violate):**
- **Functional or it doesn't ship.** Every tool has a real backend and real actions — no placeholder text pretending to be a feature, no fake metrics/reviews/analytics. The demo-mode (localStorage + client-side templates) is a keyless *fallback*, clearly labeled, never the pitch.
- **Keep the built engine** (the 8 env-gated, adversarially-reviewed phases: auth, billing, generation, WhatsApp, domains, white-label, analytics, webhooks). Don't restart — upgrade the pieces into the V2 tools.
- **Payments (Phase 3 — the biggest new build):** a unified layer over **Tap · PayTabs · Telr · Checkout.com · Tabby · Tamara · Stripe · PayPal · Apple Pay**. Merchant connects their own account; checkout routes to it; currency/region aware (AED default for Gulf). **Money discipline (C9):** fail-closed activation, **idempotent webhooks per gateway**, never mark paid before the dependent write. **Poison-test each gateway's webhook** (double-charge / missed-grant). Any gateway whose real integration isn't complete ships **behind a flag**, never faked.
- **Merge Storefront + Landing → "Sites"** with Sell and Capture modes. Captured leads/orders are real and fail-closed.
- **Business-type onboarding** assembles the right toolkit + payments per type.
- **Premium global look:** dark-luxe suite (champagne gold #c9a86a, Cormorant Garamond) + light editorial-luxury storefront — a clear tier above ibni. EN/AR RTL preserved.
- No fabrication anywhere; generated copy/ads grounded to the real business. Deep-copy discipline (C10).
- Quality bar **8.5/10 minimum**; writer ≠ verifier — verify each phase independently, especially the payments webhooks.

**Gotchas:**
- **framer-motion v12:** never nest `AnimatePresence mode="wait"` (hangs) — use keyed `motion.div`.
- If `curl`/`head` go "command not found" mid-session: `export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`.

**Boundaries:**
- Commit locally only. **Do NOT push or deploy.** The owner handles gateway merchant KYC, WABA, keys, DNS `autoleadss.site` + wildcard, and the deploy (via `npx vercel` on the mohanadbarakattt account) — see the launch checklist.
- If the plan and spec disagree, or a task is ambiguous on payments/data/what's-real, stop and flag it.

Start with **Phase 0** now.

---
