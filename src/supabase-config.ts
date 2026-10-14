// Public Supabase settings. The publishable key is designed to be public: all access is enforced by
// row-level security in the database. Never put a service_role / secret key in this file.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nnsuwjlzkeousytnhsdt.supabase.co';
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0hCXf-6hkzMzAoBelckyIA_J_FbB6Rf';
export const CATALOG_TAG = 'catalog';
