import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { RoadTheme } from './catalog';
import { followDistance, motionDefaults, speedFactor, type RoadScene } from './road-scene';
import { cloudinaryImage, cloudinaryPoster, cloudinarySrcSet, cloudinaryVideo, isCloudinary } from './cloudinary';

// One road station's background: the theme's animated light field (default), custom moving colours,
// an uploaded image/GIF, or a looping silent video. Two motion layers sit inside it:
//  - .backdrop-follow shifts with the mouse (CSS vars --bg-px/--bg-py, -1..1, set by the page) — "interactive"
//  - .backdrop-drift slowly pans/zooms images and videos so the scene keeps moving on touch screens too.
// `load` delays downloads until the visitor nears the station; videos only play while their station is on screen,
// and nothing moves for visitors who prefer reduced motion.
export default function StationBackdrop({ theme, scene, present, load }: { theme: RoadTheme; scene?: RoadScene; present: boolean; load: boolean }) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const bg = scene?.background;
  const playing = bg?.kind === 'video' && present && load && !reduced;
  useEffect(() => {
    const element = video.current; if (!element) return;
    if (playing) element.play().catch(() => { /* autoplay blocked: the poster stays visible */ }); else element.pause();
  }, [playing]);

  const speed = speedFactor[scene?.motion?.speed ?? motionDefaults.speed];
  const follow = followDistance[scene?.motion?.interactive ?? motionDefaults.interactive];
  const motionVars = { '--mesh-speed': speed, '--follow': `${follow}px` } as CSSProperties;
  const mesh = <><span className="mesh-light mesh-a" /><span className="mesh-light mesh-b" /><span className="mesh-light mesh-c" /><span className="mesh-light mesh-d" /></>;
  const layers = (content: ReactNode, drift: boolean) => <div className="backdrop-follow"><div className={drift ? 'backdrop-drift' : 'backdrop-still'}>{content}</div></div>;

  if (bg?.kind === 'motion' && bg.colors) {
    const [c1, c2, c3] = bg.colors;
    return <div className="animated-category-backdrop palette-custom" data-present={present} style={{ ...motionVars, '--c1': c1, '--c2': c2, '--c3': c3 } as CSSProperties}>{layers(mesh, false)}</div>;
  }
  if (bg?.kind === 'image' && bg.url) {
    const url = bg.url;
    return <div className={`animated-category-backdrop palette-${theme} has-media`} data-present={present} style={motionVars}>
      {layers(load && <img className="backdrop-media" src={cloudinaryImage(url, 1600)} srcSet={isCloudinary(url) ? cloudinarySrcSet(url, [960, 1600, 2400]) : undefined} sizes="100vw" alt="" decoding="async" />, true)}
    </div>;
  }
  if (bg?.kind === 'video' && bg.url) {
    const poster = cloudinaryPoster(bg.url, 1280);
    return <div className={`animated-category-backdrop palette-${theme} has-media`} data-present={present} style={motionVars}>
      {layers(load && (reduced
        ? poster && <img className="backdrop-media" src={poster} alt="" decoding="async" />
        : <video ref={video} className="backdrop-media" src={cloudinaryVideo(bg.url, 1600)} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />), true)}
    </div>;
  }
  return <div className={`animated-category-backdrop palette-${theme}`} data-present={present} style={motionVars}>{layers(mesh, false)}</div>;
}
