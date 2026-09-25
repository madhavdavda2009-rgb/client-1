# Toy-On implementation

## Assets
- Original supplied SVG preserved byte-for-byte at assets/brand/toyon-original.svg.
- All 96 original product files remain unchanged. Optimized WebP display copies and thumbnails in public/assets/catalog are derived from Balloon-Mockups-96-Minimal-2D-Worlds.zip.
- All 10 supplied category backgrounds and cloud overlays are reused. Opening uses the existing optimized assets/opening/clouds.webp.
- Product titles and descriptions describe visible artwork only; no material, size, availability or performance claims.

## Motion and routes
- Native vertical scroll and one cleaned-up GSAP ScrollTrigger drive the original O opening and cloud handoff.
- Hero stream uses two identical groups for a seamless loop. Pause motion stops decorative animation. Rectangular confetti is clipped below the hero logo; each category uses its own lightweight falling SVG motif.
- Road products have fixed world coordinates. A shared camera projects the road and product positions; road products have no independent sway or float. Four reused DOM slots cover a curated 75-product home journey. Mobile uses smaller 480px display copies.
- Categories run consecutively, with at most eight products each (Birds has seven; Halloween has four). Nine cloud handoffs fully conceal category changes. The catalogue still contains all 96 products.
- /products supports search and category filters; /categories and all 10 category and 96 product routes use the same catalogue data. Vercel SPA rewrites support direct links.
- Reduced motion replaces the immersive route with a static accessible collection listing.

## Content still needed
Approved company introduction, email, phone/WhatsApp and address are blank in src/site-content.ts. Contact currently copies/downloads a visitor-reviewed enquiry; it does not transmit or claim to submit anything.

## Verification
Production TypeScript/Vite build passes. All 96 product detail routes and 10 category routes were opened in Edge. Six mobile widths (320, 360, 375, 390, 414, 430) passed overflow/readable-copy checks; reduced-motion collection navigation passed. No browser runtime errors or failed asset responses in the route sweep. Desktop/mobile opening and road screenshots were inspected.

## Performance refinement
- Hidden opening artwork is no longer redrawn during the road journey. Camera holds skip redundant scene updates; references are cached and product widths change only on resize.
- Removed animated image filters, the road shadow and animated circular road markers; reduced road geometry, cloud layers, off-screen work and visible mobile products. Products sit farther from a narrower road; the camera makes a larger lateral approach.
- Browser QA: all nine forward category changes switched assets at full cloud coverage. 320/360/375/390/414/430/768/1440px checks passed product/copy bounds and overflow checks; full catalogue and reduced motion retained.
- Same 150-frame Edge headless sample at 390px and 4x CPU throttling: baseline p95 33.4ms (12 frames above 33.4ms); optimized p95 16.9ms (zero above 33.4ms). This is a simulated browser measurement, not a guarantee for every physical device.
