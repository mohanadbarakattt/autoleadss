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

## Phase 4 — Billing (Stripe + Paymob)  ✅ code shipped

Plan entitlements, usage meters, and contextual upgrade gates work today (client-side).
Real checkout is dual-region and env-gated: Gulf → Stripe, Egypt → Paymob.

**Entitlements** (`src/saas/entitlements.ts`): Starter = 1 funnel; Growth = 5 + WhatsApp bot +
ad/social gen + remove badge; Pro = unlimited + priority AI. Hitting a cap/feature opens a
branded upgrade modal (`UpgradeContext`).

**Go live (checkout):**
1. Deploy the function: `supabase functions deploy create-checkout`
2. Set secrets:
   ```bash
   # Gulf / USD
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
   supabase secrets set STRIPE_PRICE_GROWTH_GULF=price_xxx STRIPE_PRICE_PRO_GULF=price_xxx
   # Egypt / EGP (amounts in piastres: 3,000 EGP = 300000)
   supabase secrets set PAYMOB_SECRET_KEY=xxx PAYMOB_PUBLIC_KEY=xxx
   supabase secrets set PAYMOB_PRICE_GROWTH_EGYPT=300000 PAYMOB_PRICE_PRO_EGYPT=750000
   ```
3. Add `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx` to Vercel (flips `billingEnabled` on the client).
4. **Webhook (to flip the plan after payment):** add a `stripe-webhook` / `paymob-webhook`
   edge function that, on a successful subscription event, updates `workspaces.plan` for the
   `client_reference_id` (Clerk user id). Until then, checkout redirects work but the plan
   won't auto-upgrade. _(Stub to add next; low-risk once you have live keys to test against.)_

Without these, "Choose plan" sets the plan locally (demo) — the whole flow stays usable.

## Phase 5 — WhatsApp Cloud API (BYO WABA)  ✅ code shipped

Each funnel connects the customer's **own** WhatsApp number (pass-through — protects margin).
The webhook runs the funnel's generated bot flow live, auto-replies, captures leads (source
`whatsapp`), and logs the conversation. Managed from **/app/connect** (Growth+ only).

**Go live:**
1. `supabase db push` (adds `whatsapp_connections` + `whatsapp_messages`, from `0002_whatsapp.sql`).
2. Deploy the **public** webhook (Meta sends no apikey):
   ```bash
   supabase functions deploy whatsapp-webhook --no-verify-jwt
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # SUPABASE_URL is auto-set
   ```
3. In the app → **WhatsApp** tab: pick a funnel, copy the **Webhook URL + Verify token** into your
   Meta app's WhatsApp → Configuration → Webhook, subscribe to the **messages** field, then paste your
   **phone number ID** and a **permanent access token** and Save.
4. Message the number — the bot replies from your funnel's flow and a lead appears in the CRM.

_Note: `access_token` is stored in an RLS-protected table; encrypt with Supabase Vault/pgsodium for
extra hardening. A shared-inbox UI over `whatsapp_messages` is a nice Phase-8 add._

## Phase 5.5 — Gemma-powered WhatsApp bot  ✅ code shipped

The webhook now generates **dynamic** replies with Gemma 4 (grounded in the funnel's chatbot
spec + recent conversation history), falling back to the deterministic flow if unconfigured.
Gemma is ~10× cheaper than Claude Haiku on this highest-volume path — protecting margin as
WhatsApp usage scales.

**Go live** (any OpenAI-compatible Gemma host — DeepInfra / Together / Groq, or self-hosted vLLM/Ollama):
```bash
supabase secrets set GEMMA_API_KEY=<key>
supabase secrets set GEMMA_BASE_URL=https://api.deepinfra.com/v1/openai   # or your endpoint
supabase secrets set GEMMA_MODEL=google/gemma-4-26b-a4b-it               # adjust to the host's id
```
Without these, the bot uses the rule-based flow (still works). **Before flipping it on, run the
eval harness on Gulf + Egyptian Arabic** (see `docs/AI_MODEL_EVAL.md`).

## Phase 6 — Custom domains / real publishing  ✅ code shipped

Once Phase 3 is live, published funnels already work cross-device via `/p/:slug`. Phase 6 adds
host-based rendering (subdomains + custom domains) and SEO/OG meta on published pages.

- **Free subdomains** `{slug}.autoleadss.site`: register `autoleadss.site`, add it (and a wildcard
  `*.autoleadss.site`) to the Vercel project, and point DNS at Vercel. Any such host renders that
  funnel at `/`. Override the root via `VITE_FUNNEL_DOMAIN` if you use a different domain.
- **Custom domains**: in the editor → **Domain** tab, add the customer's hostname (writes to the
  `domains` table); they point a **CNAME → cname.vercel-dns.com**; add the domain in the Vercel
  project so it issues SSL. The public page resolves host → funnel via `get_published_funnel_by_host`.
- **SEO/OG**: published pages emit `<title>/description/OG/lang/dir/theme-color` from the funnel spec.
- Apply the migration: `supabase db push` (adds `0003_domains.sql`).

_SSR is not enabled (SPA) — helmet meta covers OG/unfurls and basic SEO; add prerender/SSR in Phase 8 if organic SEO becomes a priority._

## Phase 7 — White-label / agency mode  ✅ code shipped

Agencies on the **white-label** plan get client **sub-accounts** + their own **branding**.
Managed at **/app/agency** (gated to the whitelabel plan). New funnels attach to the active
sub-account; the dashboard filters by it; the published-page badge respects the agency's
branding (hide, or "Made with {brand}").

- Apply the migration: `supabase db push` (adds `0004_agency.sql` — `agency_settings`,
  `sub_accounts`, `funnels.sub_account_id`, RLS).
- Set a workspace to the whitelabel plan (via billing / admin) to unlock the Agency tab.

_Follow-ups (Phase 8): propagate agency branding to remote public pages (embed brand in the
published payload), per-sub-account seats/roles, and reseller billing rails._

## Phase 8 — Analytics, admin, hardening

---

### Env reference (`.env` / Vercel)
| Var | Used by | Status |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | client + edge calls | ✅ set |
| `ANTHROPIC_API_KEY` (Supabase secret) | `generate-funnel` | ⛔ add to go live |
| `ANTHROPIC_MODEL_*` (Supabase secret) | model routing | optional |
