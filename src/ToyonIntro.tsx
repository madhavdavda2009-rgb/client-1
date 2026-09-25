import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WorldScene from './WorldScene';
import CloudTransition, { cloudUrl } from './CloudTransition';
import LogoArtwork, { originalLogo } from './LogoArtwork';
import { layers, products } from './scene';


const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const rangeProgress = (v: number, start: number, end: number) => clamp((v - start) / (end - start));
const easeInOut = (v: number) => v * v * (3 - 2 * v);
// Geometry from the approved Framer reference, calibrated against the supplied 1600 × 1131 JPEG.
export const intro = { holeX: 0.348, holeY: 0.477, holeRadius: 0.0274, scrollLength: 2.5 };

export default function ToyonIntro() {
  const rootRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current!;
    const stage = root.querySelector<HTMLElement>('.stage')!;
    const logo = root.querySelector<SVGSVGElement>('.logo')!;
    const logoArt = root.querySelector<SVGGElement>('[data-logo-art]')!;
    const cover = root.querySelector<HTMLElement>('.cloud-cover')!;
    const portal = root.querySelector<HTMLElement>('.portal')!;
    const world = root.querySelector<HTMLElement>('.world-scene')!;
    const camera = root.querySelector<HTMLElement>('.product-camera')!;
    const detailNodes = Array.from(root.querySelectorAll<HTMLElement>('.product-details'));
    const hint = root.querySelector<HTMLElement>('.scroll-hint')!;
    const cloudBanks = Array.from(root.querySelectorAll<HTMLElement>('.cloud-bank'));
    const routeLength = intro.scrollLength + products.length;
    const openingFraction = intro.scrollLength / routeLength;
    const productNodes = Array.from(root.querySelectorAll<HTMLElement>('.world-product'));
    const layerNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-layer]'));
    const mm = gsap.matchMedia();
    mm.add({ reduced: '(prefers-reduced-motion: reduce)', normal: '(prefers-reduced-motion: no-preference)' }, ctx => {
      const reduced = !!ctx.conditions?.reduced;
      let vw = 1, vh = 1, mobile = false, baseWidth = 1;
      let targetProgress = 0, running = false, disposed = false;
      const state = { progress: 0 };
      const measure = () => {
        vw = stage.clientWidth; vh = stage.clientHeight; mobile = vw < 768;
        root.style.height = `${vh * (reduced ? 5 : 1 + routeLength)}px`;
        baseWidth = Math.min(vw * 0.86, 900);
        logo.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
        productNodes.forEach((node, i) => {
          const product = products[i], p = mobile ? product.mobile : product.desktop;
          node.style.left = `${reduced ? (mobile ? 50 : 33) : p.x * 100}%`;
          node.style.top = `${reduced ? (mobile ? 35 : 44) : p.y * 100}%`;
          node.style.width = `${p.width}%`;
          node.style.zIndex = `${product.z}`;
        });
      };
      // One continuous opening followed by the existing product camera route.
      const renderFrame = () => {
        const total = state.progress;
        const progress = reduced ? total : clamp(total / openingFraction);
        const travel = reduced ? total : rangeProgress(total, openingFraction, 1);
        const productReveal = easeInOut(reduced ? rangeProgress(total, 0.2, 0.26) : rangeProgress(total / openingFraction, 0.94, 1.08));
        camera.style.opacity = `${productReveal}`;
        camera.style.visibility = productReveal === 0 ? 'hidden' : 'visible';
        // Indicator follows actual scroll, never an elapsed-time timer.
        const hintOpacity = 1 - easeInOut(rangeProgress(targetProgress * routeLength * vh, 0, 65));
        hint.style.opacity = `${hintOpacity}`;
        hint.style.visibility = hintOpacity === 0 ? 'hidden' : 'visible';
        hint.style.animationPlayState = hintOpacity === 0 ? 'paused' : 'running';
        const baseHeight = baseWidth / (1600 / 1131);
        const targetScale = Math.max(1, Math.hypot(vw, vh) * 0.6 / (intro.holeRadius * baseWidth));
        const zoom = easeInOut(rangeProgress(progress, 0, 0.49));
        const scale = Math.pow(targetScale, zoom);
        const align = easeInOut(rangeProgress(progress, 0, 0.14));
        const offsetX = (intro.holeX - 0.5) * baseWidth;
        const offsetY = (intro.holeY - 0.5) * baseHeight;
        // Original artwork is unmodified; camera transforms use a viewport-sized SVG stage.
        const cx = vw / 2 + offsetX * (1 - align);
        const cy = vh / 2 + offsetY * (1 - align);
        const factor = reduced ? baseWidth / 1600 : baseWidth / 1600 * scale;
        const tx = reduced ? vw / 2 - baseWidth / 2 : cx - intro.holeX * 1600 * factor;
        const ty = reduced ? vh / 2 - baseHeight / 2 : cy - intro.holeY * 1131 * factor;
        logoArt.setAttribute('transform', `matrix(${factor} 0 0 ${factor} ${tx} ${ty})`);
        logo.style.opacity = `${reduced ? 1 - rangeProgress(total, 0.04, 0.18) : 1 - easeInOut(rangeProgress(progress, 0.52, 0.56))}`;
        const worldReveal = reduced ? rangeProgress(total, 0.18, 0.26) : easeInOut(rangeProgress(progress, 0.60, 0.64));
        portal.style.opacity = `${worldReveal}`;
        portal.style.visibility = worldReveal === 0 ? 'hidden' : 'visible';
        world.style.transform = 'none';
        const coverOpacity = reduced ? 0 : easeInOut(rangeProgress(progress, 0.39, 0.49)) * (1 - easeInOut(rangeProgress(progress, 0.69, 0.85)));
        cover.style.opacity = `${coverOpacity}`;
        cover.style.visibility = coverOpacity === 0 ? 'hidden' : 'visible';
        root.dataset.openingProgress = progress.toFixed(4);
        root.dataset.cloudCoverage = coverOpacity.toFixed(4);
        const t = reduced ? rangeProgress(total, 0.2, 1) : travel;
        const stop = Math.min(products.length - 1, Math.floor(t * products.length));
        const segment = t === 1 ? 1 : t * products.length - stop;
        const blend = easeInOut(rangeProgress(segment, 0, 0.72));
        const current = mobile ? products[stop].mobile : products[stop].desktop;
        const previous = stop > 0 ? (mobile ? products[stop - 1].mobile : products[stop - 1].desktop) : { ...current, x: current.x + 0.18, y: current.y - 0.12 };
        const cameraX = previous.x + (current.x - previous.x) * blend;
        const cameraY = previous.y + (current.y - previous.y) * blend;
        camera.style.transform = reduced ? 'none' : `translate3d(${vw * ((mobile ? 0.5 : 0.33) - cameraX)}px, ${vh * ((mobile ? 0.35 : 0.44) - cameraY)}px, 0)`;
        root.dataset.focusProduct = products[stop].id;
        cloudBanks.forEach((bank, i) => {
          const enter = easeInOut(rangeProgress(progress, 0.25 + i * 0.035, 0.49));
          const leave = easeInOut(rangeProgress(progress, 0.65 + i * 0.065, 0.87 + i * 0.065));
          const visible = !reduced && progress > 0.25 + i * 0.035 && leave < 1;
          bank.style.visibility = visible ? 'visible' : 'hidden';
          bank.style.willChange = visible ? 'transform, opacity' : 'auto';
          if (!visible) return;
          const sign = i === 1 ? 1 : -1;
          const x = sign * ((1 - enter) * vw * 0.85 + leave * vw * 0.65);
          const y = (i - 1) * vh * 0.24 + sign * ((1 - enter) * vh * 0.5 + leave * vh * 0.65);
          bank.style.opacity = `${easeInOut(rangeProgress(enter, 0, 0.35)) * (1 - easeInOut(rangeProgress(leave, 0.65, 1)))}`;
          bank.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${0.92 + enter * 0.12 + leave * (0.12 + i * 0.06)})`;
        });
        productNodes.forEach((node, i) => {
          const product = products[i], p = mobile ? product.mobile : product.desktop;
          const visibility = reduced ? (i === stop ? (stop === 0 ? 1 : blend) : i === stop - 1 ? 1 - blend : 0) : 1;
          node.style.opacity = `${visibility}`;
          node.style.visibility = visibility > 0 ? 'visible' : 'hidden';
          node.setAttribute('aria-hidden', i === stop && productReveal > 0.5 ? 'false' : 'true');
          node.style.transform = `translate(-50%, -50%) rotate(${reduced ? 0 : p.rotation + Math.sin(t * 9 + i) * product.sway}deg) scale(${p.scale})`;
        });
        detailNodes.forEach((node, i) => {
          const focus = reduced ? (i === stop ? (stop === 0 ? 1 : blend) : i === stop - 1 ? 1 - blend : 0)
            : i === stop ? easeInOut(rangeProgress(blend, 0.68, 0.98)) : i === stop - 1 ? 1 - easeInOut(rangeProgress(segment, 0, 0.18)) : 0;
          const opacity = focus * productReveal;
          node.style.opacity = `${opacity}`;
          node.style.visibility = opacity > 0 ? 'visible' : 'hidden';
          node.setAttribute('aria-hidden', opacity < 0.5 ? 'true' : 'false');
        });
        layerNodes.forEach(node => {
          const layer = layers.find(l => l.id === node.dataset.layer)!;
          // Keep the supplied landscape in view behind every product.
          node.style.transform = reduced || mobile ? 'none' : `translate(${clamp((1.4 - cameraX) * layer.depth * vw * 0.1, -vw * 0.018, vw * 0.018)}px, 0)`;
        });
      };
      measure(); renderFrame();
      // Rate limiting only the opening preserves every stage even after a fast fling.
      // Ticker is detached at rest and on unmount; no independent scroll listeners.
      const tick = (_time: number, deltaMs: number) => {
        if (disposed || document.hidden) return;
        const dt = Math.min(deltaMs / 1000, 1 / 30);
        const distance = targetProgress - state.progress;
        const opening = state.progress <= openingFraction;
        const limit = opening ? openingFraction * 0.8 * dt : 1.6 * dt;
        const delta = clamp(distance * (1 - Math.exp(-dt / 0.10)), -limit, limit);
        state.progress = Math.abs(distance) < 0.00001 ? targetProgress : state.progress + delta;
        renderFrame();
        if (state.progress === targetProgress) { gsap.ticker.remove(tick); running = false; }
      };
      const follow = (progress: number) => {
        targetProgress = progress;
        if (reduced) { state.progress = progress; renderFrame(); return; }
        if (!running) { running = true; gsap.ticker.add(tick); }
      };
      const trigger = ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom',
        onUpdate: self => follow(self.progress), onRefreshInit: measure,
        onRefresh: self => { renderFrame(); follow(self.progress); } });
      return () => {
        disposed = true; gsap.ticker.remove(tick); trigger.kill(); root.style.removeProperty('height');
        [logo, portal, world, camera, hint, cover, ...cloudBanks, ...productNodes, ...detailNodes, ...layerNodes].forEach(el => el.removeAttribute('style'));
      };

    }, root);
    return () => mm.revert();
  }, []);

  return <><link rel="preload" as="image" href={originalLogo} /><link rel="preload" as="image" href={cloudUrl} /><main ref={rootRef} className="journey" aria-label="Toyon Industry">
    <div className="stage">
      <LogoArtwork />
      <div className="portal"><WorldScene /></div>
      <CloudTransition />
      <p className="scroll-hint">Scroll Down to See<span aria-hidden="true">↓</span></p>
    </div>
  </main></>;
}
