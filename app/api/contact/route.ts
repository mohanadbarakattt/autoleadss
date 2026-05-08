import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().min(1),
  businessName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  industry: z.enum(['ecommerce', 'realEstate', 'other']),
  budget: z.enum(['under5k', '5kTo15k', '15kTo30k', 'over30k']),
  message: z.string().optional(),
  whatsappOptIn: z.boolean(),
  _honeypot: z.string(),
});

const BUDGET_LABELS: Record<string, string> = {
  under5k: 'Under AED 5,000',
  '5kTo15k': 'AED 5,000 – 15,000',
  '15kTo30k': 'AED 15,000 – 30,000',
  over30k: 'Over AED 30,000',
};

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { _honeypot, ...data } = parsed.data;

  // Silently accept spam submissions without revealing the honeypot
  if (_honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: process.env.CONTACT_EMAIL_FROM ?? 'noreply@autoleadss.com',
        to: process.env.CONTACT_EMAIL_TO ?? 'info@autoleadss.com',
        subject: `New lead: ${data.name} — ${data.businessName}`,
        text: [
          `Name: ${data.name}`,
          `Business: ${data.businessName}`,
          `Phone: ${data.phone}`,
          `Email: ${data.email}`,
          `Industry: ${data.industry}`,
          `Budget: ${BUDGET_LABELS[data.budget] ?? data.budget}`,
          `WhatsApp opt-in: ${data.whatsappOptIn ? 'Yes' : 'No'}`,
          data.message ? `\nMessage:\n${data.message}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      });
    } catch (err) {
      console.error('Resend error:', err);
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
