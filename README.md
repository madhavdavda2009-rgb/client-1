# Toyon opening and first world

Run `npm install`, then `npm run dev`; validate with `npm run build`.

The supplied `toyon.jpeg` is displayed unchanged. No tracing, recolouring,
reconstructed lettering or depth treatment is applied. The viewport-sized SVG
wrapper only positions that original image; it does NOT make the raster into a
vector. Extreme zoom sharpness requires the original brand SVG/vector asset.

The native sticky opening uses one ScrollTrigger and one on-demand GSAP ticker.
The ticker detaches at rest/unmount. The opening is 2.5 viewport lengths, directly
targets the first O, and rate-limits progression through its essential stages
when the visitor flings to the bottom. Product travel retains normal smoothing.
Reduced motion uses crossfades and no cloud/camera movement.

The indicator follows actual scroll position and returns at the start. Its
arrow gently loops only while visible (disabled with reduced motion).

Three image cloud layers surround one opaque cloud cover. The world remains
hidden until full coverage; it is prepared under that cover before foreground
clouds separate. The cloud and background are optimized derivatives of the
supplied ZIP artwork (33 KB and 13 KB). Original PNGs and product files remain
untouched. Products and their approved visual descriptions retain wide framing.

The stage uses 100dvh with 100svh fallback. Static dimensions are measured only
on refresh, not on every animation frame. Mobile has no cloud blur. Scrolling
never uses wheel/touch interception. Six viewport widths are included in QA:
320, 360, 375, 390, 414 and 430 pixels. Browser emulation is not a physical-device
60 FPS guarantee.
