# Toy-On website

This is the existing Toy-On experience migrated to Next.js 16.4.0 App Router. The supplied product artwork, three-world road journey, O transitions, motion, catalogue, and contact draft flow remain in place.

## Local development

```sh
npm install
npm run dev
```

`npm run build` generates the supplied logo asset, type-checks and builds all public pages. `npm run start` serves the production build. `npm run typecheck` runs TypeScript separately.

The homepage and catalogue routes are prerendered as HTML. `/contact` is rendered per request to preserve selected product enquiry links. Page metadata lives in `src/seo.ts`; `app/sitemap.ts` and `app/robots.ts` generate crawl files from the catalogue. The original logo remains in `assets/brand/`; `scripts/generate-logo-artwork.mjs` copies it unchanged for public use and embeds its paths for the animated logo.

The contact form prepares a copyable enquiry and does not send or store it. There is no admin backend or email verification yet.

Browser emulation checks do not guarantee performance on a physical phone.
