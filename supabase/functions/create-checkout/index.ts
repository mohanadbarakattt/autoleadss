// AutoLeadss — dual-region checkout (Deno / Supabase Edge Function).
// Gulf/USD → Stripe Checkout (subscription). Egypt/EGP → Paymob unified checkout.
// Gated by secrets; returns { url } to redirect to, or { error } so the client falls back.
//
// Secrets (supabase secrets set ...):
//   STRIPE_SECRET_KEY, STRIPE_PRICE_<PLAN>_GULF   (e.g. STRIPE_PRICE_GROWTH_GULF=price_123)
//   PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_PRICE_<PLAN>_EGYPT  (amount in piastres, e.g. 300000 = 3,000 EGP)
// A separate webhook (stripe-webhook / paymob-webhook) should flip workspaces.plan on success — see docs/SETUP.md.

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } })
}

async function stripeCheckout(plan: string, userId: string | undefined, origin: string) {
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  const price = Deno.env.get(`STRIPE_PRICE_${plan.toUpperCase()}_GULF`)
  if (!key || !price) return { error: 'stripe-not-configured' }
  const form = new URLSearchParams()
  form.set('mode', 'subscription')
  form.set('line_items[0][price]', price)
  form.set('line_items[0][quantity]', '1')
  form.set('success_url', `${origin}/app?checkout=success`)
  form.set('cancel_url', `${origin}/pricing?checkout=cancel`)
  form.set('allow_promotion_codes', 'true')
  if (userId) {
    form.set('client_reference_id', userId)
    form.set('metadata[userId]', userId)
    form.set('metadata[plan]', plan)
  }
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) return { error: data?.error?.message ?? 'stripe-error' }
  return { url: data.url as string }
}

async function paymobCheckout(plan: string, userId: string | undefined) {
  const key = Deno.env.get('PAYMOB_SECRET_KEY')
  const pub = Deno.env.get('PAYMOB_PUBLIC_KEY')
  const amount = Deno.env.get(`PAYMOB_PRICE_${plan.toUpperCase()}_EGYPT`)
  if (!key || !pub || !amount) return { error: 'paymob-not-configured' }
  const res = await fetch('https://accept.paymob.com/v1/intention/', {
    method: 'POST',
    headers: { authorization: `Token ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      amount: Number(amount),
      currency: 'EGP',
      payment_methods: ['card'],
      billing_data: { first_name: 'AutoLeadss', last_name: 'Customer', email: 'customer@autoleadss.com', phone_number: '+20000000000' },
      extras: { userId, plan },
    }),
  })
  const data = await res.json()
  if (!res.ok) return { error: data?.detail ?? 'paymob-error' }
  return { url: `https://accept.paymob.com/unifiedcheckout/?publicKey=${pub}&clientSecret=${data.client_secret}` }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  let body: { plan?: string; region?: string; userId?: string; origin?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad-request' }, 400)
  }
  const plan = body.plan ?? ''
  const origin = body.origin ?? 'https://autoleadss.com'
  const result = body.region === 'egypt' ? await paymobCheckout(plan, body.userId) : await stripeCheckout(plan, body.userId, origin)
  return 'url' in result ? json(result) : json(result, 400)
})
