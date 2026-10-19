import { useEffect, useMemo, useRef, useState } from 'react';
import { m, AnimatePresence, type MotionValue, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';
import Link from 'next/link';
import { categoryById, productAlt, productById, products, roads, themeIndex, type Category, type Product, type RoadTheme } from './catalog';
import './three-road.css';
import './animated-backdrops.css';
import { MotionLink, Reveal, softSpring } from './MotionUI';
import { BrandO } from './LogoArtwork';
import { RenderQuality } from './render-quality';
import { useRequestedWorlds,prepareWorld,thumbnailSet,detailSet,recoverImage } from './assets';
import { roadLayout } from './road-layout';
import type { RoadScene } from './road-scene';
import StationBackdrop from './StationBackdrop';

type JourneyWorld = Omit<Category, 'products'> & { products: Product[]; description: string; label: string; theme: RoadTheme; roadId: string; scene: RoadScene };

// Road stations come from the CMS (roads + products on roads), already capped to the scene's slot capacity.
function buildJourneyWorlds(): JourneyWorld[] {
  return roads.filter(road => categoryById[road.category]).map(road => ({ ...categoryById[road.category], id: road.category, roadId: road.id, products: road.products.filter(id => productById[id]).map(id => productById[id]), label: road.label, description: road.description, theme: road.theme, scene: road.scene ?? {} }));
}

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
// The road follows the scroll directly (no pause at stations: a pause made scrolling feel stuck).
const roadPoints = [
  new THREE.Vector3(0, 0, 12), new THREE.Vector3(-1.4, .15, 3), new THREE.Vector3(1.8, .2, -10),
  new THREE.Vector3(4.5, .35, -24), new THREE.Vector3(1.2, .5, -38), new THREE.Vector3(-4.7, .7, -52),
  new THREE.Vector3(-2.8, .9, -68), new THREE.Vector3(3.9, 1.1, -82), new THREE.Vector3(5.2, 1.25, -98),
  new THREE.Vector3(-.4, 1.45, -114), new THREE.Vector3(-5, 1.55, -132), new THREE.Vector3(-1.1, 1.65, -150),
  new THREE.Vector3(2.4, 1.72, -169),
];
// The user requested gentler bends; depth and category travel distances stay the same.
const bend = (point: THREE.Vector3) => new THREE.Vector3(point.x * .22, point.y, point.z);
// Centripetal splines never overshoot or kink between control points.
const spline = (points: THREE.Vector3[]) => new THREE.CatmullRomCurve3(points, false, 'centripetal');
// The original road fits three stations. Longer journeys repeat its bends so every station keeps the same length;
// scale is the road's length relative to the original.
function buildRoad(lengthScale: number) {
  const points = roadPoints.map(bend);
  const original = spline(points);
  if (lengthScale <= 1) return { curve: original, scale: 1 };
  const originalLength = original.getLength();
  const steps = roadPoints.slice(3).map((point, i) => bend(point.clone().sub(roadPoints[i + 2])));
  let curve = original;
  for (let i = 0; curve.getLength() < originalLength * lengthScale + 1; i += 1) {
    points.push(points[points.length - 1].clone().add(steps[i % steps.length]));
    curve = spline(points);
  }
  return { curve, scale: curve.getLength() / originalLength };
}

// Sweep the raised cross section along the softly curved journey.
function roadRibbon(roadCurve: THREE.CatmullRomCurve3, scale: number, width = 5.8) {
  const segments = Math.round(220 * scale); const vertices: number[] = []; const uvs: number[] = []; const indices: number[] = [];
  const rings = 6; const bands = [2, 1, 0, 1, 2];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments; const p = roadCurve.getPointAt(t); const tangent = roadCurve.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    const edge = width * (0.92 + t * .12);
    const profile = [[-edge, -.30], [-edge, -.14], [-edge + .19, .035], [edge - .19, .035], [edge, -.14], [edge, -.30]];
    profile.forEach(([offset, elevation]) => { vertices.push(p.x + side.x * offset, p.y + elevation, p.z + side.z * offset); uvs.push((offset + edge) / (edge * 2), t * 36 * scale); });
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
  const journeyWorlds=useMemo(buildJourneyWorlds,[]);const layout=useMemo(()=>roadLayout(journeyWorlds.length),[journeyWorlds]);const roadPath=useMemo(()=>buildRoad(layout.lengthScale),[layout]);const backdropPalettes=journeyWorlds.map(world=>world.theme);const portalThemes=journeyWorlds.map(world=>themeIndex(world.theme));const extraDesigns=journeyWorlds.map(world=>world.products.slice(3));
  const requested=useRequestedWorlds();const wake=useRef(()=>{});const [extrasEnabled,setExtrasEnabled]=useState(false);
  const [contextLost,setContextLost]=useState(false);
  if(contextLost)throw new Error('WebGL context unavailable');
  const [visibleBunch,setVisibleBunch]=useState<number|null>(null);
  const lastBunch=useRef<number|null>(null);
  const mount = useRef<HTMLDivElement>(null); const targetProgress = useRef(0); const reduced = useRef(false);
  const [active, setActive] = useState(0); const [ready, setReady] = useState(false);
  useMotionValueEvent(progress, 'change', value => { targetProgress.current = clamp(value);if(value>.01&&!extrasEnabled)setExtrasEnabled(true);prepareWorld(value*layout.count>.15?Math.min(layout.count-1,layout.stationAt(value)+1):0);wake.current(); });

  useEffect(() => {
    const host = mount.current; if (!host) return;
    const {curve:roadCurve,scale:roadScale}=roadPath;const ribbon=(width:number)=>roadRibbon(roadCurve,roadScale,width);
    // Position along the (possibly extended) road for journey progress p.
    const along=(p:number)=>layout.distance(p)/roadScale;const {stations}=layout;
    const themes=journeyWorlds.map(world=>themeIndex(world.theme));
    const touchDevice=matchMedia('(hover:none), (pointer:coarse)').matches;
    // Start loading the first station's photos on the visitor's first scroll (or straight away if the page opens scrolled).
    const startLoading=()=>prepareWorld(0);
    if(scrollY>0)startLoading();else window.addEventListener('scroll',startLoading,{once:true,passive:true});
    // Interactive backgrounds follow the mouse (CSS vars --bg-px/--bg-py, -1..1); at most one update per frame.
    // Set on the background layer only (not the whole scene) so a mouse move restyles as little as possible.
    const backdropLayer=host.querySelector<HTMLElement>('.three-category-backdrops');
    let pointerRaf=0,pointerX=0,pointerY=0;
    const onPointer=(event:PointerEvent)=>{pointerX=event.clientX/innerWidth*2-1;pointerY=event.clientY/innerHeight*2-1;if(!pointerRaf)pointerRaf=requestAnimationFrame(()=>{pointerRaf=0;backdropLayer?.style.setProperty('--bg-px',pointerX.toFixed(3));backdropLayer?.style.setProperty('--bg-py',pointerY.toFixed(3))})};
    if(!touchDevice)window.addEventListener('pointermove',onPointer,{passive:true});
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(48, 1, .1, 180); camera.position.set(0, 3.15, 10);
    const quality=new RenderQuality(host.clientWidth);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: false, powerPreference: 'high-performance' }); renderer.setPixelRatio(quality.pixelRatio(host.clientWidth)); renderer.setClearColor(0x000000, 0); host.appendChild(renderer.domElement);
    const loseContext=(event:Event)=>{event.preventDefault();setContextLost(true)};renderer.domElement.addEventListener('webglcontextlost',loseContext);
    const ambient = new THREE.HemisphereLight(0xfffbeb, 0x34585a, 2.3); scene.add(ambient); const sun = new THREE.DirectionalLight(0xfff3d6, 3.2); sun.position.set(-7, 15, 8); scene.add(sun);
    const world = new THREE.Group(); scene.add(world);
    const roadMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xd2aa72, roughness: .86, metalness: .01, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0xf2ddad, roughness: .76, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x554a40, roughness: 1, side: THREE.DoubleSide }),
    ];
    const road = new THREE.Mesh(ribbon(2.4), roadMaterials); world.add(road);
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x655443, roughness: 1, side: THREE.DoubleSide });
    const shoulderGeometry=ribbon(2.65);shoulderGeometry.clearGroups();const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial); shoulder.position.y = -.28; world.add(shoulder);
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
    const dashGeometry=new THREE.BoxGeometry(.12,.035,.85),dashMaterial=new THREE.MeshBasicMaterial({color:0xfff7d8,transparent:true,opacity:.75});
    const dashCount=Math.round(26*roadScale);
    confineDistantRoad(dashMaterial);const dashes=new THREE.InstancedMesh(dashGeometry,dashMaterial,dashCount),dashPose=new THREE.Object3D();
    for(let i=0;i<dashCount;i++){const t=i/(dashCount+1)+.005,p=roadCurve.getPointAt(t),tangent=roadCurve.getTangentAt(t);dashPose.position.copy(p);dashPose.position.y+=.025;dashPose.rotation.y=Math.atan2(tangent.x,tangent.z);dashPose.updateMatrix();dashes.setMatrixAt(i,dashPose.matrix)}
    dashes.instanceMatrix.needsUpdate=true;dashes.computeBoundingSphere();world.add(dashes);
    const productLinks = journeyWorlds.map((_, index) => [...host.querySelectorAll<HTMLAnchorElement>(`.three-featured-set:nth-child(${index + 1}) .three-featured-product`)]);
    productLinks.flat().forEach(link=>{link.style.left=link.style.top='0px';link.style.width='200px';link.style.height='244px';link.style.transformOrigin='0 0';link.style.visibility='hidden';link.style.willChange='auto'});
    // Fixed stations on one road: bunch first, scenic O farther along, then the next station.
    const stops = stations.map(station => along(station.stop));
    const gates = stations.map(station => along(station.gate));
    const backgrounds=[...host.querySelectorAll<HTMLDivElement>('.animated-category-backdrop')];
    const backdropMotion:Array<boolean|undefined>=stations.map(()=>undefined);
    const portal = host.querySelector<HTMLElement>('.three-portal-o')!;
    portal.style.left=portal.style.top='0px';portal.style.width=portal.style.height='1024px';
    const current=new THREE.Vector3(),tangent=new THREE.Vector3(),side=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),aim=new THREE.Vector3(),roadEnd=new THREE.Vector3(),gateView=new THREE.Vector3(),gateProjection=new THREE.Vector3(),gateTop=new THREE.Vector3(),base=new THREE.Vector3(),bunchView=new THREE.Vector3();
    const fixedGates=gates.map(t=>{const point=roadCurve.getPointAt(t);point.y+=1.1;return point});
    const fixedStops=stops.map(t=>{const point=roadCurve.getPointAt(t),direction=roadCurve.getTangentAt(t).normalize();return {point,direction,side:new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,1,0)).normalize()}});
    const extraPositions:number[][]=stations.map(station=>station.extras);
    const extraLinks=journeyWorlds.map((_,index)=>[...host.querySelectorAll<HTMLAnchorElement>(`.three-extra-set:nth-child(${index+1}) .three-extra-product`)]);
    const extraImages=extraLinks.map(links=>links.map(link=>link.querySelector('img')!));
    const extraStops=extraPositions.map(positions=>positions.map((p,i)=>{const point=roadCurve.getPointAt(along(p)),direction=roadCurve.getTangentAt(along(p)).normalize(),side=new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,1,0)).normalize();return {point,direction,side,sign:i%2?-1:1}}));
    extraLinks.flat().forEach(link=>{link.style.left=link.style.top='0px';link.style.width='200px';link.style.height='244px';link.style.transformOrigin='0 0';link.style.visibility='hidden';link.style.willChange='auto';link.tabIndex=-1});
    // Reuse numeric projection bounds instead of reading DOM layout during scroll.
    const occupied:Array<{left:number;right:number;top:number;bottom:number}>=[];
    const allImages=[...extraImages.flat()];
    const productImages=productLinks.map(group=>group.map(link=>link.querySelector('img')!));
    const projectedBase = new THREE.Vector3(), projectedTop = new THREE.Vector3(), projectedEdge = new THREE.Vector3();
    const cameraAim = roadCurve.getPointAt(stops[0]); cameraAim.y += 1.1;
    let viewportWidth=1,viewportHeight=1,dirty=true,settledFrames=0,renderCount=0;
    // Products ease towards their target opacity instead of popping (image loads, overlaps, station changes).
    const shown=new Map<HTMLElement,number>();let fading=false;
    const fadeTo=(link:HTMLElement,target:number,dt:number)=>{
      const previous=shown.get(link)??0;
      const next=reduced.current||Math.abs(target-previous)<.004?target:previous+(target-previous)*(1-Math.exp(-dt*9));
      shown.set(link,next);if(next!==target)fading=true;return next;
    };
    const loaded=(image:HTMLImageElement|undefined)=>!!image&&image.complete&&image.naturalWidth>0;
    // Products passing behind the collection text get a light blur so the text stays readable without a box.
    // The text block is measured a few times a second (not every frame) in the scene's own coordinates.
    type Box={left:number;right:number;top:number;bottom:number};
    let textBox:Box|null=null,textBoxAt=-1e9;
    const measureText=(time:number)=>{
      if(time-textBoxAt<250)return;textBoxAt=time;
      const copy=[...host.querySelectorAll<HTMLElement>('.three-world-copy')].pop(),scene=host.getBoundingClientRect(),r=copy?.getBoundingClientRect();
      textBox=r&&r.width&&r.height?{left:r.left-scene.left-10,right:r.right-scene.left+10,top:r.top-scene.top-10,bottom:r.bottom-scene.top+10}:null;
    };
    const blurBehindText=(link:HTMLElement,box:Box|null)=>{
      let px=0;
      if(box&&textBox){
        const overlapX=Math.max(0,Math.min(box.right,textBox.right)-Math.max(box.left,textBox.left)),overlapY=Math.max(0,Math.min(box.bottom,textBox.bottom)-Math.max(box.top,textBox.top));
        const covered=overlapX*overlapY/Math.max(1,(box.right-box.left)*(box.bottom-box.top));
        px=covered>.45?4:covered>.15?2.5:covered>0?1.5:0;
      }
      if(link.dataset.blur!==String(px)){link.dataset.blur=String(px);link.style.filter=px?`blur(${px}px)`:'';}
    };
    const previousCamera=new THREE.Vector3(),previousAim=new THREE.Vector3();
    const refreshProducts=()=>{dirty=true;wake.current()};allImages.push(...productImages.flat());allImages.forEach(image=>image.addEventListener('load',refreshProducts));
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'); reduced.current = media.matches; const onReduced = () => { reduced.current = media.matches;dirty=true;wake.current(); }; media.addEventListener('change', onReduced); let narrowRoad = false; const resize = () => { const w = host.clientWidth || 1; const h = host.clientHeight || 1;viewportWidth=w;viewportHeight=h;dirty=true; const nextNarrow = w < 620; if (nextNarrow !== narrowRoad) { road.geometry.dispose(); shoulder.geometry.dispose(); road.geometry = ribbon(nextNarrow ? 1.7 : 2.4); shoulder.geometry = ribbon(nextNarrow ? 1.9 : 2.65);shoulder.geometry.clearGroups(); narrowRoad = nextNarrow; } camera.aspect = w / h; camera.fov = w < 620 ? 52 : w < 900 ? 55 : 49; camera.updateProjectionMatrix(); renderer.setPixelRatio(quality.pixelRatio(w));host.dataset.quality=quality.tier; renderer.setSize(w, h, false);wake.current(); }; let resizeRaf=0;const observer = new ResizeObserver(()=>{cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(resize)}); observer.observe(host); resize();
    let raf = 0; let last = 0; let visible = true; const journey = host.closest<HTMLElement>('.journey'); const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting;if(visible)wake.current(); }); intersection.observe(journey ?? host);
    // Scene colours per theme (festive, dinosaur, halloween); each station uses its road's theme.
    const skyColors = [0xf7efdc, 0xf1f2d8, 0xf2e8df].map(color => new THREE.Color(color));
    const roadColors = [0xd8ba85, 0xc4ad78, 0xc99b79].map(value => new THREE.Color(value));
    const edgeColors = [0xf5e9d0, 0xe8edc6, 0xf0d3b7].map(value => new THREE.Color(value));
    // A custom road colour from the admin replaces the theme's road colour; its edge is a lighter shade of it.
    const stationRoad = journeyWorlds.map((world, index) => world.scene.roadColor ? new THREE.Color(world.scene.roadColor) : roadColors[themes[index]]);
    const stationEdge = journeyWorlds.map((world, index) => world.scene.roadColor ? new THREE.Color(world.scene.roadColor).lerp(new THREE.Color(0xffffff), .55) : edgeColors[themes[index]]);
    const groundColors = [0x657a73, 0x47654b, 0x66505b].map(value => new THREE.Color(value));
    const blendedSky = new THREE.Color(); const blendedRoad = new THREE.Color(); const blendedEdge = new THREE.Color(); const blendedGround = new THREE.Color();
    scene.fog=null;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || journey?.dataset.closingProgress==='1.0000' || (journey?.dataset.phase === 'hero' && host.dataset.gateX!==undefined && !dirty)) { last = time;cancelAnimationFrame(raf);raf=0; return; }
      // Render every display frame (no 60 fps cap) so motion stays even on 90/120/144 Hz screens.
      const dt = Math.min((time - last) / 1000 || .016, .5); last = time; fading = false; measureText(time);
      const raw = clamp(targetProgress.current);
      if(!dirty && settledFrames>15 && Math.abs(raw-(camera.userData.progress??0))<.00001){last=time;cancelAnimationFrame(raf);raf=0;return}
      if(quality.observe(dt*1000)){resize();}
      previousCamera.copy(camera.position);previousAim.copy(cameraAim);
      const p = reduced.current ? raw : THREE.MathUtils.damp(THREE.MathUtils.clamp(camera.userData.progress ?? 0, 0, 1), raw, 12, dt);
      camera.userData.progress = p;
      // Travel uses the reference spline and timings; products are lightweight HTML above the road.
      const journeyT = along(p);roadCurve.getPointAt(journeyT,current);roadCurve.getTangentAt(journeyT,tangent).normalize();side.set(-tangent.z,0,tangent.x).normalize(); const mobile = viewportWidth < 620;
      const compact = viewportWidth < 900;
      camera.position.lerp(desiredCamera.copy(current).addScaledVector(tangent, compact ? -5 : -6).addScaledVector(side,compact ? .1 : .35).setY(current.y + (mobile ? 2.8 : 3.15)), reduced.current ? 1 : 1-Math.exp(-dt*14));
      const worldIndex = layout.stationAt(p);
      // Constant forward distance and height: product focus cannot change camera pitch or FOV.
      aim.copy(current).addScaledVector(tangent,6.5);aim.y=current.y+.7;
      cameraAim.lerp(aim, reduced.current ? 1 : 1-Math.exp(-dt*11));
      camera.lookAt(cameraAim);
      // The complete ribbon remains connected through all three category stops.
      if (worldIndex !== Number(host.dataset.active)) { host.dataset.active = String(worldIndex); setActive(worldIndex);extraLinks.forEach((links,index)=>{if(index!==worldIndex)links.forEach(link=>{link.style.pointerEvents='none';link.tabIndex=-1;
        // The previous station's roadside designs keep fading out below; hide the rest.
        if(index!==worldIndex-1){link.style.visibility='hidden';link.style.opacity='0';shown.set(link,0)}})}); }
      const segmentStart = stations[worldIndex].start, segmentEnd = stations[worldIndex].end;
      const localPosition = clamp((p - segmentStart) / (segmentEnd - segmentStart)) * 3;
      // How far each station's palette has blended in (the first is always fully present).
      const weights=stations.map((station,index)=>index===0?1:THREE.MathUtils.smoothstep(p,station.start-layout.blend,station.start+layout.blend));
      // Blend with camera progress, including reverse scroll, so no palette drops out at a world boundary.
      backgrounds.forEach((image,index)=>{
        const backgroundOpacity=String(weights[index]);
        if(image.style.opacity!==backgroundOpacity)image.style.opacity=backgroundOpacity;
        const moving=weights[index]>.001&&(weights[index+1]??0)<.999;
        if(backdropMotion[index]!==moving){
          backdropMotion[index]=moving;
          image.style.setProperty('--mesh-play',moving?'running':'paused');
          image.style.setProperty('--mesh-change',moving?'transform':'auto');
        }
        // No per-frame zoom here: scaling these full-screen gradients every frame forced a CPU repaint and made scrolling laggy.
      });
      const nextProduct = Math.min(2, Math.floor(localPosition));
      if (nextProduct !== Number(host.dataset.focusedProduct)) { host.dataset.focusedProduct = String(nextProduct); }
      const nextFov = mobile ? 52 : compact ? 55 : 49;
      if (Math.abs(camera.fov - nextFov) > .02) { camera.fov = nextFov; camera.updateProjectionMatrix(); }
      const screenWidth = viewportWidth, screenHeight = viewportHeight;
      camera.updateMatrixWorld();
      roadCurve.getPointAt(.995,roadEnd).project(camera);
      host.dataset.roadEndX=((roadEnd.x+1)*screenWidth/2).toFixed(2);
      host.dataset.roadEndY=((1-roadEnd.y)*screenHeight/2).toFixed(2);
      // Project the O from its own road station, so it grows and passes the camera too.
      const gateCenter=fixedGates[worldIndex];
      gateView.copy(gateCenter).applyMatrix4(camera.matrixWorldInverse);
      gateProjection.copy(gateCenter).project(camera);
      const gateRadius = mobile ? 8 : compact ? 12 : 16;
      gateTop.copy(gateCenter);gateTop.y+=gateRadius;gateTop.project(camera);
      const diameter = Math.min(Math.max(screenWidth, screenHeight) * 8, Math.abs(gateTop.y - gateProjection.y) * screenHeight);
      // Keep the illustration raster size stable and move its compositor layer instead.
      portal.style.transform = `translate3d(${(gateProjection.x + 1) * screenWidth / 2 - 512}px,${(1 - gateProjection.y) * screenHeight / 2 - 512}px,0) scale(${diameter / 1024})`;
      const gateEntry=worldIndex===0?1:THREE.MathUtils.smoothstep(p,segmentStart,segmentStart+layout.gateEntry);
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
      const {point:stop,direction:stopTangent,side:stopSide}=fixedStops[worldIndex];
      const physicalWidth = mobile ? 1.3 : 2.25;
      const bunchDepth=-bunchView.copy(stop).applyMatrix4(camera.matrixWorldInverse).z;
      const bunchWidth = physicalWidth * screenHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(.1, bunchDepth));
      const revealScale=Math.min(1,screenHeight/700);
      const reveal = THREE.MathUtils.smoothstep(bunchWidth, (mobile ? 22 : 40)*revealScale, (mobile ? 45 : 80)*revealScale);
      const leave = 1 - THREE.MathUtils.smoothstep(bunchWidth, (mobile ? 130 : 260)*revealScale, (mobile ? 175 : 350)*revealScale);
      const opacity = bunchDepth > 0 ? reveal * leave : 0;
      const nextBunch=opacity>.05?worldIndex:null;
      if(nextBunch!==lastBunch.current){lastBunch.current=nextBunch;setVisibleBunch(nextBunch)}
      occupied.length=0;
      productLinks[worldIndex].forEach((link, slot) => {
        const arrival = slot===0 ? 1 : THREE.MathUtils.smoothstep(p, segmentStart+slot*layout.arrivalStep, segmentStart+slot*layout.arrivalStep+layout.arrival);
        const productOpacity = fadeTo(link, loaded(productImages[worldIndex][slot])?opacity*arrival:0, dt);
        if(productOpacity<=.01){
          if(link.style.visibility!=='hidden'){link.style.visibility='hidden';link.style.opacity='0';link.style.pointerEvents='none';link.style.willChange='auto';link.tabIndex=-1}
          return;
        }
        base.copy(stop).addScaledVector(stopSide, [-1, 0, 1][slot] * (mobile ? 1.1 : 2.0));
        base.y += 1.05 + [0,.22,.10][slot];
        if (slot === 1) base.addScaledVector(stopTangent, .45);
        projectedBase.copy(base).project(camera);
        projectedTop.copy(base);projectedTop.y+=physicalWidth*1.22;projectedTop.project(camera);
        projectedEdge.copy(base).addScaledVector(stopSide, physicalWidth).project(camera);
        const width = Math.abs(projectedEdge.x - projectedBase.x) * screenWidth / 2;
        const x = (projectedBase.x + 1) * screenWidth / 2;
        const y = (1 - projectedBase.y) * screenHeight / 2;
        const height=Math.abs(projectedTop.y-projectedBase.y)*screenHeight/2;
        link.style.transform=`translate3d(${x}px,${y}px,0) scale(${width/200},${height/244}) translate(-50%,-100%)`;
        const image=productImages[worldIndex][slot];
        const aspect=(image?.naturalWidth||1)/(image?.naturalHeight||image?.naturalWidth||1);
        const baseImageWidth=Math.min(200,244*aspect);
        const imageWidth=Math.min(width,height*aspect);
        image.style.transform=`scale(${imageWidth/(baseImageWidth*(width/200)||1)},${imageWidth/(baseImageWidth*(height/244)||1)})`;

        link.style.opacity = String(productOpacity); link.style.pointerEvents = productOpacity > .5 ? 'auto' : 'none';
        link.style.visibility = productOpacity > .01 ? 'visible' : 'hidden';link.style.willChange=productOpacity>.01?'transform':'auto';
        link.tabIndex = productOpacity > .5 ? 0 : -1;
        if(productOpacity>.01)occupied.push({left:x-imageWidth/2-20,right:x+imageWidth/2+20,top:y-imageWidth/aspect-20,bottom:y+20});
        blurBehindText(link,productOpacity>.01?{left:x-imageWidth/2,right:x+imageWidth/2,top:y-imageWidth/aspect,bottom:y}:null);
        host.dataset.productsVisible = String(opacity > .5);
      });
      // Additional designs occupy fixed roadside stations; only the camera moves.
      // Only as many roadside slots as this road has extra products. The previous station's designs near the
      // boundary are still updated so they move with the camera and fade out instead of freezing or vanishing.
      for(const station of worldIndex>0?[worldIndex,worldIndex-1]:[worldIndex]){
      const lastStation=stations[station].last;
      extraLinks[station].forEach((link,slot)=>{
        const image=extraImages[station][slot],stop=extraStops[station][slot];
        if(!stop||!image)return;
        const {point,side,sign}=stop;
        const size=mobile?1.05:1.6;
        base.copy(point).addScaledVector(side,sign*(mobile?.95:1.6));base.y+=1.05+(slot%2)*.15;
        const depth=-bunchView.copy(base).applyMatrix4(camera.matrixWorldInverse).z;
        projectedBase.copy(base).project(camera);projectedTop.copy(base);projectedTop.y+=size*1.22;projectedTop.project(camera);projectedEdge.copy(base).addScaledVector(side,size).project(camera);
        const width=Math.abs(projectedEdge.x-projectedBase.x)*screenWidth/2,height=Math.abs(projectedTop.y-projectedBase.y)*screenHeight/2;
        let alpha=depth>0&&image.complete&&image.naturalWidth?THREE.MathUtils.smoothstep(width,(mobile?18:30)*revealScale,(mobile?40:70)*revealScale)*(1-THREE.MathUtils.smoothstep(width,mobile?(lastStation?300:170):(lastStation?460:320),mobile?(lastStation?380:260):(lastStation?600:440))):0;
        const x=(projectedBase.x+1)*screenWidth/2,y=(1-projectedBase.y)*screenHeight/2,aspect=image.naturalWidth/image.naturalHeight||1,baseWidth=Math.min(200,244*aspect),imageWidth=Math.min(width,height*aspect);
        const bounds={left:x-imageWidth/2-20,right:x+imageWidth/2+20,top:y-imageWidth/aspect-20,bottom:y+20};
        // Fade distant extras before they cover the main bunch or a nearer design.
        for(const other of occupied){const gap=Math.max(other.left-bounds.right,bounds.left-other.right,other.top-bounds.bottom,bounds.top-other.bottom);alpha*=THREE.MathUtils.smoothstep(gap,0,28)}
        alpha=fadeTo(link,alpha,dt);
        link.style.visibility=alpha>.01?'visible':'hidden';link.style.willChange=alpha>.01?'transform':'auto';link.style.opacity=String(alpha);link.style.pointerEvents=alpha>.5?'auto':'none';link.tabIndex=alpha>.5?0:-1;
        if(alpha>.01){
          link.style.transform=`translate3d(${x}px,${y}px,0) scale(${width/200},${height/244}) translate(-50%,-100%)`;
          image.style.transform=`scale(${imageWidth/(baseWidth*(width/200)||1)},${imageWidth/(baseWidth*(height/244)||1)})`;
        }
        if(alpha>.01)occupied.push(bounds);
        blurBehindText(link,alpha>.01?{left:bounds.left+20,right:bounds.right-20,top:bounds.top+20,bottom:bounds.bottom-20}:null);
      });
      }
      blendedSky.copy(skyColors[themes[0]]); blendedRoad.copy(stationRoad[0]); blendedEdge.copy(stationEdge[0]); blendedGround.copy(groundColors[themes[0]]);
      for (let index = 1; index < stations.length; index += 1) {
        blendedSky.lerp(skyColors[themes[index]], weights[index]); blendedRoad.lerp(stationRoad[index], weights[index]);
        blendedEdge.lerp(stationEdge[index], weights[index]); blendedGround.lerp(groundColors[themes[index]], weights[index]);
      }
      roadMaterials[0].color.copy(blendedRoad); roadMaterials[1].color.copy(blendedEdge); shoulderMaterial.color.copy(blendedGround);
      renderer.setClearColor(blendedSky, 0);
      renderer.render(scene, camera);dirty=fading;
      settledFrames=Math.abs(raw-p)<.00001 && previousCamera.distanceToSquared(camera.position)<.0000001 && previousAim.distanceToSquared(cameraAim)<.0000001?settledFrames+1:0;
      host.dataset.renderCount=String(++renderCount);
      host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.geometries=String(renderer.info.memory.geometries);host.dataset.textures=String(renderer.info.memory.textures);
    };
    let compiled=false;
    wake.current=()=>{if(compiled&&!raf&&!document.hidden&&visible){last=performance.now();raf=requestAnimationFrame(tick)}};
    const visibility=()=>{if(!document.hidden)wake.current()};document.addEventListener('visibilitychange',visibility);
    let disposed=false;
    const compiling=renderer.compileAsync(scene,camera);compiling.then(()=>{if(!disposed){compiled=true;wake.current();setReady(true)}},()=>{if(!disposed)setContextLost(true)});
    return () => { disposed=true;wake.current=()=>{};window.removeEventListener('scroll',startLoading);window.removeEventListener('pointermove',onPointer);cancelAnimationFrame(pointerRaf);allImages.forEach(image=>image.removeEventListener('load',refreshProducts));cancelAnimationFrame(raf);cancelAnimationFrame(resizeRaf);document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',loseContext);observer.disconnect(); intersection.disconnect(); media.removeEventListener('change', onReduced); renderer.domElement.remove();
      // compileAsync keeps polling the materials' shader programs; disposing them first makes three.js throw.
      const release=()=>{ const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } }); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); dashes.dispose();renderer.dispose();renderer.forceContextLoss(); }; compiling.then(release,release); };
  }, []);

  const world = journeyWorlds[Math.min(active, journeyWorlds.length - 1)];
  const isLastStation = active >= journeyWorlds.length - 1;
  return <div className="three-road-world" ref={mount} data-ready={ready} data-active={active}>
    <div className="three-category-backdrops" aria-hidden="true">{backdropPalettes.map((palette,index)=><StationBackdrop key={index} theme={palette} scene={journeyWorlds[index].scene} present={active===index} load={index<requested}/>)}</div>
    <BrandO active={active} requested={Math.max(1,requested)} themes={portalThemes} custom={journeyWorlds.map(world=>world.scene.portalUrl)}/>
    <div className="three-featured-products">{journeyWorlds.map((item, index) => <div className={`three-featured-set${active === index ? ' is-active' : ''}`} aria-hidden={active !== index} key={item.roadId}>{item.products.slice(0,3).map((product, productIndex) => <Link href={`/products/${product.slug}`} prefetch={false} className="three-featured-product" key={product.id} tabIndex={active === index ? 0 : -1} aria-label={`View ${product.title}`}><m.div className="motion-product-visual" initial={{opacity:0,scale:.94,y:12}} animate={visibleBunch===index?{opacity:1,scale:1,y:0}:{opacity:0,scale:.94,y:12}} transition={{...softSpring,delay:visibleBunch===index?productIndex*.07:0}} whileHover={{scale:1.03,y:-3}} whileTap={{scale:.98}}><picture><source media="(max-width: 600px)" srcSet={index<requested?thumbnailSet(product):undefined} sizes="200px"/><img src={index<requested?product.image:undefined} srcSet={index<requested?detailSet(product):undefined} sizes="350px" onError={event=>recoverImage(event,product.image)} alt={productAlt(product)} loading="eager" decoding="async" /></picture></m.div></Link>)}</div>)}</div>
    <div className="three-extra-products">{extraDesigns.map((items,index)=><div className={`three-extra-set${active===index?' is-active':''}`} aria-hidden={active!==index} key={journeyWorlds[index].roadId}>{items.map(product=><Link href={`/products/${product.slug}`} prefetch={false} className="three-featured-product three-extra-product" key={product.id} tabIndex={-1} aria-label={`View ${product.title}`}><m.div className="motion-product-visual" initial={false} whileHover={{scale:1.03,y:-3}} whileTap={{scale:.98}} transition={softSpring}><img src={extrasEnabled&&index<requested?product.thumb:undefined} alt={productAlt(product)} width="240" height="240" decoding="async" onError={event=>recoverImage(event,product.image)}/></m.div></Link>)}</div>)}</div>
    <div className="three-world-ui" aria-live="polite">
      
      <AnimatePresence mode="sync"><m.div key={world.roadId} className="three-world-copy" initial={{opacity:0,scale:.985,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:1.015,y:-6,pointerEvents:'none'}} transition={{duration:.45,ease:[.25,.1,.25,1]}}><Reveal><span className="eyebrow">{world.label}</span><h2>{world.title}</h2><p>{world.description}</p><MotionLink className="three-world-cta" href={`/categories/${world.id}`}>Explore collection <span aria-hidden="true">↗</span></MotionLink><p className="collection-scroll-cue"><span className="scroll-desktop">{isLastStation?'Scroll to continue':'Scroll for the next collection'}</span><span className="scroll-touch">{isLastStation?'Swipe up to continue':'Swipe up for the next collection'}</span><span aria-hidden="true"> ↓</span></p></Reveal></m.div></AnimatePresence>
      <span className="three-world-progress">{String(active + 1).padStart(2, '0')} / {String(journeyWorlds.length).padStart(2, '0')}</span><MotionLink className="three-world-browse" href="/products">{`Browse all ${products.length} designs ↗`}</MotionLink>
    </div>
    <span className="three-world-sr">Travelling through the Toyon world: {world.title}. Featured designs are linked to their product pages.</span>
  </div>;
}

