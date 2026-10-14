# Admin panel + Supabase CMS — handoff notes (14 Oct 2026)

## Done
- Supabase project `toyonIndustry` (ref nnsuwjlzkeousytnhsdt, ap-south-1).
  Tables: categories, products, roads, road_products, enquiries, admin_users. RLS on all.
  Public can read only published catalogue rows and can only INSERT enquiries (rate-limited by trigger:
  3 per email / 10 min, 120 total / hour). Only allow-listed admin (toyonindustry@gmail.com, confirmed email)
  can write catalogue rows, read/update/delete enquiries, and upload to the public `catalog` storage bucket.
  Seeded with all 96 products, 10 categories, 3 roads (20 road products) from src/catalog.ts.
- Website now loads the catalogue from Supabase (src/catalog-server.ts, ISR 5 min, falls back to bundled data).
  src/catalog.ts is a live store filled by applyCatalog(); CatalogHydrator applies it in the root layout.
- Contact form now submits enquiries to Supabase (honeypot + 3-second check). Fixed the phone `pattern`
  regex (an unescaped "-" makes it invalid in modern browsers' v-flag mode, which silently disables validation).
- /admin: sign-in (Supabase Auth, bcrypt-hashed passwords), forgot/reset password, 30-min idle sign-out,
  overview, enquiries inbox (status, notes, delete, CSV export), CRUD for products (image upload → WebP),
  categories, roads and products-on-roads (3 stations; capacity 8/8/4). Saves call /api/revalidate
  (admin-verified) so the site updates immediately.
- Privacy policy / terms updated to say enquiries are stored. Have them legally reviewed (see LEGAL-REVIEW.md).
- Security headers in next.config.ts; /admin is noindex and disallowed in robots.

## NOT yet verified — do this first
1. `npm install` (adds @supabase/supabase-js 2.57.4; check that this version exists, otherwise pin the latest 2.x) then
   `npm run typecheck` and `npm run build`. Only a syntax check was run; fix any type errors.
2. `npm run dev`, then test: home road scene, /products, /categories, a product page, /contact submit,
   /admin login and every CRUD screen, and that an edit shows on the site.
3. Check for duplicate React keys in ThreeRoadWorld if two roads use the same collection.

## Manual steps in the Supabase dashboard (the owner must do these)
- Authentication → Users → Add user → toyonindustry@gmail.com with a strong password, "Auto confirm" ticked.
- Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
- Authentication → URL Configuration → Site URL https://www.toyonindustry.com and add
  https://www.toyonindustry.com/admin and http://127.0.0.1:3000/admin to Redirect URLs (for password reset).
- Optional: enable leaked-password protection and MFA.

## Optional env vars (defaults are hard-coded in src/supabase-config.ts; the publishable key is safe to be public)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Never add a service_role key to the frontend.

## Cloudinary images
- Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local and in Vercel (see .env.example).
  The secret is used only by app/api/cloudinary/sign (admin-verified) to sign uploads; never expose it to the browser.
- Admin uploads go browser → Cloudinary (folder toyon/products or toyon/categories, unique names, overwrite=false).
  Without the env vars, uploads fall back to the Supabase `catalog` bucket.
- Admin → Overview → "Copy N images to Cloudinary" copies existing images (fixed name = product id, overwrite=false, so
  re-running never replaces anything) and updates the database rows. Files in public/assets stay as the offline fallback.
- The site requests sized copies on demand (src/cloudinary.ts: f_auto,q_auto,c_limit,w_N).

## Ideas not done
- Email notification to the owner on each new enquiry (Supabase Edge Function + Resend, or a database webhook).
