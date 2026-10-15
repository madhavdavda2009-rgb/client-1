import { createHash, randomBytes } from 'node:crypto';
import { requireAdmin } from '../../../../src/admin-auth-server';

// Signs a direct browser-to-Cloudinary upload for a signed-in admin. The API secret never leaves the server, and the
// signature fixes the folder, file name, formats and overwrite=false, so existing Cloudinary files are never replaced.
// Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.
const FOLDERS = ['products', 'categories', 'roads'] as const;
// "image" = photos (converted to WebP in the browser), "gif" = animated images kept as uploaded, "video" = backgrounds.
const KINDS = {
  image: { resourceType: 'image', formats: 'jpg,png,webp' },
  gif: { resourceType: 'image', formats: 'gif,jpg,png,webp' },
  video: { resourceType: 'video', formats: 'mp4,webm,mov' },
} as const;

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME, apiKey = process.env.CLOUDINARY_API_KEY, apiSecret = process.env.CLOUDINARY_API_SECRET;
  // 503 tells the admin panel to fall back to Supabase storage.
  if (!cloudName || !apiKey || !apiSecret) return Response.json({ ok: false, error: 'Cloudinary is not configured.' }, { status: 503 });
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({})) as { folder?: string; name?: string; exact?: boolean; kind?: string };
  const folder = FOLDERS.find(f => f === body.folder);
  if (!folder) return Response.json({ ok: false, error: 'Unknown folder.' }, { status: 400 });
  const kind = KINDS[(body.kind ?? 'image') as keyof typeof KINDS];
  if (!kind) return Response.json({ ok: false, error: 'Unknown file type.' }, { status: 400 });
  const name = String(body.name ?? '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'file';

  const params: Record<string, string> = {
    allowed_formats: kind.formats,
    folder: `toyon/${folder}`,
    overwrite: 'false',
    // Copies of existing photos keep a fixed name (so a second copy is skipped); new uploads always get a unique name.
    public_id: body.exact ? name : `${name}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const toSign = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const signature = createHash('sha1').update(toSign + apiSecret).digest('hex');
  return Response.json({ ok: true, cloudName, apiKey, signature, params, resourceType: kind.resourceType }, { headers: { 'Cache-Control': 'no-store' } });
}
