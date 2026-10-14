import { supabaseKey, supabaseUrl } from './supabase-config';

// Server-side check for API routes: the request must carry the access token of a signed-in, allow-listed admin
// (verified by the database's am_i_admin function). Returns a 401/403 response to send back, or null when allowed.
export async function requireAdmin(request: Request): Promise<Response | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false }, { status: 401 });
  const check = await fetch(`${supabaseUrl}/rest/v1/rpc/am_i_admin`, {
    method: 'POST',
    headers: { apikey: supabaseKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (!check.ok || (await check.json()) !== true) return Response.json({ ok: false }, { status: 403 });
  return null;
}
