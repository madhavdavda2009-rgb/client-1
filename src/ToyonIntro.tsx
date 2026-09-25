import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WorldScene from './WorldScene';
import CloudTransition from './CloudTransition';
import { layers, products } from './scene';
import logoUrl from '../toyon.jpeg?url';

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const rangeProgress = (v: number, start: number, end: number) => clamp((v - start) / (end - start));
const easeInOut = (v: number) => v * v * (3 - 2 * v);
// Geometry from the approved Framer reference, calibrated against the supplied 1600 × 1131 JPEG.
export const intro = { holeX: 0.348, holeY: 0.477, holeRadius: 0.0274, scrollLength: 5 };

export default function ToyonIntro() {
  const rootRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current!;
    const stage = root.querySelector<HTMLElement>('.stage')!;
    const logo = root.querySelector<HTMLElement>('.logo')!;
    const portal = root.querySelector<HTMLElement>('.portal')!;
    const world = root.querySelector<HTMLElement>('.world-scene')!;
    const camera = root.querySelector<HTMLElement>('.product-camera')!;
    const detailNodes = Array.from(root.querySelectorAll<HTMLElement>('.product-details'));
    const hint = root.querySelector<HTMLElement>('.scroll-hint')!;
    const cloudGroups = Array.from(root.querySelectorAll<HTMLElement>('.cloud-group'));
    const productNodes = Array.from(root.querySelectorAll<HTMLElement>('.world-product'));
    const layerNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-layer]'));
    const mm = gsap.matchMedia();
    mm.add({ reduced: '(prefers-reduced-motion: reduce)', normal: '(prefers-reduced-motion: no-preference)' }, ctx => {
      const reduced = !!ctx.conditions?.reduced;
      let vw = 1, vh = 1, mobile = false;
      const state = { progress: 0 };
      const measure = () => {
        vw = stage.clientWidth; vh = stage.clientHeight; mobile = vw < 768;
        root.style.height = `${vh * (reduced ? 5 : intro.scrollLength + products.length)}px`;
      };
      // The original 0–1 intro timing occupies the first four viewport lengths.
      // Each product gets its own viewport length after the four-viewport intro.
      const renderFrame = () => {
        const total = state.progress;
        const progress = reduced ? total : clamp(total * (4 + products.length) / 4);
        const travel = reduced ? total : rangeProgress(total, 4 / (4 + products.length), 1);
        const productReveal = easeInOut(reduced ? rangeProgress(total, 0.2, 0.26) : rangeProgress(total * (4 + products.length), 4, 4.3));
        camera.style.opacity = `${productReveal}`;
        camera.style.visibility = productReveal === 0 ? 'hidden' : 'visible';
        hint.style.opacity = `${1 - easeInOut(rangeProgress(progress, 0.015, 0.12))}`;
        hint.style.visibility = progress >= 0.12 ? 'hidden' : 'visible';
        const baseWidth = Math.min(vw * 0.86, 900);
        const baseHeight = baseWidth / (1600 / 1131);
        const target = clamp(Math.hypot(vw, vh) * 0.56 / (intro.holeRadius * baseWidth), 60, 120);
        const zoom = easeInOut(rangeProgress(progress, 0.02, 0.3));
        const approach = easeInOut(rangeProgress(progress, 0.35, 0.58));
        const scale = progress <= 0.35 ? 1 + 2 * zoom : 3 * Math.pow(target / 3, approach);
        const align = easeInOut(rangeProgress(progress, 0.1, 0.55));
        const ox = (intro.holeX - 0.5) * baseWidth * scale;
        const oy = (intro.holeY - 0.5) * baseHeight * scale;
        const cx = vw / 2 + ox * (1 - align), cy = vh / 2 + oy * (1 - align);
        const radius = intro.holeRadius * baseWidth * scale;
        // One persistent world eliminates the original two-world crossfade/scale reset.
        logo.style.width = `${baseWidth}px`;
        logo.style.transform = reduced ? 'translate(-50%, -50%)' : `translate(calc(-50% - ${ox * align}px), calc(-50% - ${oy * align}px)) scale(${scale})`;
        logo.style.opacity = `${reduced ? 1 - rangeProgress(total, 0.04, 0.18) : 1 - easeInOut(rangeProgress(progress, 0.69, 0.72))}`;
        portal.style.clipPath = reduced ? 'none' : `circle(${radius}px at ${cx}px ${cy}px)`;
        portal.style.opacity = `${reduced ? rangeProgress(total, 0.08, 0.22) : easeInOut(rangeProgress(progress, 0.015, 0.075))}`;
        world.style.transform = reduced ? 'none' : `scale(${1.4 - 0.4 * easeInOut(rangeProgress(progress, 0.3, 0.72))})`;
        world.style.transformOrigin = '50% 50%';
        const t = reduced ? rangeProgress(total, 0.2, 1) : travel;
        const stop = Math.min(products.length - 1, Math.floor(t * products.length));
        const segment = t === 1 ? 1 : t * products.length - stop;
        const blend = easeInOut(rangeProgress(segment, 0, 0.72));
        const current = mobile ? products[stop].mobile : products[stop].desktop;
        const previous = stop > 0 ? (mobile ? products[stop - 1].mobile : products[stop - 1].desktop) : { ...current, x: current.x + 0.18, y: current.y - 0.12 };
        const cameraX = previous.x + (current.x - previous.x) * blend;
        const cameraY = previous.y + (current.y - previous.y) * blend;
        camera.style.transform = reduced ? 'none' : `translate(${vw * ((mobile ? 0.5 : 0.33) - cameraX)}px, ${vh * ((mobile ? 0.35 : 0.44) - cameraY)}px)`;
        root.dataset.focusProduct = products[stop].id;
        cloudGroups.forEach((group, i) => {
          const enter = easeInOut(rangeProgress(progress, 0.42 + i * 0.018, 0.69));
          const leave = easeInOut(rangeProgress(progress, 0.72 + i * 0.025, 0.92 + i * 0.035));
          group.style.visibility = reduced || progress < 0.42 || leave === 1 ? 'hidden' : 'visible';
          group.style.opacity = `${reduced ? 0 : easeInOut(rangeProgress(progress, 0.42 + i * 0.018, 0.56 + i * 0.018)) * (1 - easeInOut(rangeProgress(progress, 0.89 + i * 0.035, 0.92 + i * 0.035)))}`;
          const offset = (1 - enter + leave) * (55 + i * 3);
          const banks = group.children;
          (banks[0] as HTMLElement).style.transform = `translate(${leave * (i % 2 ? 12 : -12)}%, ${-offset}%) scale(${1 + leave * 0.12})`;
          (banks[1] as HTMLElement).style.transform = `translate(${leave * (i % 2 ? -15 : 15)}%, ${offset}%) scale(${1 + leave * 0.16})`;
        });
        productNodes.forEach((node, i) => {
          const product = products[i], p = mobile ? product.mobile : product.desktop;
          const visibility = reduced ? (i === stop ? (stop === 0 ? 1 : blend) : i === stop - 1 ? 1 - blend : 0) : 1;
          node.style.left = `${reduced ? (mobile ? 50 : 33) : p.x * 100}%`;
          node.style.top = `${reduced ? (mobile ? 35 : 44) : p.y * 100}%`;
          node.style.width = `${p.width}%`;
          node.style.opacity = `${visibility}`;
          node.style.visibility = visibility > 0 ? 'visible' : 'hidden';
          node.style.zIndex = `${product.z}`;
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
      const timeline = gsap.timeline({ onUpdate: renderFrame }).to(state, { progress: 1, ease: 'none', duration: 1 });
      const trigger = ScrollTrigger.create({ trigger: root, animation: timeline, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1, invalidateOnRefresh: true,
        onRefreshInit: measure, onRefresh: renderFrame });
      return () => {
        trigger.kill(); timeline.kill(); root.style.removeProperty('height');
        [logo, portal, world, camera, hint, ...cloudGroups, ...productNodes, ...detailNodes, ...layerNodes, ...Array.from(root.querySelectorAll<HTMLElement>('.cloud-bank'))].forEach(el => el.removeAttribute('style'));
      };
    }, root);
    return () => mm.revert();
  }, []);

  return <main ref={rootRef} className="journey" aria-label="Toyon Industry">
    <div className="stage">
      <div className="logo"><img src={logoUrl} alt="Toyon Industry Pvt Ltd" draggable={false} fetchPriority="high" /></div>
      <div className="portal"><WorldScene /></div>
      <CloudTransition />
      <p className="scroll-hint">Scroll down to see the world<span aria-hidden="true">↓</span></p>
    </div>
  </main>;
}
