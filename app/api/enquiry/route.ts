import { supabaseKey, supabaseUrl } from '../../../src/supabase-config';

// Receives the website enquiry form. When TURNSTILE_SECRET_KEY is set, the visitor's "I'm human" check is verified
// with Cloudflare before the enquiry is saved. The database still validates every field and rate-limits submissions.
const FIELDS = ['name', 'company', 'email', 'phone', 'message', 'product_id', 'product_title'] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false, error: 'invalid' }, { status: 400 });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const token = typeof body.token === 'string' ? body.token.slice(0, 2048) : '';
    if (!token) return Response.json({ ok: false, error: 'captcha' }, { status: 403 });
    const form = new URLSearchParams({ secret, response: token });
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) form.append('remoteip', ip);
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, cache: 'no-store' })
      .then(res => res.json() as Promise<{ success?: boolean }>).catch(() => null);
    if (!check?.success) return Response.json({ ok: false, error: 'captcha' }, { status: 403 });
  }

  const row = Object.fromEntries(FIELDS.map(key => [key, typeof body[key] === 'string' && body[key] ? body[key] : null]));
  const res = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
    method: 'POST',
    headers: { apikey: supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
    cache: 'no-store',
  });
  if (!res.ok) {
    const message = (await res.json().catch(() => null) as { message?: string } | null)?.message ?? '';
    // Pass through the database's friendly rate-limit messages; hide anything else.
    const friendly = message.startsWith('Too many') || message.startsWith('Enquiries are') ? message : 'send-failed';
    return Response.json({ ok: false, error: friendly }, { status: friendly === 'send-failed' ? 400 : 429 });
  }
  return Response.json({ ok: true });
}
