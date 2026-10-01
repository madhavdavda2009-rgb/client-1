import { useLayoutEffect, useRef, useState } from 'react';
import { m, type MotionValue, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';
import { categories, productById, type Category, type Product } from './catalog';
import './three-road.css';
import { BrandO } from './LogoArtwork';

type JourneyWorld = Omit<Category, 'products'> & { products: Product[]; description: string; label: string };

const journeyWorlds: JourneyWorld[] = [
  { ...categories.find(c => c.id === 'christmas')!, products: categories.find(c => c.id === 'christmas')!.products.slice(0, 3).map(id => productById[id]), label: 'FESTIVE COLLECTION', description: 'Warm, sparkling shapes made for the moments that gather everyone together.' },
  { ...categories.find(c => c.id === 'dinosaurs')!, products: categories.find(c => c.id === 'dinosaurs')!.products.slice(0, 3).map(id => productById[id]), label: 'DINOSAUR WORLD', description: 'Bring big imaginations to life with playful characters built for roaring celebrations.' },
  { ...categories.find(c => c.id === 'halloween')!, products: categories.find(c => c.id === 'halloween')!.products.slice(0, 3).map(id => productById[id]), label: 'HALLOWEEN COLLECTION', description: 'A little spooky, a lot of fun — expressive designs for nights worth remembering.' },
];
const worldBackgrounds = ['/assets/scenery/supplied/chirstmas_bg.webp', '/assets/scenery/supplied/dino_bg.webp', '/assets/scenery/supplied/halloween_bg.webp'];

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
// A short scroll-controlled pause; never grab input or run an automatic camera zoom.
function stationTravel(value:number){
  for(const station of [.145,.455,.775]){
    const start=station-.045,end=station+.045,hold=.009;
    if(value<start||value>end)continue;
    if(Math.abs(value-station)<=hold)return station;
    const ease=(t:number)=>t*t*(3-2*t);
    return value<station?start+(station-start)*ease((value-start)/(station-hold-start)):station+(end-station)*ease((value-station-hold)/(end-station-hold));
  }
  return value;
}
const roadPoints = [
  new THREE.Vector3(0, 0, 12), new THREE.Vector3(-1.4, .15, 3), new THREE.Vector3(1.8, .2, -10),
  new THREE.Vector3(4.5, .35, -24), new THREE.Vector3(1.2, .5, -38), new THREE.Vector3(-4.7, .7, -52),
  new THREE.Vector3(-2.8, .9, -68), new THREE.Vector3(3.9, 1.1, -82), new THREE.Vector3(5.2, 1.25, -98),
  new THREE.Vector3(-.4, 1.45, -114), new THREE.Vector3(-5, 1.55, -132), new THREE.Vector3(-1.1, 1.65, -150),
  new THREE.Vector3(2.4, 1.72, -169),
];
// The user requested gentler bends; depth and category travel distances stay the same.
const roadCurve = new THREE.CatmullRomCurve3(roadPoints.map(point => new THREE.Vector3(point.x * .32, point.y, point.z)), false, 'catmullrom', .35);

// Sweep the raised cross section along the softly curved journey.
function roadRibbon(width = 5.8) {
  const segments = 220; const vertices: number[] = []; const uvs: number[] = []; const indices: number[] = [];
  const rings = 6; const bands = [2, 1, 0, 1, 2];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments; const p = roadCurve.getPointAt(t); const tangent = roadCurve.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    const edge = width * (0.92 + t * .12);
    const profile = [[-edge, -.30], [-edge, -.14], [-edge + .19, .035], [edge - .19, .035], [edge, -.14], [edge, -.30]];
    profile.forEach(([offset, elevation]) => { vertices.push(p.x + side.x * offset, p.y + elevation, p.z + side.z * offset); uvs.push((offset + edge) / (edge * 2), t * 36); });
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  for (let band = 0; band < rings - 1; band += 1) {
    const start = indices.length;
    for (let i = 0; i < segments; i += 1) {
      const a = i * rings + band, b = a + rings;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    geometry.addGroup(start, indices.length - start, bands[band]);
  }
  geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

export default function ThreeRoadWorld({ progress }: { progress: MotionValue<number> }) {
  const mount = useRef<HTMLDivElement>(null); const targetProgress = useRef(0); const reduced = useRef(false);
  const [active, setActive] = useState(0); const [focusedProduct, setFocusedProduct] = useState(0); const [ready, setReady] = useState(false);
  useMotionValueEvent(progress, 'change', value => { targetProgress.current = clamp(value); });

  useLayoutEffect(() => {
    const host = mount.current; if (!host) return;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(48, 1, .1, 180); camera.position.set(0, 3.15, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25)); renderer.setClearColor(0x000000, 0); host.appendChild(renderer.domElement);
    const ambient = new THREE.HemisphereLight(0xfffbeb, 0x34585a, 2.3); scene.add(ambient); const sun = new THREE.DirectionalLight(0xfff3d6, 3.2); sun.position.set(-7, 15, 8); scene.add(sun);
    const world = new THREE.Group(); scene.add(world);
    const roadMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xd2aa72, roughness: .86, metalness: .01, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0xf2ddad, roughness: .76, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x554a40, roughness: 1, side: THREE.DoubleSide }),
    ];
    // Only the road surface writes the shadow stencil: no shadow can spill onto the O or paper.
    Object.assign(roadMaterials[0], { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
    const road = new THREE.Mesh(roadRibbon(2.4), roadMaterials); world.add(road);
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x655443, roughness: 1, side: THREE.DoubleSide });
    const shoulder = new THREE.Mesh(roadRibbon(2.65), [shoulderMaterial,shoulderMaterial,shoulderMaterial]); shoulder.position.y = -.28; world.add(shoulder);
    // Clip only distant fragments outside the O opening, leaving the foreground road above it.
    const gateWindow={value:new THREE.Vector3(0,0,1e6)};
    const confineDistantRoad=(material:THREE.Material)=>{
      material.onBeforeCompile=shader=>{
        shader.uniforms.gateWindow=gateWindow;
        shader.fragmentShader='uniform vec3 gateWindow;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
          if(gateWindow.z>0.0 && gl_FragCoord.y>gateWindow.y && distance(gl_FragCoord.xy,gateWindow.xy)>gateWindow.z) discard;`);
      };
      material.customProgramCacheKey=()=> 'road-gate-opening-v1';
    };
    [...roadMaterials,shoulderMaterial].forEach(confineDistantRoad);
    const dashes = new THREE.Group(); for (let i = 0; i < 26; i += 1) { const t = i / 27 + .005; const p = roadCurve.getPointAt(t); const tangent = roadCurve.getTangentAt(t); const dash = new THREE.Mesh(new THREE.BoxGeometry(.12, .035, .85), new THREE.MeshBasicMaterial({ color: 0xfff7d8, transparent: true, opacity: .75 })); dash.position.copy(p); dash.position.y += .025; dash.rotation.y = Math.atan2(tangent.x, tangent.z); dashes.add(dash); } world.add(dashes); dashes.children.forEach(dash=>confineDistantRoad((dash as THREE.Mesh).material as THREE.Material));
    const productLinks = journeyWorlds.map((_, index) => [...host.querySelectorAll<HTMLAnchorElement>(`.three-featured-set:nth-child(${index + 1}) .three-featured-product`)]);
    productLinks.flat().forEach(link=>{link.style.left=link.style.top='0px';link.style.width='200px';link.style.height='244px';link.style.transformOrigin='0 0'});
    // Fixed stations on one road: bunch first, scenic O farther along, then the next station.
    const stops = [.17, .48, .80].map(p => .045 + p * .91);
    const gates = [.28, .60, .91].map(p => .045 + p * .91);
    const backgrounds=[...host.querySelectorAll<HTMLImageElement>('.three-category-backdrops img')];
    const portal = host.querySelector<SVGSVGElement>('.three-portal-o')!;
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
    const shadowContext = shadowCanvas.getContext('2d')!;
    const gradient = shadowContext.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(30,35,25,.65)'); gradient.addColorStop(.4, 'rgba(30,35,25,.35)'); gradient.addColorStop(1, 'rgba(30,35,25,0)');
    shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 64, 64);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilZPass: THREE.KeepStencilOp });
    const productShadows = [0, 1, 2].map(() => { const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial); shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 3; scene.add(shadow); return shadow; });
    const projectedBase = new THREE.Vector3(), projectedTop = new THREE.Vector3(), projectedEdge = new THREE.Vector3();
    const cameraAim = roadCurve.getPointAt(stops[0]); cameraAim.y += 1.1;
    let viewportWidth=1,viewportHeight=1,dirty=true,settledFrames=0,renderCount=0;
    const previousCamera=new THREE.Vector3(),previousAim=new THREE.Vector3();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'); reduced.current = media.matches; const onReduced = () => { reduced.current = media.matches; }; media.addEventListener('change', onReduced); let narrowRoad = false; const resize = () => { const w = host.clientWidth || 1; const h = host.clientHeight || 1;viewportWidth=w;viewportHeight=h;dirty=true; const nextNarrow = w < 620; if (nextNarrow !== narrowRoad) { road.geometry.dispose(); shoulder.geometry.dispose(); road.geometry = roadRibbon(nextNarrow ? 1.7 : 2.4); shoulder.geometry = roadRibbon(nextNarrow ? 1.9 : 2.65); narrowRoad = nextNarrow; } camera.aspect = w / h; camera.fov = w < 620 ? 62 : w < 900 ? 55 : 49; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 900 ? 1 : 1.25)); renderer.setSize(w, h, false); }; const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let raf = 0; let last = 0; let visible = true; const journey = host.closest<HTMLElement>('.journey'); const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(journey ?? host);
    const skyColors = [0xf7efdc, 0xf1f2d8, 0xf2e8df].map(color => new THREE.Color(color));
    const roadColors = [0xd8ba85, 0xc4ad78, 0xc99b79].map(value => new THREE.Color(value));
    const edgeColors = [0xf5e9d0, 0xe8edc6, 0xf0d3b7].map(value => new THREE.Color(value));
    const groundColors = [0x657a73, 0x47654b, 0x66505b].map(value => new THREE.Color(value));
    const blendedSky = new THREE.Color(); const blendedRoad = new THREE.Color(); const blendedEdge = new THREE.Color(); const blendedGround = new THREE.Color();
    scene.fog=null;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || journey?.dataset.closingProgress==='1.0000' || (journey?.dataset.phase === 'hero' && host.dataset.gateX!==undefined && !dirty)) { last = time; return; }
      const frameInterval = 1000 / 60 - 1;
      if (time - last < frameInterval) return;
      const dt = Math.min((time - last) / 1000 || .016, .5); last = time;
      const raw = stationTravel(clamp(targetProgress.current));
      if(!dirty && settledFrames>15 && Math.abs(raw-(camera.userData.progress??0))<.00001){last=time;return}
      previousCamera.copy(camera.position);previousAim.copy(cameraAim);
      const p = reduced.current ? raw : THREE.MathUtils.damp(THREE.MathUtils.clamp(camera.userData.progress ?? 0, 0, 1), raw, 4.5, dt);
      camera.userData.progress = p;
      // Travel uses the reference spline and timings; products are lightweight HTML above the road.
      const journeyT = .045 + p * .91; const current = roadCurve.getPointAt(journeyT); const tangent = roadCurve.getTangentAt(journeyT).normalize(); const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize(); const mobile = viewportWidth < 620;
      const compact = viewportWidth < 900;
      camera.position.lerp(current.clone().addScaledVector(tangent, compact ? -5 : -6).add(side.multiplyScalar(compact ? .1 : .35)).setY(current.y + (mobile ? 2.8 : 3.15)), reduced.current ? 1 : 1-Math.exp(-dt*9));
      const worldIndex = p < .345 ? 0 : p < .655 ? 1 : 2;
      // Constant forward distance and height: product focus cannot change camera pitch or FOV.
      const aim=current.clone().addScaledVector(tangent,6.5);aim.y=current.y+.7;
      cameraAim.lerp(aim, reduced.current ? 1 : 1-Math.exp(-dt*7));
      camera.lookAt(cameraAim);
      // The complete ribbon remains connected through all three category stops.
      if (worldIndex !== Number(host.dataset.active)) { host.dataset.active = String(worldIndex); setActive(worldIndex); }
      const segmentStart = [0, .345, .655][worldIndex], segmentEnd = [.345, .655, 1][worldIndex];
      const localPosition = clamp((p - segmentStart) / (segmentEnd - segmentStart)) * 3;
      const background01=THREE.MathUtils.smoothstep(p,.30,.39),background12=THREE.MathUtils.smoothstep(p,.61,.70);
      const weights=[1,background01,background12];
      backgrounds.forEach((image,index)=>{
        image.style.opacity=String(weights[index]);
        const start=[0,.345,.655][index],end=[.345,.655,1][index];
        image.style.transform=`scale(${1+clamp((p-start)/(end-start))*.08})`;
      });
      const nextProduct = Math.min(2, Math.floor(localPosition));
      if (nextProduct !== Number(host.dataset.focusedProduct)) { host.dataset.focusedProduct = String(nextProduct); setFocusedProduct(nextProduct); }
      const nextFov = mobile ? 52 : compact ? 55 : 49;
      if (Math.abs(camera.fov - nextFov) > .02) { camera.fov = nextFov; camera.updateProjectionMatrix(); }
      const screenWidth = viewportWidth, screenHeight = viewportHeight;
      camera.updateMatrixWorld();
      const roadEnd=roadCurve.getPointAt(.995).project(camera);
      host.dataset.roadEndX=((roadEnd.x+1)*screenWidth/2).toFixed(2);
      host.dataset.roadEndY=((1-roadEnd.y)*screenHeight/2).toFixed(2);
      // Project the O from its own road station, so it grows and passes the camera too.
      const gateCenter = roadCurve.getPointAt(gates[worldIndex]); gateCenter.y += 1.1;
      const gateView = gateCenter.clone().applyMatrix4(camera.matrixWorldInverse);
      const gateProjection = gateCenter.clone().project(camera);
      const gateRadius = mobile ? 8 : compact ? 12 : 16;
      const gateTop = gateCenter.clone().add(new THREE.Vector3(0, gateRadius, 0)).project(camera);
      const diameter = Math.min(Math.max(screenWidth, screenHeight) * 8, Math.abs(gateTop.y - gateProjection.y) * screenHeight);
      portal.style.left = portal.style.top = '0px';
      // Keep the illustration raster size stable and move its compositor layer instead.
      portal.style.width = portal.style.height = '1024px';
      portal.style.transform = `translate3d(${(gateProjection.x + 1) * screenWidth / 2 - 512}px,${(1 - gateProjection.y) * screenHeight / 2 - 512}px,0) scale(${diameter / 1024})`;
      const gateEntry=worldIndex===0?1:THREE.MathUtils.smoothstep(p,[0,.345,.655][worldIndex],[0,.375,.685][worldIndex]);
      portal.style.opacity = String(THREE.MathUtils.smoothstep(-gateView.z, .8, 4)*gateEntry);
      const gateX = (gateProjection.x + 1) * screenWidth / 2, gateY = (1 - gateProjection.y) * screenHeight / 2;
      const pixelRatio=renderer.getPixelRatio();
      gateWindow.value.set(gateX*pixelRatio,(screenHeight-gateY)*pixelRatio,Math.max(1,diameter*.15)*pixelRatio);

      host.dataset.gateX=gateX.toFixed(2);host.dataset.gateY=gateY.toFixed(2);
      const furthestCorner = Math.hypot(Math.max(Math.abs(gateX), Math.abs(screenWidth - gateX)), Math.max(Math.abs(gateY), Math.abs(screenHeight - gateY)));
      // Once the clear center covers the viewport there is no artwork left to paint.
      const gateOutsideViewport = diameter * .155 > furthestCorner;
      const holeRadius=diameter*.15;
      const holeOffscreen=gateX+holeRadius<0||gateX-holeRadius>screenWidth||gateY+holeRadius<0||gateY-holeRadius>screenHeight;
      // A passed or off-screen gate must never clip the continuous foreground road.
      if(gateView.z> -4 || gateOutsideViewport || holeOffscreen)gateWindow.value.z=-1;
      host.dataset.roadMask=gateWindow.value.z>0?'gate':'none';
      portal.style.visibility = gateView.z < -.8 && !gateOutsideViewport ? 'visible' : 'hidden';
      host.dataset.gateDiameter = diameter.toFixed(1);
      host.dataset.gatePassed = String(gateView.z >= -.8);
      // Each bunch has one permanent stop on the spline; only the camera travels towards it.
      const stop = roadCurve.getPointAt(stops[worldIndex]);
      const stopTangent = roadCurve.getTangentAt(stops[worldIndex]).normalize();
      const stopSide = new THREE.Vector3().crossVectors(stopTangent, new THREE.Vector3(0, 1, 0)).normalize();
      const physicalWidth = mobile ? 1.3 : 2.25;
      const bunchDepth = -stop.clone().applyMatrix4(camera.matrixWorldInverse).z;
      const bunchWidth = physicalWidth * screenHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(.1, bunchDepth));
      const reveal = THREE.MathUtils.smoothstep(bunchWidth, mobile ? 55 : 90, mobile ? 85 : 140);
      const leave = 1 - THREE.MathUtils.smoothstep(bunchWidth, mobile ? 130 : 260, mobile ? 175 : 350);
      const opacity = bunchDepth > 0 ? reveal * leave : 0;
      productLinks[worldIndex].forEach((link, slot) => {
        const base = stop.clone().addScaledVector(stopSide, [-1, 0, 1][slot] * (mobile ? .65 : 1.2));
        base.y += .065;
        if (slot === 1) base.addScaledVector(stopTangent, .45);
        projectedBase.copy(base).project(camera);
        projectedTop.copy(base).add(new THREE.Vector3(0, physicalWidth * 1.22, 0)).project(camera);
        projectedEdge.copy(base).addScaledVector(stopSide, physicalWidth).project(camera);
        const width = Math.abs(projectedEdge.x - projectedBase.x) * screenWidth / 2;
        const x = (projectedBase.x + 1) * screenWidth / 2;
        const y = (1 - projectedBase.y) * screenHeight / 2;
        const height=Math.abs(projectedTop.y-projectedBase.y)*screenHeight/2;
        link.style.setProperty('--product-x',`${x}px`);link.style.setProperty('--product-y',`${y}px`);
        link.style.setProperty('--product-sx',String(width/200));link.style.setProperty('--product-sy',String(height/244));
        const image=link.querySelector('img')!;
        const aspect=image.naturalWidth/(image.naturalHeight||image.naturalWidth||1);
        const baseImageWidth=Math.min(200,244*aspect);
        const imageWidth=Math.min(width,height*aspect);
        link.style.setProperty('--image-sx',String(imageWidth/(baseImageWidth*(width/200)||1)));
        link.style.setProperty('--image-sy',String(imageWidth/(baseImageWidth*(height/244)||1)));

        link.style.opacity = String(opacity); link.style.pointerEvents = opacity > .5 ? 'auto' : 'none';
        link.style.visibility = opacity > .01 ? 'visible' : 'hidden';
        link.tabIndex = opacity > .5 ? 0 : -1;
        link.style.setProperty('--balloon-tilt',`${[-8,1,8][slot]}deg`);
        const shadow = productShadows[slot]; shadow.position.copy(base); shadow.position.y = stop.y + .07;
        shadow.rotation.z = -Math.atan2(stopTangent.x, stopTangent.z);
        shadow.scale.set(physicalWidth * 1.2, physicalWidth * .55, 1);
        shadow.visible = opacity > .01;
        host.dataset.productsVisible = String(opacity > .5);
      });
      const mix01 = THREE.MathUtils.smoothstep(p, .30, .39), mix12 = THREE.MathUtils.smoothstep(p, .61, .70);
      blendedSky.copy(skyColors[0]).lerp(skyColors[1], mix01).lerp(skyColors[2], mix12);
      blendedRoad.copy(roadColors[0]).lerp(roadColors[1], mix01).lerp(roadColors[2], mix12);
      blendedEdge.copy(edgeColors[0]).lerp(edgeColors[1], mix01).lerp(edgeColors[2], mix12);
      blendedGround.copy(groundColors[0]).lerp(groundColors[1], mix01).lerp(groundColors[2], mix12);
      roadMaterials[0].color.copy(blendedRoad); roadMaterials[1].color.copy(blendedEdge); shoulderMaterial.color.copy(blendedGround);
      renderer.setClearColor(blendedSky, 0);
      renderer.render(scene, camera);dirty=false;
      settledFrames=Math.abs(raw-p)<.00001 && previousCamera.distanceToSquared(camera.position)<.0000001 && previousAim.distanceToSquared(cameraAim)<.0000001?settledFrames+1:0;
      host.dataset.renderCount=String(++renderCount);
    };
    raf = requestAnimationFrame(tick); setReady(true);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); intersection.disconnect(); media.removeEventListener('change', onReduced); const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } }); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); shadowTexture.dispose(); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);

  const world = journeyWorlds[active];
  return <div className="three-road-world" ref={mount} data-ready={ready} data-active={active}>
    <div className="three-category-backdrops" aria-hidden="true">{worldBackgrounds.map((src,index)=><img key={src} src={src} alt="" className={active===index?'is-active':''} decoding="async"/>)}</div>
    <BrandO active={active}/>
    <div className="three-featured-products" onPointerMove={event=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.parentElement?.style.setProperty('--portal-turn',`${((event.clientX-rect.left)/rect.width-.5)*3}deg`)}} onPointerLeave={event=>event.currentTarget.parentElement?.style.setProperty('--portal-turn','0deg')}>{journeyWorlds.map((item, index) => <div className={`three-featured-set${active === index ? ' is-active' : ''}`} aria-hidden={active !== index} key={item.id}>{item.products.map((product, productIndex) => <a href={`/products/${product.slug}`} className={`three-featured-product${focusedProduct === productIndex ? ' is-focused' : ''}`} key={product.id} tabIndex={active === index ? 0 : -1} aria-label={`View ${product.title}`}><picture><source media="(max-width: 600px)" srcSet={product.thumb} /><img src={product.image} alt={product.title} loading="eager" decoding="async" /></picture></a>)}</div>)}</div>
    <div className="three-world-ui" aria-live="polite">
      {journeyWorlds.map((item, index) => <m.div key={item.id} className="three-world-copy" animate={{ opacity: active === index ? 1 : 0, y: active === index ? 0 : 14 }} transition={{ duration: .45 }} aria-hidden={active !== index}><span className="eyebrow">{item.label}</span><h2>{item.title}</h2><p>{item.description}</p><a className="three-world-cta" tabIndex={active === index ? 0 : -1} style={{ visibility: active === index ? "visible" : "hidden" }} href={`/categories/${item.id}`}>Explore collection <span aria-hidden="true">↗</span></a></m.div>)}
      <span className="three-world-progress">{String(active + 1).padStart(2, '0')} / 03</span><a className="three-world-browse" href="/products">Browse all 96 designs ↗</a>
    </div>
    <span className="three-world-sr">Travelling through the Toy-On world: {world.title}. Featured designs are linked to their product pages.</span>
  </div>;
}

export { journeyWorlds };
