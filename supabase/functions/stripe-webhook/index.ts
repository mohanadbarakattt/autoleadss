// AutoLeadss — Stripe webhook (Deno / Supabase Edge Function).
// On a completed checkout, flips workspaces.plan for the Clerk user (metadata.userId).
// Deploy PUBLIC: supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY (SUPABASE_URL auto-set).
import Stripe from 'https://esm.sh/stripe@17?target=deno&no-check'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const body = await req.text()
  if (!sig || !secret) return new Response('not configured', { status: 400 })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, secret, undefined, Stripe.createSubtleCryptoProvider())
  } catch (e) {
    return new Response(`bad signature: ${e}`, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session
      const userId = (s.metadata?.userId as string | undefined) ?? (s.client_reference_id ?? undefined)
      const plan = s.metadata?.plan as string | undefined
      if (userId && plan) {
        await admin.from('workspaces').update({ plan }).eq('owner_id', userId)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.userId as string | undefined
      if (userId) await admin.from('workspaces').update({ plan: 'starter' }).eq('owner_id', userId)
    }
  } catch (e) {
    console.error('[stripe-webhook]', e)
  }

  return new Response('ok', { status: 200 })
})
