import { createHash } from 'node:crypto';
import { requireAdmin } from '../../../../src/admin-auth-server';
import { cloudinaryAsset } from '../../../../src/cloudinary';

// Deletes images from Cloudinary for a signed-in admin (when a product or collection is deleted, or an image replaced).
// Only images in this account's "toyon/" folders can be deleted; anything else in the account is never touched.
export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME, apiKey = process.env.CLOUDINARY_API_KEY, apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return Response.json({ ok: false, error: 'Cloudinary is not configured.' }, { status: 503 });
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json().catch(() => ({})) as { urls?: unknown };
  const urls = Array.isArray(body.urls) ? body.urls.filter((url): url is string => typeof url === 'string').slice(0, 20) : [];
  const ids = [...new Set(urls.map(cloudinaryAsset).filter(asset => asset && asset.cloudName === cloudName && asset.publicId.startsWith('toyon/')).map(asset => asset!.publicId))];

  const results: Record<string, string> = {};
  for (const publicId of ids) {
    const params: Record<string, string> = { invalidate: 'true', public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
    const signature = createHash('sha1').update(Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&') + apiSecret).digest('hex');
    const form = new URLSearchParams({ ...params, api_key: apiKey, signature });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body: form, cache: 'no-store' });
    const json = await res.json().catch(() => ({})) as { result?: string; error?: { message?: string } };
    // "ok" = deleted, "not found" = already gone; both mean the image is no longer in Cloudinary.
    results[publicId] = json.result ?? json.error?.message ?? `HTTP ${res.status}`;
  }
  const failed = Object.entries(results).filter(([, result]) => result !== 'ok' && result !== 'not found');
  return Response.json({ ok: failed.length === 0, results }, { status: failed.length ? 502 : 200 });
}
