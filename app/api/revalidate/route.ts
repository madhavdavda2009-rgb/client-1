import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../src/admin-auth-server';

// Called by the admin panel after a change so the public site updates immediately.
// Only a signed-in, allow-listed admin (checked by the database) can trigger it.
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
