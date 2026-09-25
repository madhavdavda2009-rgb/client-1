# Toy-On implementation

## Assets
- Original supplied SVG preserved byte-for-byte at assets/brand/toyon-original.svg.
- All 96 original product files remain unchanged. Optimized WebP display copies and thumbnails in public/assets/catalog are derived from Balloon-Mockups-96-Minimal-2D-Worlds.zip.
- All 10 supplied category backgrounds and cloud overlays are reused. Opening uses the existing optimized assets/opening/clouds.webp.
- Product titles and descriptions describe visible artwork only; no material, size, availability or performance claims.

## Motion and routes
- Native vertical scroll and one cleaned-up GSAP ScrollTrigger drive the original O opening and cloud handoff.
- Hero stream uses two identical groups for a seamless loop. Pause motion stops decorative animation.
- Road products have fixed world coordinates. A shared camera projects the road and product positions; road products have no independent sway or float. Five DOM slots cover the 96-product route.
- Two products per environment visit; subsequent visits show remaining products exactly once. Backgrounds blend without resetting scale.
- /products supports search and category filters; /categories and all 10 category and 96 product routes use the same catalogue data. Vercel SPA rewrites support direct links.
- Reduced motion replaces the immersive route with a static accessible collection listing.

## Content still needed
Approved company introduction, email, phone/WhatsApp and address are blank in src/site-content.ts. Contact currently copies/downloads a visitor-reviewed enquiry; it does not transmit or claim to submit anything.

## Verification
Production TypeScript/Vite build passes. All 96 product detail routes and 10 category routes were opened in Edge. Six mobile widths (320, 360, 375, 390, 414, 430) passed overflow/readable-copy checks; reduced-motion collection navigation passed. No browser runtime errors or failed asset responses in the route sweep. Desktop/mobile opening and road screenshots were inspected.
