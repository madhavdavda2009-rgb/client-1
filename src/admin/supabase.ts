"use client";
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseKey, supabaseUrl } from '../supabase-config';
import { cloudinaryImage, isCloudinary } from '../cloudinary';

let client: SupabaseClient | null = null;
export function getSupabase() {
  if (!client) client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'toyon-admin-auth' },
  });
  return client;
}

export type CategoryRow = { id: string; title: string; sky: string; ground: string; road: string; ink: string; background: string; cloud: string; sort_order: number; is_published: boolean };
export type ProductRow = { id: string; slug: string; title: string; description: string; category_id: string; image: string; thumb: string; sort_order: number; is_published: boolean };
export type RoadRow = { id: string; label: string; description: string; category_id: string; theme: 'christmas' | 'dinosaurs' | 'halloween'; sort_order: number; is_published: boolean };
export type RoadProductRow = { road_id: string; product_id: string; position: number };
export type EnquiryRow = { id: string; name: string; company: string; email: string; phone: string | null; product_id: string | null; product_title: string | null; message: string; status: 'new' | 'read' | 'replied' | 'archived'; admin_notes: string | null; created_at: string };

export const slugify = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

// Resize in the browser and store WebP copies in the public "catalog" bucket.
async function toWebp(file: File, max: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not process image')), 'image/webp', 0.88));
}
type Folder = 'products' | 'categories';
// Asks the server to sign a Cloudinary upload. Returns null when Cloudinary is not configured (Supabase storage is used).
async function signUpload(folder: Folder, name: string, exact: boolean) {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  const res = await fetch('/api/cloudinary/sign', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ folder, name, exact }) });
  if (res.status === 503) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not prepare the image upload.');
  return json as { cloudName: string; apiKey: string; signature: string; params: Record<string, string> };
}
// Uploads straight from the browser to Cloudinary; existing images are never overwritten (signed overwrite=false).
async function uploadToCloudinary(file: Blob, folder: Folder, name: string, exact = false): Promise<string | null> {
  const sign = await signUpload(folder, name, exact);
  if (!sign) return null;
  const form = new FormData();
  form.append('file', file); form.append('api_key', sign.apiKey); form.append('signature', sign.signature);
  for (const [key, value] of Object.entries(sign.params)) form.append(key, value);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) throw new Error(json.error?.message || 'Cloudinary upload failed.');
  return json.secure_url as string;
}
// Removes images from Cloudinary (server checks admin + "toyon/" folder). Returns false only if Cloudinary reported a failure.
export async function deleteCloudinaryImages(urls: string[]) {
  const list = [...new Set(urls.filter(url => url && isCloudinary(url)))];
  if (!list.length) return true;
  const { data } = await getSupabase().auth.getSession();
  const res = await fetch('/api/cloudinary/delete', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: list }) }).catch(() => null);
  return !!res && (res.ok || res.status === 503);
}
export async function cloudinaryEnabled() {
  const { data } = await getSupabase().auth.getSession();
  const res = await fetch('/api/cloudinary/sign', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}`, 'Content-Type': 'application/json' }, body: '{}' }).catch(() => null);
  return !!res && res.status !== 503;
}
// Copies an image that is already on the website (bundled file or Supabase storage) to Cloudinary under a fixed name.
// If that name already exists in Cloudinary, the existing image is kept and its URL returned.
export async function copyToCloudinary(url: string, folder: Folder, name: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not read ${url} (${res.status}).`);
  const uploaded = await uploadToCloudinary(await res.blob(), folder, name, true);
  if (!uploaded) throw new Error('Cloudinary is not configured.');
  return uploaded;
}

export async function uploadImage(file: File, folder: Folder, name: string, sizes: { main: number; thumb?: number }) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Please upload a PNG, JPG or WebP image.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Image is larger than 15 MB.');
  // Preferred: Cloudinary keeps one high-resolution original and serves every size on demand.
  const cloud = await uploadToCloudinary(await toWebp(file, 2400), folder, name);
  if (cloud) return { main: cloudinaryImage(cloud, sizes.main), thumb: sizes.thumb ? cloudinaryImage(cloud, sizes.thumb) : cloudinaryImage(cloud, sizes.main) };
  const supabase = getSupabase();
  const stamp = Date.now().toString(36);
  const put = async (blob: Blob, suffix: string) => {
    const path = `${folder}/${name}-${stamp}${suffix}.webp`;
    const { error } = await supabase.storage.from('catalog').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return supabase.storage.from('catalog').getPublicUrl(path).data.publicUrl;
  };
  const main = await put(await toWebp(file, sizes.main), '');
  const thumb = sizes.thumb ? await put(await toWebp(file, sizes.thumb), '-thumb') : main;
  return { main, thumb };
}

export async function refreshWebsite() {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return false;
  const res = await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  return !!res?.ok;
}
