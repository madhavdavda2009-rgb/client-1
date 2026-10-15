// Cloudinary delivery helpers (public; no secrets). Images and videos uploaded through the admin panel are stored as
// Cloudinary URLs. Any width can be requested on the fly, and Cloudinary picks the best format and quality.
const UPLOAD_PATH = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/)(.+)$/;
const TRANSFORMATION = /^[a-z]{1,3}_[^/]*$/;

export const isCloudinary = (url: string) => UPLOAD_PATH.test(url);

// Splits a delivery URL into its base ("…/image/upload/") and the asset path without any existing transformations.
function parts(url: string) {
  const match = url.match(UPLOAD_PATH);
  if (!match) return null;
  const segments = match[3].split('?')[0].split('/');
  // Drop transformation segments already in the URL (e.g. "f_auto,q_auto,c_limit,w_1200").
  while (segments.length > 1 && segments[0].split(',').every(part => TRANSFORMATION.test(part))) segments.shift();
  return { base: match[1], resourceType: match[2] as 'image' | 'video', path: segments.join('/') };
}

// Returns the same image resized to `width` (never upscaled), auto format and quality. Other URLs are returned unchanged.
// Animated GIFs stay animated (Cloudinary serves them as animated WebP/AVIF where supported).
export function cloudinaryImage(url: string, width: number) {
  const p = parts(url);
  if (!p || p.resourceType !== 'image') return url;
  return `${p.base}f_auto,q_auto,c_limit,w_${Math.round(width)}/${p.path}`;
}
// A video resized for backgrounds, delivered as MP4 (plays everywhere). Other URLs are returned unchanged.
export function cloudinaryVideo(url: string, width: number) {
  const p = parts(url);
  if (!p || p.resourceType !== 'video') return url;
  return `${p.base}q_auto,c_limit,w_${Math.round(width)}/${p.path.replace(/\.[a-z0-9]+$/i, '')}.mp4`;
}
// First frame of a video as an image (shown while loading and for visitors who prefer reduced motion).
export function cloudinaryPoster(url: string, width: number) {
  const p = parts(url);
  if (!p || p.resourceType !== 'video') return undefined;
  return `${p.base}so_0,f_auto,q_auto,c_limit,w_${Math.round(width)}/${p.path.replace(/\.[a-z0-9]+$/i, '')}.jpg`;
}

// The account, resource type and public id (folder/name without extension) behind a delivery URL.
export function cloudinaryAsset(url: string) {
  const match = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\//);
  const p = parts(url);
  if (!match || !p) return null;
  const segments = p.path.split('/');
  if (segments.length > 1 && /^v\d+$/.test(segments[0])) segments.shift();
  return { cloudName: match[1], resourceType: p.resourceType, publicId: decodeURIComponent(segments.join('/')).replace(/\.[a-z0-9]+$/i, '') };
}

export const cloudinarySrcSet = (url: string, widths: number[]) => widths.map(width => `${cloudinaryImage(url, width)} ${width}w`).join(', ');
