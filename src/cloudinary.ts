// Cloudinary delivery helpers (public; no secrets). Product images uploaded through the admin panel are stored as
// Cloudinary URLs. Any width can be requested on the fly, and Cloudinary picks the best format (AVIF/WebP) and quality.
const UPLOAD_PATH = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const TRANSFORMATION = /^[a-z]{1,3}_[^/]*$/;

export const isCloudinary = (url: string) => UPLOAD_PATH.test(url);

// Returns the same image resized to `width` (never upscaled), auto format and quality. Other URLs are returned unchanged.
export function cloudinaryImage(url: string, width: number) {
  const match = url.match(UPLOAD_PATH);
  if (!match) return url;
  const segments = match[2].split('/');
  // Drop any transformation segments already in the URL (e.g. "f_auto,q_auto,c_limit,w_1200").
  while (segments.length > 1 && segments[0].split(',').every(part => TRANSFORMATION.test(part))) segments.shift();
  return `${match[1]}f_auto,q_auto,c_limit,w_${Math.round(width)}/${segments.join('/')}`;
}

// The account and public id (folder/name without extension) behind a delivery URL, e.g. "toyon/products/lion".
export function cloudinaryAsset(url: string) {
  const match = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/);
  if (!match) return null;
  const segments = match[2].split('?')[0].split('/');
  while (segments.length > 1 && segments[0].split(',').every(part => TRANSFORMATION.test(part))) segments.shift();
  if (segments.length > 1 && /^v\d+$/.test(segments[0])) segments.shift();
  return { cloudName: match[1], publicId: decodeURIComponent(segments.join('/')).replace(/\.[a-z0-9]+$/i, '') };
}

export const cloudinarySrcSet =(url: string, widths: number[]) => widths.map(width => `${cloudinaryImage(url, width)} ${width}w`).join(', ');
