# AutoLeadss — Production Setup Runbook

The app ships in **demo mode** (works with zero config). Each phase below is real,
production-grade code that stays dormant until you add its keys — then it activates
automatically. Nothing here changes the design.

---

## Phase 2 — Real AI generation (streaming)  ✅ code shipped

The funnel wizard streams from a Supabase Edge Function (`generate-funnel`). Until the
key is set, the wizard falls back to the on-device template generator.

**Go live:**
1. Get an Anthropic API key → https://console.anthropic.com
2. Set it as a Supabase secret and deploy the function (Supabase CLI, logged into project `ultznwftohbbgceiwkuh`):
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxx
   supabase functions deploy generate-funnel
   ```
3. (Optional) override models — defaults match `lib/ai/model-router.json`:
   ```bash
   supabase secrets set ANTHROPIC_MODEL_FUNNEL=claude-fable-5
   ```
That's it — the wizard now shows real backend milestones and real AI output, bilingual.
Routing: landing copy → Sonnet/Fable, ads+social → Sonnet, WhatsApp bot → Haiku.

---

## Phase 3 — Database & Clerk auth  ✅ code shipped

Funnels/leads persist to Supabase (RLS-scoped by Clerk user id), with optimistic UI and a
localStorage fallback. Auth is Clerk. All gated: set the three env vars and it activates;
without them the app stays in demo mode.

**Go live:**
1. **Clerk** → create an app at https://clerk.com, copy the **Publishable key**.
2. **Supabase → Authentication → Sign In / Providers → Third-Party Auth → Add Clerk**, paste your
   Clerk **issuer/Frontend API domain**. (In Clerk: Configure → Supabase integration → Connect.)
3. Apply the schema (from repo root, logged into project `ultznwftohbbgceiwkuh`):
   ```bash
   supabase db push          # runs supabase/migrations/0001_saas.sql
   ```
4. Add env vars to **Vercel** (and `.env` locally), then redeploy:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxx
   VITE_SUPABASE_URL=...            # already set
   VITE_SUPABASE_PUBLISHABLE_KEY=... # already set
   ```
Now `/login` /`/signup` use Clerk, funnels persist per-user in Postgres (RLS enforced), and the
public `/p/:slug` page reads + captures leads via SECURITY DEFINER RPCs (no broad table access).

_Note: workspace plan/region sync to the DB lands with Phase 4 (billing)._

## Phase 4 — Billing (Stripe + Paymob/Tap)
Dual-region checkout + plan entitlements + upgrade gates. _Steps added when it lands._

## Phase 5 — WhatsApp Cloud API (BYO WABA)
## Phase 6 — Custom domains / real publishing
## Phase 7 — White-label / agency mode
## Phase 8 — Analytics, admin, hardening

---

### Env reference (`.env` / Vercel)
| Var | Used by | Status |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | client + edge calls | ✅ set |
| `ANTHROPIC_API_KEY` (Supabase secret) | `generate-funnel` | ⛔ add to go live |
| `ANTHROPIC_MODEL_*` (Supabase secret) | model routing | optional |
