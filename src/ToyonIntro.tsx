import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoadWorld from './RoadWorld';
import HeroStream from './HeroStream';
import CloudTransition, { cloudUrl } from './CloudTransition';
import LogoArtwork, { originalLogo } from './LogoArtwork';
import { categories, categoryById, journeyProducts as products } from './catalog';
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const ease = (v: number) => v * v * (3 - 2 * v);
const intro = { holeX: .348, holeY: .477, radius: .0274, length: 2.5 };
const side = (i: number) => [-1, 1, 1, -1, 1, -1, -1, 1][i % 8];
const bend = (z: number) => Math.sin(z * .72) * .16 + Math.sin(z * .23) * .08;
export default function ToyonIntro() {
  const rootRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current!, stage = root.querySelector<HTMLElement>('.stage')!;
    const logo = root.querySelector<SVGSVGElement>('.logo')!, art = root.querySelector<SVGGElement>('[data-logo-art]')!;
    const preview = root.querySelector<HTMLElement>('.portal-preview')!;
    const portal = root.querySelector<HTMLElement>('.portal')!, hero = root.querySelector<HTMLElement>('.hero-life')!, hint = root.querySelector<HTMLElement>('.scroll-hint')!;
    const world = root.querySelector<HTMLElement>('.world-scene')!, cover = root.querySelector<HTMLElement>('.cloud-cover')!;
    const clouds = [...root.querySelectorAll<HTMLElement>('.cloud-bank')];
    const slots = [...root.querySelectorAll<HTMLElement>('.world-product')];
    const details = root.querySelector<HTMLElement>('.product-details')!;
    const backA = root.querySelector<HTMLImageElement>('.scene-background-a')!, backB = root.querySelector<HTMLImageElement>('.scene-background-b')!;
    const road = root.querySelector<SVGSVGElement>('.road-canvas')!;
    const roadSurface = root.querySelector<SVGPathElement>('.road-surface')!, roadShadow = root.querySelector<SVGPathElement>('.road-shadow')!, roadEdge = root.querySelector<SVGPathElement>('.road-edge')!;
    const marks = root.querySelector<SVGGElement>('.road-markers')!;
    const position = root.querySelector<HTMLElement>('.journey-position')!;
    let width = 1, height = 1, mobile = false, baseWidth = 1, progress = 0, target = 0, running = false, disposed = false, lastStop = -1, lastPair = '';
    const totalLength = intro.length + products.length * 1.1 + 1;
    const openingFraction = intro.length / totalLength;
    // Only five real product elements are reused as the camera moves through 96 designs.
    const markerEls = Array.from({length: 12}, () => { const el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); marks.append(el); return el; });
    const warmed = new Set<string>();
    const warm = (src: string) => { if (warmed.has(src)) return; warmed.add(src); const image = new Image(); image.src = src; image.decode().catch(() => {}); };
    categories.slice(0, 2).forEach(c => { warm(c.background); warm(c.cloud); });
    products.slice(0, 4).forEach(p => warm(p.image));
    function measure() {
      width = stage.clientWidth; height = stage.clientHeight; mobile = width < 768;
      baseWidth = Math.min(width * .96, 860);
      root.style.height = `${height * (1 + totalLength)}px`;
      logo.setAttribute('viewBox', `0 0 ${width} ${height}`);
      road.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    function render() {
      const opening = clamp(progress / openingFraction), travel = range(progress, openingFraction, (totalLength - 1) / totalLength);
      root.dataset.openingProgress = opening.toFixed(4);
      root.dataset.openingActive = String(opening < 1 && target > 0);
      root.dataset.phase = opening < .25 ? 'hero' : opening < 1 ? 'opening' : 'road';
      const heroFade = 1 - ease(range(opening, 0, .20));
      hero.style.opacity = `${heroFade}`;
      hero.style.visibility = heroFade > 0 ? 'visible' : 'hidden';
      hero.style.transform = `translate3d(0, ${opening * height * .08}px, 0) scale(${1 + opening * .16})`;
      const hintOpacity = 1 - ease(range(target * totalLength * height, 0, 65));
      hint.style.opacity = `${hintOpacity}`; hint.style.visibility = hintOpacity ? 'visible' : 'hidden';
      const alignment = ease(range(opening, 0, .14));
      const scale = Math.pow(Math.hypot(width, height) * .60 / (intro.radius * baseWidth), ease(range(opening, 0, .49)));
      const factor = baseWidth / 1600 * scale;
      const offsetX = (intro.holeX - .5) * baseWidth, offsetY = (intro.holeY - .5) * baseWidth / (1600 / 1131);
      const cx = width / 2 + offsetX * (1 - alignment), cy = height * (.29 + .21 * alignment) + offsetY * (1 - alignment);
      art.setAttribute('transform', `matrix(${factor} 0 0 ${factor} ${cx - intro.holeX * 1600 * factor} ${cy - intro.holeY * 1131 * factor})`);
      preview.style.clipPath = `circle(${intro.radius * baseWidth * scale}px at ${cx}px ${cy}px)`;
      preview.style.opacity = `${ease(range(opening,.06,.18)) * (1-ease(range(opening,.48,.52)))}`;
      logo.style.opacity = `${1 - ease(range(opening, .52, .56))}`;
      const worldReveal = ease(range(opening, .60, .64));
      portal.style.opacity = `${worldReveal}`; portal.style.visibility = worldReveal ? 'visible' : 'hidden';
      const coverOpacity = ease(range(opening, .39, .49)) * (1 - ease(range(opening, .69, .85)));
      cover.style.opacity = `${coverOpacity}`; cover.style.visibility = coverOpacity ? 'visible' : 'hidden';
      root.dataset.cloudCoverage = coverOpacity.toFixed(4);
      clouds.forEach((cloud, i) => {
        const enter = ease(range(opening, .25 + i * .035, .49)), leave = ease(range(opening, .65 + i * .065, .87 + i * .065));
        const visible = opening > .25 + i * .035 && leave < 1;
        cloud.style.visibility = visible ? 'visible' : 'hidden'; cloud.style.willChange = visible ? 'transform, opacity' : 'auto';
        if (!visible) return;
        const sign = i === 1 ? 1 : -1;
        cloud.style.opacity = `${ease(range(enter, 0, .35)) * (1 - ease(range(leave, .65, 1)))}`;
        cloud.style.transform = `translate3d(${sign * ((1-enter) * width * .85 + leave * width * .65)}px, ${(i-1) * height * .24 + sign * ((1-enter) * height * .5 + leave * height * .65)}px, 0) scale(${.92 + enter * .12 + leave * (.12+i*.06)})`;
      });
      if (!worldReveal) return;
      const step = Math.min(products.length - 1, Math.floor(travel * products.length));
      const fraction = travel === 1 ? 1 : travel * products.length - step;
      const arrival = ease(range(fraction, 0, .60));
      const cameraZ = (step === 0 ? -.75 : step - 1) + (step === 0 ? .75 : 1) * arrival;
      // Products have immutable world coordinates. Only this camera pose moves.
      const previousSide = step === 0 ? side(0) : side(step - 1);
      const cameraX = bend(cameraZ) * .65 + (previousSide + (side(step) - previousSide) * arrival) * .10;
      const lateral = mobile ? .65 : 1;
      const current = products[step], previous = products[Math.max(0, step - 1)];
      const category = categoryById[current.category], priorCategory = categoryById[previous.category];
      if (step !== lastStop) {
        lastStop = step; root.dataset.focusProduct = current.id;
        world.style.setProperty('--scene-sky', category.sky); world.style.setProperty('--scene-ground', category.ground); world.style.setProperty('--scene-road', category.road); world.style.setProperty('--scene-ink', category.ink);
        const categoryLink = details.querySelector<HTMLAnchorElement>('.product-category')!; categoryLink.textContent = category.title; categoryLink.href = `/categories/${category.id}`;
        details.querySelector('h2')!.textContent = current.title; details.querySelector('p')!.textContent = current.description;
        details.querySelector<HTMLAnchorElement>('.explore-product')!.href = `/products/${current.slug}`;
        position.textContent = `${String(step+1).padStart(2,'0')} / ${products.length}`;
        products.slice(step, step + 4).forEach(p => { warm(p.image); warm(categoryById[p.category].background); });
        root.querySelectorAll<HTMLImageElement>('.drift-cloud').forEach(img => { if (img.dataset.category !== category.id) { img.src = category.cloud; img.dataset.category = category.id; } });
      }
      const pair = `${priorCategory.id}:${category.id}`;
      if (pair !== lastPair) { lastPair = pair; backA.src = priorCategory.background; backB.src = category.background; }
      backB.style.opacity = `${priorCategory.id === category.id ? 1 : arrival}`;
      const sceneryTransform = `translate3d(${-cameraX * width * .05}px, 0, 0) scale(1.08)`;
      backA.style.transform = sceneryTransform; backB.style.transform = sceneryTransform;
      const point = (z: number) => ({ x: width * (.5 + (bend(cameraZ+z-.8)*.65-cameraX)*lateral/(1+z*.9)), y: height * (.46 + .61/(1+z*1.9)), half: width * (mobile ? .25 : .19)/(1+z*.9) });
      const left: string[] = [], right: string[] = [], center: string[] = [];
      for (let k=0;k<=24;k++) { const p=point(k/4); left.push(`${(p.x-p.half).toFixed(1)},${p.y.toFixed(1)}`); right.unshift(`${(p.x+p.half).toFixed(1)},${p.y.toFixed(1)}`); center.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); }
      const path = `M${left.join('L')}L${right.join('L')}Z`; roadSurface.setAttribute('d', path); roadShadow.setAttribute('d', path); roadEdge.setAttribute('d', `M${center.join('L')}`);
      markerEls.forEach((el,i) => { const z = (i*.52 - cameraZ*.8 % .52 + 6.24) % 6.24, p = point(z), sign = i%2?1:-1; el.setAttribute('cx',`${p.x + sign*p.half*1.18}`); el.setAttribute('cy',`${p.y}`); el.setAttribute('rx',`${Math.max(2,12/(1+z))}`); el.setAttribute('ry',`${Math.max(1,5/(1+z))}`); });
      const nearIndex = Math.max(0, Math.floor(cameraZ));
      const productReveal = ease(range(progress / openingFraction, .94, 1.03));
      slots.forEach((node, slot) => {
        const index = nearIndex - 1 + slot, product = products[index];
        if (!product) { node.style.visibility = 'hidden'; return; }
        const distance = index - cameraZ;
        const visible = distance > -.65 && distance < 4.1 && productReveal > 0;
        node.style.visibility = visible ? 'visible' : 'hidden'; node.setAttribute('aria-hidden', index === step && visible ? 'false' : 'true');
        if (!visible) return;
        const img = node.querySelector('img')!;
        if (node.dataset.product !== product.id) { node.dataset.product = product.id; img.src = product.image; img.alt = product.title; }
        const depth = 1/(1 + Math.max(-.3,distance)*1.8);
        const worldX = bend(index) * .65 + side(index) * .33;
        const x = width * (.5 + (worldX-cameraX)*depth*lateral);
        const groundY = .46 + .61 / (1 + Math.max(.12,distance+.8)*1.9);
        const y = height * (groundY - (mobile ? .40 : .28)*depth);
        node.style.width = `${width * (mobile ? .48 : .27)}px`;
        node.style.opacity = `${productReveal * (1-ease(range(-distance,.25,.65)))}`;
        node.style.zIndex = `${20-slot}`;
        node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${depth})`;
      });
      const focus = ease(range(arrival, .65, .98)) * productReveal;
      details.style.opacity = `${focus}`; details.style.visibility = focus ? 'visible' : 'hidden'; details.setAttribute('aria-hidden', focus < .5 ? 'true' : 'false');
      details.style.left = mobile ? '8%' : side(step) < 0 ? '59%' : '7%';
      details.style.transform = mobile ? `translate3d(0, ${(1-focus)*8}px, 0)` : `translate3d(0, calc(-50% + ${(1-focus)*8}px), 0)`;
      const foreground = root.querySelector<HTMLElement>('.foreground-decoration')!;
      foreground.style.transform = `translate3d(${Math.sin(cameraZ*.9)*12}px, ${Math.sin(cameraZ*1.5)*8}px, 0)`;
    }
    function tick(_time: number, delta: number) {
      if (disposed || document.hidden) return;
      const dt = Math.min(delta/1000,1/30), distance = target-progress;
      const limit = progress <= openingFraction ? openingFraction*.8*dt : .7*dt;
      progress = Math.abs(distance)<.000001 ? target : progress + clamp(distance*(1-Math.exp(-dt/.10)),-limit,limit);
      render();
      if (progress===target) { gsap.ticker.remove(tick); running=false; }
    }
    function follow(value: number) { target=value; if (!running) { running=true; gsap.ticker.add(tick); } }
    measure(); render();
    const context = gsap.context(() => {
      ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:self=>follow(self.progress),onRefreshInit:measure,onRefresh:self=>{render();follow(self.progress);}});
    },root);
    return () => { disposed=true; gsap.ticker.remove(tick); context.revert(); markerEls.forEach(el=>el.remove()); };
  }, []);
  return <><link rel="preload" as="image" href={originalLogo}/><link rel="preload" as="image" href={cloudUrl}/><main ref={rootRef} className="journey" aria-label="Toy-On road journey"><div className="stage"><HeroStream/><div className="portal-preview" aria-hidden="true" style={{backgroundImage:`url(${categories[0].background})`}}/><LogoArtwork/><div className="portal"><RoadWorld/></div><CloudTransition/><p className="scroll-hint">Scroll Down to See<span aria-hidden="true">↓</span></p></div></main></>;
}
