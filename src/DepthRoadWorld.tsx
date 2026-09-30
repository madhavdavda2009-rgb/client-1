import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { m, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { categories, productById } from './catalog';
import Atmosphere from './Atmosphere';
import { cloudUrl } from './CloudTransition';
import './depth.css';

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const part = (n: number, a: number, b: number) => clamp((n - a) / (b - a));
const ease = (n: number) => n * n * (3 - 2 * n);
const sides = [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1];
const scenery = {
  winter: '/assets/scenery/winter.webp',
  garden: '/assets/scenery/garden.webp',
  twilight: '/assets/scenery/twilight.webp',
};
function sceneryFor(id: string) {
  if (id === 'christmas') return scenery.winter;
  if (id === 'halloween' || id === 'swords' || id === 'cartoon-and-masked-faces') return scenery.twilight;
  return scenery.garden;
}
function terrainFor(id: string) {
  if (id === 'christmas') return { ground: '#e7f0f6', road: '#d5e5ed' };
  if (id === 'halloween' || id === 'swords' || id === 'cartoon-and-masked-faces') return { ground: '#8872a6', road: '#a88cb6' };
  return { ground: '#a7be74', road: '#c4c695' };
}

// A perspective projection of one continuous road. Its centre is #cameraPath.
function roadGeometry(turn: number) {
  const horizon = 500 + turn * 18;
  const middle = 500 + turn * 95;
  const near = 500 + turn * 145;
  const foot = 500 + turn * 96;
  const center = `M${horizon} 332 C${middle} 450 ${near} 715 ${foot} 1060`;
  const surface = `M${horizon - 12} 332 C${middle - 32} 452 ${near - 132} 715 ${foot - 355} 1060 L${foot + 355} 1060 C${near + 132} 715 ${middle + 32} 452 ${horizon + 12} 332 Z`;
  const shoulder = `M${horizon - 17} 332 C${middle - 39} 452 ${near - 142} 715 ${foot - 375} 1060 L${foot + 375} 1060 C${near + 142} 715 ${middle + 39} 452 ${horizon + 17} 332 Z`;
  return { center, surface, shoulder };
}

const placements = [
  { x: 4, y: 25, width: 34, rotate: -5, layer: 2 },
  { x: 45, y: 0, width: 30, rotate: 4, layer: 1 },
  { x: 67, y: 30, width: 32, rotate: 5, layer: 2 },
  { x: 34, y: 44, width: 39, rotate: -2, layer: 3 },
];

export default function DepthRoadWorld({ progress }: { progress: MotionValue<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const road = useRef<SVGSVGElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const cluster = useRef<HTMLDivElement>(null);
  const nextCluster = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLImageElement>(null);
  const activeIndex = useRef(0);
  const gateTargetIndex = useRef(1);
  const [active, setActive] = useState(0);
  const [gateTarget, setGateTarget] = useState(1);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  function paint(value: number) {
    const node = root.current;
    if (!node || !road.current || !cluster.current || !plane.current) return;
    const raw = Math.min(categories.length - .000001, value * categories.length);
    const index = Math.floor(raw);
    const local = raw - index;
    const category = categories[index];
    if (activeIndex.current !== index) { activeIndex.current = index; setActive(index); }
    const arrival = ease(part(local, .06, .52));
    const release = ease(part(local, .86, 1));
    const revealNext = ease(part(local, .78, 1));
    const side = sides[index];
    const turn = -side * (.64 + .2 * Math.sin(local * Math.PI)) + .12 * Math.sin(index * .9 + local * 2);
    const geometry = roadGeometry(turn);
    road.current.querySelector('#cameraPath')?.setAttribute('d', geometry.center);
    road.current.querySelector('.depth-road-shoulder')?.setAttribute('d', geometry.shoulder);
    road.current.querySelector('.depth-road-surface')?.setAttribute('d', geometry.surface);
    road.current.querySelector('.depth-road-center')?.setAttribute('d', geometry.center);
    const { width, height } = node.getBoundingClientRect();
    const entering = index > 0 ? 1 - ease(part(local, 0, .24)) : 0;
    const leaving = index < categories.length - 1 ? ease(part(local, .78, 1)) : 0;
    const gate = Math.max(entering, leaving);
    const targetIndex = entering > 0 ? index : Math.min(index + 1, categories.length - 1);
    if (gateTargetIndex.current !== targetIndex) { gateTargetIndex.current = targetIndex; setGateTarget(targetIndex); }
    const radius = 6 + gate * Math.hypot(width, height) * 1.15;
    node.style.setProperty('--gate-radius', `${radius}px`);
    node.style.setProperty('--gate-x', `${width * (.5 + turn * .018)}px`);
    node.style.setProperty('--gate-cloud', `${Math.sin(gate * Math.PI) * .64}`);
    node.dataset.gate = gate > .006 ? 'true' : 'false';
    const stopX = width * (.5 + side * .28);
    cluster.current.style.transform = `translate3d(${stopX}px,${height * .47}px,0) translate(-50%,-50%)`;
    cluster.current.style.opacity = `${1 - ease(part(local, .92, 1))}`;
    // The product has a fixed world anchor. Move the camera plane toward it.
    plane.current.style.transform = `translate3d(${-side * width * arrival * .105}px,${height * arrival * .035 + release * height * .035}px,0) scale(${1 + arrival * .16 + release * .06})`;
    if (nextCluster.current) {
      const nextSide = sides[Math.min(index + 1, sides.length - 1)];
      const nx = width * (.5 + nextSide * .32);
      nextCluster.current.style.transform = `translate3d(${nx}px,${height * .39}px,-110px) translate(-50%,-50%) scale(.38)`;
      nextCluster.current.style.opacity = `${revealNext * .7}`;
    }
    if (far.current) far.current.style.transform = `translate3d(${turn * -16}px,${arrival * -23}px,-180px) scale(${1.25 + arrival * .09})`;
    node.style.setProperty('--depth-next', `${revealNext}`);
    node.style.setProperty('--depth-arrival', `${arrival}`);
    node.style.setProperty('--depth-dashes', `${-local * 360}px`);
    node.style.setProperty('--world-sky', category.sky);
    node.style.setProperty('--world-ground', terrainFor(category.id).ground);
    node.style.setProperty('--world-road', terrainFor(category.id).road);
    node.style.setProperty('--world-ink', category.ink);
    node.dataset.category = category.id;
    node.dataset.productSide = side < 0 ? 'left' : 'right';
    node.dataset.phase = local < .48 ? 'approach' : local < .86 ? 'hold' : 'release';
    const name = Math.min(3, Math.floor(part(local, .45, .85) * 4));
    if (name !== selected) setSelected(name);
  }

  useMotionValueEvent(progress, 'change', paint);
  useLayoutEffect(() => {
    const resize = new ResizeObserver(() => paint(progress.get()));
    resize.observe(root.current!);
    paint(progress.get());
    return () => resize.disconnect();
  }, [progress]);
  useEffect(() => {
    const sync = () => setPaused(document.documentElement.dataset.ambientPaused === 'true');
    sync(); window.addEventListener('toyon:motion', sync);
    return () => window.removeEventListener('toyon:motion', sync);
  }, []);
  const category = categories[active];
  const next = categories[Math.min(active + 1, categories.length - 1)];
  const terrain = terrainFor(category.id);
  const products = category.products.slice(0, 4).map(id => productById[id]);
  const featured = products[selected] ?? products[0];
  const nextProducts = next.products.slice(0, 3).map(id => productById[id]);
  return <div className="depth-world" ref={root}>
    <Atmosphere progress={progress}/>
    <div className="depth-far"><img ref={far} src={sceneryFor(category.id)} alt="" fetchPriority={active === 0 ? 'high' : undefined} /></div>
    <div className="depth-next-world" style={{ backgroundImage: `url(${sceneryFor(next.id)})` }} />
    <div className="depth-light" aria-hidden="true" />
    <div className="depth-camera-plane" ref={plane}>
      <div className="depth-midland" aria-hidden="true"><span/><span/><span/></div>
      <svg ref={road} className="depth-road" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="depth-road-paint" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fff9df" stopOpacity=".35"/><stop offset=".55" stopColor={terrain.road}/><stop offset="1" stopColor={terrain.road}/></linearGradient><linearGradient id="depth-road-glow" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ffffff" stopOpacity=".2"/><stop offset="1" stopColor="#ffffff" stopOpacity=".75"/></linearGradient></defs>
      <path className="depth-road-shoulder" fill={terrain.ground}/>
      <path className="depth-road-surface" fill="url(#depth-road-paint)"/>
      <path className="depth-road-center" fill="none" stroke="url(#depth-road-glow)" strokeWidth="4" strokeDasharray="7 32"/>
      <path id="cameraPath" fill="none" stroke="none"/>
      </svg>
      <div className="depth-foreground" aria-hidden="true"><span/><span/></div>
      <div className="depth-products" ref={cluster}>
      {products.map((product, i) => <m.a href={`/products/${product.slug}`} className="depth-product" key={product.id} style={{ left: `${placements[i].x}%`, top: `${placements[i].y}%`, width: `${placements[i].width}%`, zIndex: placements[i].layer, rotate: `${placements[i].rotate}deg` } as CSSProperties} aria-label={`Explore ${product.title}`} whileHover={{ scale: 1.045 }} whileTap={{ scale: .98 }}>
        <span className="depth-contact-shadow"/>
        <m.img src={product.image} alt={product.title} loading={active === 0 ? 'eager' : 'lazy'} animate={!paused ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 7 + i, repeat: paused ? 0 : Infinity, ease: 'easeInOut' }}/>
      </m.a>)}
      </div>
      <div className="depth-products depth-products-next" ref={nextCluster} aria-hidden="true">{nextProducts.map((product, i) => <img key={product.id} src={product.thumb} alt="" style={{ left: `${placements[i].x}%`, top: `${placements[i].y}%`, width: `${placements[i].width}%` }}/>)}</div>
    </div>
    <div className="depth-world-gate" aria-hidden="true"><div className="depth-gate-window" style={{ backgroundImage: `url(${sceneryFor(categories[gateTarget].id)})` }}><img src={cloudUrl} alt="" /></div><div className="depth-gate-ring" /></div>
    <section className="depth-caption" aria-label={`${category.title}: ${featured.title}`}><a href={`/categories/${category.id}`} className="depth-category">{category.title}</a><h2>{featured.title}</h2><a href={`/products/${featured.slug}`} className="depth-explore">Explore product ↗</a></section>
    <a href="/products" className="journey-browse">Browse all products ↗</a><span className="journey-position">{String(active + 1).padStart(2, '0')} / {categories.length}</span>
  </div>;
}
