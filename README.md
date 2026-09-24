# Toyon first world

Run `npm install`, then `npm run dev`. Production validation: `npm run build`.

The approved Framer reference remains in `reference/ToyonIntro.framer.md`.
Its original logo, O geometry, sticky stage, native scrolling, gradual zoom,
one-second scrub and cloud transition are retained. One persistent world avoids
scale resets at the portal handoff.

## ZIP artwork update

The following original files were extracted without modifying their bytes from
`Balloon-Mockups-96-Minimal-2D-Worlds.zip`:

- `christmas/Backgrounds/background-01.png` → `assets/christmas/background.png`
- `christmas/Clouds/cloud-transition-01.png` → `assets/christmas/clouds.png`

Product images remain the original `frames/1.png`–`frames/8.png`. Only the
Christmas world is implemented in this phase; other ZIP categories are untouched.
The older generated winter path is no longer rendered.

## Camera route

Every product has a fixed world coordinate in `src/scene.ts`. A shared camera
visits all eight coordinates in order. Each stop uses smooth movement followed
by a short scroll-controlled hold. The environment moves more slowly for depth.
The first four viewport lengths preserve the intro timing; each product then
receives one viewport length. Scrolling backward reverses the route.
Desktop/mobile artwork sizes are independently configurable. Adding products to
the scene automatically extends the camera route and scroll length.

Reduced motion replaces camera travel with centered product crossfades and
removes zoom, sway and clouds. Live preference changes and GSAP cleanup remain.

Verified: build, all eight centered and fully visible camera stops at 1440×900
and 390×844, no horizontal overflow, reduced-motion camera disabled, no browser
page errors. Original source asset files are untouched.

