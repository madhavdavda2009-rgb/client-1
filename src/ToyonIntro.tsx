import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoadWorld from './RoadWorld';
import HeroStream from './HeroStream';
import CloudTransition, { cloudUrl } from './CloudTransition';
import LogoArtwork, { originalLogo } from './LogoArtwork';
import { categories, categoryById, journeyProducts as products, journeySequence } from './catalog';
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const ease = (v: number) => v * v * (3 - 2 * v);
const intro = { holeX: .348, holeY: .477, radius: .0274, length: 2.5 };
const side = (i: number) => i % 2 ? 1 : -1;
const bend = (z: number) => Math.sin(z * .72) * .16 + Math.sin(z * .23) * .08;
export default function ToyonIntro() {
  const rootRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
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
    const roadSurface = root.querySelector<SVGPathElement>('.road-surface')!, roadEdge = root.querySelector<SVGPathElement>('.road-edge')!;
    const categoryLink = details.querySelector<HTMLAnchorElement>('.product-category')!;
    const title = details.querySelector('h2')!, description = details.querySelector('p')!;
    const explore = details.querySelector<HTMLAnchorElement>('.explore-product')!;
    const drift = root.querySelector<HTMLImageElement>('.drift-cloud')!;
    const particles = [...root.querySelectorAll<SVGPathElement>('.world-sparkles path')];
    const foreground = root.querySelector<HTMLElement>('.foreground-decoration')!;
    const slotImages = slots.map(node => node.querySelector('img')!);
    const motifs: Record<string, string> = {
      christmas: 'M12 2V22M3 7L21 17M3 17L21 7M9 4L12 7L15 4M9 20L12 17L15 20',
      'animal-faces': 'M4 20Q1 4 20 3Q22 21 4 20ZM4 20L16 7M9 14L8 9M13 10L18 11',
      'bird-faces': 'M4 22L17 4M5 17Q1 8 14 2Q24 0 20 9L8 18M9 14L15 15M13 9L19 10',
      dinosaurs: 'M12 23V2M12 8Q2 9 3 3Q10 2 12 8M12 14Q1 16 3 9Q9 8 12 14M12 8Q22 9 21 3Q14 2 12 8M12 14Q23 16 21 9Q15 8 12 14',
      'fruit-and-vegetables': 'M12 3Q5 0 6 7Q0 7 4 13Q1 20 9 18Q13 24 16 17Q23 16 19 10Q22 3 15 6ZM10 10L14 14M14 10L10 14',
      vehicles: 'M4 4L12 12L4 20M12 4L20 12L12 20',
      'headband-shapes': 'M3 4Q20 0 18 7Q16 12 7 12Q0 12 4 17Q7 23 20 20',
      swords: 'M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z',
      'cartoon-and-masked-faces': 'M14 1L4 13H11L9 23L21 9H13Z',
      halloween: 'M2 7L9 10L10 6L12 8L14 6L15 10L22 7L20 17L16 15L12 20L8 15L4 17Z'
    };
    const sceneImage = (image: string) => mobile ? image.replace('.webp', '-scene.webp') : image;
    const position = root.querySelector<HTMLElement>('.journey-position')!;
    let width = 1, height = 1, mobile = false, baseWidth = 1, progress = 0, target = 0, running = false, disposed = false, lastStop = -1, lastOpening = -1, lastPose = '', lastCategory = '';
    let transitioning = false;
    const totalLength = intro.length + journeySequence.length * 1.2 + 1;
    const openingFraction = intro.length / totalLength;
    const warmed = new Set<string>();
    const warm = (src: string) => { if (warmed.has(src)) return; warmed.add(src); const image = new Image(); image.src = src; image.decode().catch(() => {}); };
    categories.slice(0, 2).forEach(c => { warm(c.background); warm(c.cloud); });
    function measure() {
      width = stage.clientWidth; height = stage.clientHeight; mobile = width < 768;
      baseWidth = Math.min(width * .96, height * 1.2, 860);
      root.style.height = `${height * (1 + totalLength)}px`;
      logo.setAttribute('viewBox', `0 0 ${width} ${height}`);
      road.setAttribute('viewBox', `0 0 ${width} ${height}`);
      slots.forEach(node => { node.dataset.product = ''; node.style.width = `${width * (mobile ? .44 : .25)}px`; });
      lastOpening = -1; lastPose = ''; lastStop = -1;
    }
    function paintClouds(opening: number) {
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
    }
    function render() {
      const opening = clamp(progress / openingFraction), travel = range(progress, openingFraction, (totalLength - 1) / totalLength);
      if (opening !== lastOpening) {
      lastOpening = opening;
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
      logo.style.visibility = opening >= .56 ? 'hidden' : 'visible';
      preview.style.visibility = opening >= .52 ? 'hidden' : 'visible';
      const worldReveal = ease(range(opening, .60, .64));
      portal.style.opacity = `${worldReveal}`; portal.style.visibility = worldReveal ? 'visible' : 'hidden';
      paintClouds(opening);
      }
      if (opening < .60) return;
      const slot = Math.min(journeySequence.length - 1, Math.floor(travel * journeySequence.length));
      const stop = journeySequence[slot];
      const fraction = travel === 1 ? 1 : travel * journeySequence.length - slot;
      const isTransition = stop.transitionFrom !== undefined;
      const step = isTransition && fraction < .5 ? stop.transitionFrom! : stop.productIndex;
      const arrival = isTransition ? (fraction < .5 ? 1 : 0) : ease(range(fraction, 0, .68));
      if (isTransition) paintClouds(.25 + fraction * .75);
      else if (transitioning) paintClouds(1);
      transitioning = isTransition;
      root.dataset.transition = String(isTransition);
      const cameraZ = (step === 0 ? -.85 : step - 1) + (step === 0 ? .85 : 1) * arrival;
      const productReveal = ease(range(progress / openingFraction, .97, 1.08));
      const pose = `${step}:${cameraZ.toFixed(4)}:${productReveal.toFixed(3)}:${isTransition}`;
      if (pose === lastPose) return;
      lastPose = pose;
      // Products have immutable world coordinates. Only this camera pose moves.
      const previousSide = step === 0 ? side(0) : side(step - 1);
      const cameraX = bend(cameraZ) * .65 + (previousSide + (side(step) - previousSide) * arrival) * .29;
      const lateral = mobile ? .82 : 1;
      const current = products[step];
      const category = categoryById[current.category];
      if (step !== lastStop) {
        lastStop = step; root.dataset.focusProduct = current.id;
        world.style.setProperty('--scene-sky', category.sky); world.style.setProperty('--scene-ground', category.ground); world.style.setProperty('--scene-road', category.road); world.style.setProperty('--scene-ink', category.ink);
        categoryLink.textContent = category.title; categoryLink.href = `/categories/${category.id}`;
        title.textContent = current.title; description.textContent = current.description;
        explore.href = `/products/${current.slug}`;
        position.textContent = `${category.products.indexOf(current.id)+1} / ${Math.min(8,category.products.length)}`;
        details.style.left = mobile ? '8%' : side(step) < 0 ? '58%' : '7%';
        products.slice(step, step + 3).forEach(p => { warm(sceneImage(p.image)); warm(categoryById[p.category].background); });
      }
      if (lastCategory !== category.id) {
        lastCategory = category.id; world.dataset.category = category.id;
        drift.src = category.cloud;
        particles.forEach(path => path.setAttribute('d', motifs[category.id]));
        backA.src = category.background; backB.style.display = 'none';
      }
      const sceneryTransform = `translate3d(${-cameraX * width * .05}px, 0, 0) scale(1.08)`;
      backA.style.transform = sceneryTransform;
      const point = (z: number) => ({ x: width * (.5 + (bend(cameraZ+z-.8)*.65-cameraX)*lateral/(1+z*.9)), y: height * (.46 + .61/(1+z*1.9)), half: width * (mobile ? .13 : .12)/(1+z*.9) });
      const left: string[] = [], right: string[] = [], center: string[] = [];
      for (let k=0;k<=12;k++) { const p=point(k/2); left.push(`${(p.x-p.half).toFixed(1)},${p.y.toFixed(1)}`); right.unshift(`${(p.x+p.half).toFixed(1)},${p.y.toFixed(1)}`); center.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); }
      const path = `M${left.join('L')}L${right.join('L')}Z`; roadSurface.setAttribute('d', path); roadEdge.setAttribute('d', `M${center.join('L')}`);
      const nearIndex = Math.max(0, Math.floor(cameraZ));
      slots.forEach((node, slot) => {
        const index = nearIndex - 1 + slot, product = products[index];
        if (!product) { node.style.visibility = 'hidden'; return; }
        const distance = index - cameraZ;
        const visible = distance > -.65 && distance < (mobile ? 1.6 : 2.6) && productReveal > 0 && product.category === current.category;
        node.style.visibility = visible ? 'visible' : 'hidden'; node.setAttribute('aria-hidden', index === step && visible ? 'false' : 'true');
        if (!visible) return;
        const img = slotImages[slot];
        if (node.dataset.product !== product.id) { node.dataset.product = product.id; img.src = sceneImage(product.image); img.alt = product.title; }
        const depth = 1/(1 + Math.max(-.3,distance)*1.8);
        const worldX = bend(index) * .65 + side(index) * .55;
        const x = width * (.5 + (worldX-cameraX)*depth*lateral);
        const groundY = .46 + .61 / (1 + Math.max(.12,distance+.8)*1.9);
        const y = height * (groundY - (mobile ? .40 : .28)*depth);
        node.style.opacity = `${productReveal * (1-ease(range(-distance,.25,.65)))}`;
        node.style.zIndex = `${20-slot}`;
        node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${depth})`;
      });
      const focus = isTransition ? 0 : ease(range(arrival, .65, .98)) * productReveal;
      details.style.opacity = `${focus}`; details.style.visibility = focus ? 'visible' : 'hidden'; details.setAttribute('aria-hidden', focus < .5 ? 'true' : 'false');
      details.style.transform = mobile ? `translate3d(0, ${(1-focus)*8}px, 0)` : `translate3d(0, calc(-50% + ${(1-focus)*8}px), 0)`;
      foreground.style.transform = `translate3d(${Math.sin(cameraZ*.9)*12}px, ${Math.sin(cameraZ*1.5)*8}px, 0)`;
    }
    function tick(_time: number, delta: number) {
      if (disposed || document.hidden) return;
      const dt = Math.min(delta/1000,1/20), distance = target-progress;
      const limit = progress <= openingFraction ? openingFraction*.8*dt : .7*dt;
      progress = Math.abs(distance)<.000001 ? target : progress + clamp(distance*(1-Math.exp(-dt/.065)),-limit,limit);
      render();
      if (progress===target) { gsap.ticker.remove(tick); running=false; }
    }
    function follow(value: number) { target=value; if (!running) { running=true; gsap.ticker.add(tick); } }
    measure(); render();
    const observer = new IntersectionObserver(([entry]) => { root.dataset.visible = String(entry.isIntersecting); }, { threshold: 0 });
    observer.observe(stage);
    const context = gsap.context(() => {
      ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:self=>follow(self.progress),onRefreshInit:measure,onRefresh:self=>{render();follow(self.progress);}});
    },root);
    return () => { disposed=true; gsap.ticker.remove(tick); context.revert(); observer.disconnect(); };
  }, []);
  return <><link rel="preload" as="image" href={originalLogo}/><link rel="preload" as="image" href={cloudUrl}/><main ref={rootRef} className="journey" aria-label="Toy-On road journey"><div className="stage"><HeroStream/><div className="portal-preview" aria-hidden="true" style={{backgroundImage:`url(${categories[0].background})`}}/><LogoArtwork/><div className="portal"><RoadWorld/></div><CloudTransition/><p className="scroll-hint">Scroll Down to See<span aria-hidden="true">↓</span></p></div></main></>;
}
