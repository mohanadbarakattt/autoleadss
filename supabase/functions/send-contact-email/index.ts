import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'
const TO_EMAIL = 'info@autoleadss.com'

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  businessName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(255),
  country: z.string().min(1).max(50),
  industry: z.string().min(1).max(50),
  budget: z.string().min(1).max(50),
  message: z.string().max(2000).optional().default(''),
  whatsappOptIn: z.boolean().default(false),
})

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
    const d = parsed.data

    const rows: [string, string][] = [
      ['Name', d.name],
      ['Business', d.businessName],
      ['Email', d.email],
      ['Phone', d.phone],
      ['Country', d.country],
      ['Industry', d.industry],
      ['Monthly budget', d.budget],
      ['WhatsApp OK', d.whatsappOptIn ? 'Yes' : 'No'],
    ]

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 16px;font-size:20px">New contact form submission</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:160px">${escapeHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(v)}</td></tr>`,
            )
            .join('')}
        </table>
        <h3 style="margin:24px 0 8px;font-size:16px">Message</h3>
        <div style="white-space:pre-wrap;padding:12px;background:#fafafa;border:1px solid #eee;border-radius:6px;font-size:14px">${escapeHtml(d.message || '(no message)')}</div>
      </div>
    `

    const subject = `New lead: ${d.name} — ${d.businessName}`

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'AutoLeads Contact <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: d.email,
        subject,
        html,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Resend error', res.status, data)
      return new Response(
        JSON.stringify({ error: 'Email send failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-contact-email error', err)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})