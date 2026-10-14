import { createHash, randomBytes } from 'node:crypto';
import { requireAdmin } from '../../../../src/admin-auth-server';

// Signs a direct browser-to-Cloudinary upload for a signed-in admin. The API secret never leaves the server, and the
// signature fixes the folder, file name, formats and overwrite=false, so existing Cloudinary images are never replaced.
// Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (see .env.example).
const FOLDERS = ['products', 'categories'] as const;

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME, apiKey = process.env.CLOUDINARY_API_KEY, apiSecret = process.env.CLOUDINARY_API_SECRET;
  // 503 tells the admin panel to fall back to Supabase storage.
  if (!cloudName || !apiKey || !apiSecret) return Response.json({ ok: false, error: 'Cloudinary is not configured.' }, { status: 503 });
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({})) as { folder?: string; name?: string; exact?: boolean };
  const folder = FOLDERS.find(f => f === body.folder);
  if (!folder) return Response.json({ ok: false, error: 'Unknown folder.' }, { status: 400 });
  const name = String(body.name ?? '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'image';

  const params: Record<string, string> = {
    allowed_formats: 'jpg,png,webp',
    folder: `toyon/${folder}`,
    overwrite: 'false',
    // Copies of existing photos keep a fixed name (so a second copy is skipped); new uploads always get a unique name.
    public_id: body.exact ? name : `${name}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const toSign = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const signature = createHash('sha1').update(toSign + apiSecret).digest('hex');
  return Response.json({ ok: true, cloudName, apiKey, signature, params }, { headers: { 'Cache-Control': 'no-store' } });
}
