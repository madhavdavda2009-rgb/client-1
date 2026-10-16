import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '../../../src/admin-auth-server';
import { CATALOG_TAG } from '../../../src/supabase-config';

// Called by the admin panel after a change so the public site updates immediately.
// Only a signed-in, allow-listed admin (checked by the database) can trigger it.
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  // Drop the cached catalogue data right away (no stale copy is served), then re-render every page.
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
