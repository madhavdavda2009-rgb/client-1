import { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence, type MotionValue, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';
import { categories, productById, type Category, type Product } from './catalog';
import './three-road.css';
import './animated-backdrops.css';
import { MotionLink, Reveal, softSpring } from './MotionUI';
import { BrandO } from './LogoArtwork';
import { RenderQuality } from './render-quality';
import { useRequestedWorlds,prepareWorld,thumbnailSet,detailSet,recoverImage } from './assets';

type JourneyWorld = Omit<Category, 'products'> & { products: Product[]; description: string; label: string };

const journeyWorlds: JourneyWorld[] = [
  { ...categories.find(c => c.id === 'christmas')!, products: categories.find(c => c.id === 'christmas')!.products.slice(0, 3).map(id => productById[id]), label: 'FESTIVE COLLECTION', description: 'Warm, sparkling shapes made for the moments that gather everyone together.' },
  { ...categories.find(c => c.id === 'dinosaurs')!, products: categories.find(c => c.id === 'dinosaurs')!.products.slice(0, 3).map(id => productById[id]), label: 'DINOSAUR WORLD', description: 'Bring big imaginations to life with playful characters built for roaring celebrations.' },
  { ...categories.find(c => c.id === 'halloween')!, products: categories.find(c => c.id === 'halloween')!.products.slice(0, 3).map(id => productById[id]), label: 'HALLOWEEN COLLECTION', description: 'A little spooky, a lot of fun — expressive designs for nights worth remembering.' },
];
const backdropPalettes = ['christmas', 'dinosaurs', 'halloween'];

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
  const requested=useRequestedWorlds();const wake=useRef(()=>{});
  const [contextLost,setContextLost]=useState(false);
  if(contextLost)throw new Error('WebGL context unavailable');
  const [visibleBunch,setVisibleBunch]=useState<number|null>(null);
  const lastBunch=useRef<number|null>(null);
  const mount = useRef<HTMLDivElement>(null); const targetProgress = useRef(0); const reduced = useRef(false);
  const [active, setActive] = useState(0); const [ready, setReady] = useState(false);
  useMotionValueEvent(progress, 'change', value => { targetProgress.current = clamp(value);prepareWorld(value>.40?2:value>.05?1:0);wake.current(); });

  useEffect(() => {
    const host = mount.current; if (!host) return;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(48, 1, .1, 180); camera.position.set(0, 3.15, 10);
    const quality=new RenderQuality(host.clientWidth);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(quality.pixelRatio(host.clientWidth)); renderer.setClearColor(0x000000, 0); host.appendChild(renderer.domElement);
    const loseContext=(event:Event)=>{event.preventDefault();setContextLost(true)};renderer.domElement.addEventListener('webglcontextlost',loseContext);
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
    const shoulderGeometry=roadRibbon(2.65);shoulderGeometry.clearGroups();const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial); shoulder.position.y = -.28; world.add(shoulder);
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
    confineDistantRoad(dashMaterial);const dashes=new THREE.InstancedMesh(dashGeometry,dashMaterial,26),dashPose=new THREE.Object3D();
    for(let i=0;i<26;i++){const t=i/27+.005,p=roadCurve.getPointAt(t),tangent=roadCurve.getTangentAt(t);dashPose.position.copy(p);dashPose.position.y+=.025;dashPose.rotation.y=Math.atan2(tangent.x,tangent.z);dashPose.updateMatrix();dashes.setMatrixAt(i,dashPose.matrix)}
    dashes.instanceMatrix.needsUpdate=true;dashes.computeBoundingSphere();world.add(dashes);
    const productLinks = journeyWorlds.map((_, index) => [...host.querySelectorAll<HTMLAnchorElement>(`.three-featured-set:nth-child(${index + 1}) .three-featured-product`)]);
    productLinks.flat().forEach(link=>{link.style.left=link.style.top='0px';link.style.width='200px';link.style.height='244px';link.style.transformOrigin='0 0'});
    // Fixed stations on one road: bunch first, scenic O farther along, then the next station.
    const stops = [.17, .48, .80].map(p => .045 + p * .91);
    const gates = [.28, .60, .91].map(p => .045 + p * .91);
    const backgrounds=[...host.querySelectorAll<HTMLDivElement>('.animated-category-backdrop')];
    const portal = host.querySelector<HTMLElement>('.three-portal-o')!;
    portal.style.left=portal.style.top='0px';portal.style.width=portal.style.height='1024px';
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
    const shadowContext = shadowCanvas.getContext('2d')!;
    const gradient = shadowContext.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(30,35,25,.65)'); gradient.addColorStop(.4, 'rgba(30,35,25,.35)'); gradient.addColorStop(1, 'rgba(30,35,25,0)');
    shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 64, 64);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc, stencilZPass: THREE.KeepStencilOp });
    const shadowGeometry=new THREE.PlaneGeometry(1,1);
    const productShadows = [0, 1, 2].map(() => { const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial); shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 3; scene.add(shadow); return shadow; });
    const current=new THREE.Vector3(),tangent=new THREE.Vector3(),side=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),aim=new THREE.Vector3(),roadEnd=new THREE.Vector3(),gateView=new THREE.Vector3(),gateProjection=new THREE.Vector3(),gateTop=new THREE.Vector3(),base=new THREE.Vector3(),bunchView=new THREE.Vector3();
    const fixedGates=gates.map(t=>{const point=roadCurve.getPointAt(t);point.y+=1.1;return point});
    const fixedStops=stops.map(t=>{const point=roadCurve.getPointAt(t),direction=roadCurve.getTangentAt(t).normalize();return {point,direction,side:new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,1,0)).normalize()}});
    const productImages=productLinks.map(group=>group.map(link=>link.querySelector('img')!));
    const projectedBase = new THREE.Vector3(), projectedTop = new THREE.Vector3(), projectedEdge = new THREE.Vector3();
    const cameraAim = roadCurve.getPointAt(stops[0]); cameraAim.y += 1.1;
    let viewportWidth=1,viewportHeight=1,dirty=true,settledFrames=0,renderCount=0;
    const previousCamera=new THREE.Vector3(),previousAim=new THREE.Vector3();
    const refreshProducts=()=>{dirty=true;wake.current()};productImages.flat().forEach(image=>image.addEventListener('load',refreshProducts));
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'); reduced.current = media.matches; const onReduced = () => { reduced.current = media.matches;dirty=true;wake.current(); }; media.addEventListener('change', onReduced); let narrowRoad = false; const resize = () => { const w = host.clientWidth || 1; const h = host.clientHeight || 1;viewportWidth=w;viewportHeight=h;dirty=true; const nextNarrow = w < 620; if (nextNarrow !== narrowRoad) { road.geometry.dispose(); shoulder.geometry.dispose(); road.geometry = roadRibbon(nextNarrow ? 1.7 : 2.4); shoulder.geometry = roadRibbon(nextNarrow ? 1.9 : 2.65);shoulder.geometry.clearGroups(); narrowRoad = nextNarrow; } camera.aspect = w / h; camera.fov = w < 620 ? 52 : w < 900 ? 55 : 49; camera.updateProjectionMatrix(); renderer.setPixelRatio(quality.pixelRatio(w));host.dataset.quality=quality.tier; renderer.setSize(w, h, false);wake.current(); }; let resizeRaf=0;const observer = new ResizeObserver(()=>{cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(resize)}); observer.observe(host); resize();
    let raf = 0; let last = 0; let visible = true; const journey = host.closest<HTMLElement>('.journey'); const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting;if(visible)wake.current(); }); intersection.observe(journey ?? host);
    const skyColors = [0xf7efdc, 0xf1f2d8, 0xf2e8df].map(color => new THREE.Color(color));
    const roadColors = [0xd8ba85, 0xc4ad78, 0xc99b79].map(value => new THREE.Color(value));
    const edgeColors = [0xf5e9d0, 0xe8edc6, 0xf0d3b7].map(value => new THREE.Color(value));
    const groundColors = [0x657a73, 0x47654b, 0x66505b].map(value => new THREE.Color(value));
    const blendedSky = new THREE.Color(); const blendedRoad = new THREE.Color(); const blendedEdge = new THREE.Color(); const blendedGround = new THREE.Color();
    scene.fog=null;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || journey?.dataset.closingProgress==='1.0000' || (journey?.dataset.phase === 'hero' && host.dataset.gateX!==undefined && !dirty)) { last = time;cancelAnimationFrame(raf);raf=0; return; }
      const frameInterval = 1000 / 60 - 1;
      if (time - last < frameInterval) return;
      const dt = Math.min((time - last) / 1000 || .016, .5); last = time;
      const raw = stationTravel(clamp(targetProgress.current));
      if(!dirty && settledFrames>15 && Math.abs(raw-(camera.userData.progress??0))<.00001){last=time;cancelAnimationFrame(raf);raf=0;return}
      if(quality.observe(dt*1000)){resize();}
      previousCamera.copy(camera.position);previousAim.copy(cameraAim);
      const p = reduced.current ? raw : THREE.MathUtils.damp(THREE.MathUtils.clamp(camera.userData.progress ?? 0, 0, 1), raw, 4.5, dt);
      camera.userData.progress = p;
      // Travel uses the reference spline and timings; products are lightweight HTML above the road.
      const journeyT = .045 + p * .91;roadCurve.getPointAt(journeyT,current);roadCurve.getTangentAt(journeyT,tangent).normalize();side.set(-tangent.z,0,tangent.x).normalize(); const mobile = viewportWidth < 620;
      const compact = viewportWidth < 900;
      camera.position.lerp(desiredCamera.copy(current).addScaledVector(tangent, compact ? -5 : -6).addScaledVector(side,compact ? .1 : .35).setY(current.y + (mobile ? 2.8 : 3.15)), reduced.current ? 1 : 1-Math.exp(-dt*9));
      const worldIndex = p < .345 ? 0 : p < .655 ? 1 : 2;
      // Constant forward distance and height: product focus cannot change camera pitch or FOV.
      aim.copy(current).addScaledVector(tangent,6.5);aim.y=current.y+.7;
      cameraAim.lerp(aim, reduced.current ? 1 : 1-Math.exp(-dt*7));
      camera.lookAt(cameraAim);
      // The complete ribbon remains connected through all three category stops.
      if (worldIndex !== Number(host.dataset.active)) { host.dataset.active = String(worldIndex); setActive(worldIndex); }
      const segmentStart = [0, .345, .655][worldIndex], segmentEnd = [.345, .655, 1][worldIndex];
      const localPosition = clamp((p - segmentStart) / (segmentEnd - segmentStart)) * 3;
      const background01=THREE.MathUtils.smoothstep(p,.30,.39),background12=THREE.MathUtils.smoothstep(p,.61,.70);
      // A single timed backdrop fade starts with the existing O category handoff.
      const weights=[1,worldIndex>=1?1:0,worldIndex===2?1:0];
      backgrounds.forEach((image,index)=>{
        image.style.opacity=String(weights[index]);
        const moving=index===0?background01<.999:index===1?background01>.001&&background12<.999:background12>.001;
        image.style.setProperty('--mesh-play',moving?'running':'paused');
        image.style.setProperty('--mesh-change',moving?'transform':'auto');
        const start=[0,.345,.655][index],end=[.345,.655,1][index];
        image.style.transform=`scale(${1+clamp((p-start)/(end-start))*.08})`;
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
      const {point:stop,direction:stopTangent,side:stopSide}=fixedStops[worldIndex];
      const physicalWidth = mobile ? 1.3 : 2.25;
      const bunchDepth=-bunchView.copy(stop).applyMatrix4(camera.matrixWorldInverse).z;
      const bunchWidth = physicalWidth * screenHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(.1, bunchDepth));
      const reveal = THREE.MathUtils.smoothstep(bunchWidth, mobile ? 55 : 90, mobile ? 85 : 140);
      const leave = 1 - THREE.MathUtils.smoothstep(bunchWidth, mobile ? 130 : 260, mobile ? 175 : 350);
      const opacity = bunchDepth > 0 ? reveal * leave : 0;
      const nextBunch=opacity>.05?worldIndex:null;
      if(nextBunch!==lastBunch.current){lastBunch.current=nextBunch;setVisibleBunch(nextBunch)}
      productLinks[worldIndex].forEach((link, slot) => {
        base.copy(stop).addScaledVector(stopSide, [-1, 0, 1][slot] * (mobile ? .65 : 1.2));
        base.y += .065;
        if (slot === 1) base.addScaledVector(stopTangent, .45);
        projectedBase.copy(base).project(camera);
        projectedTop.copy(base);projectedTop.y+=physicalWidth*1.22;projectedTop.project(camera);
        projectedEdge.copy(base).addScaledVector(stopSide, physicalWidth).project(camera);
        const width = Math.abs(projectedEdge.x - projectedBase.x) * screenWidth / 2;
        const x = (projectedBase.x + 1) * screenWidth / 2;
        const y = (1 - projectedBase.y) * screenHeight / 2;
        const height=Math.abs(projectedTop.y-projectedBase.y)*screenHeight/2;
        link.style.transform=`translate3d(${x}px,${y}px,0) rotate(${[-8,1,8][slot]}deg) scale(${width/200},${height/244}) translate(-50%,-100%)`;
        const image=productImages[worldIndex][slot];
        const aspect=(image?.naturalWidth||1)/(image?.naturalHeight||image?.naturalWidth||1);
        const baseImageWidth=Math.min(200,244*aspect);
        const imageWidth=Math.min(width,height*aspect);
        image.style.transform=`scale(${imageWidth/(baseImageWidth*(width/200)||1)},${imageWidth/(baseImageWidth*(height/244)||1)})`;

        link.style.opacity = String(opacity); link.style.pointerEvents = opacity > .5 ? 'auto' : 'none';
        link.style.visibility = opacity > .01 ? 'visible' : 'hidden';
        link.tabIndex = opacity > .5 ? 0 : -1;
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
      host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.geometries=String(renderer.info.memory.geometries);host.dataset.textures=String(renderer.info.memory.textures);
    };
    let compiled=false;
    wake.current=()=>{if(compiled&&!raf&&!document.hidden&&visible){last=performance.now();raf=requestAnimationFrame(tick)}};
    const visibility=()=>{if(!document.hidden)wake.current()};document.addEventListener('visibilitychange',visibility);
    let disposed=false;
    renderer.compileAsync(scene,camera).then(()=>{if(!disposed){compiled=true;wake.current();setReady(true)}},()=>{if(!disposed)setContextLost(true)});
    return () => { disposed=true;wake.current=()=>{};productImages.flat().forEach(image=>image.removeEventListener('load',refreshProducts));cancelAnimationFrame(raf);cancelAnimationFrame(resizeRaf);document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',loseContext);observer.disconnect(); intersection.disconnect(); media.removeEventListener('change', onReduced); const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } }); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); shadowTexture.dispose(); dashes.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove(); };
  }, []);

  const world = journeyWorlds[active];
  return <div className="three-road-world" ref={mount} data-ready={ready} data-active={active}>
    <div className="three-category-backdrops" aria-hidden="true">{backdropPalettes.map(palette=><div key={palette} className={`animated-category-backdrop palette-${palette}`} data-present={backdropPalettes[active]===palette}><span className="mesh-light mesh-a"/><span className="mesh-light mesh-b"/><span className="mesh-light mesh-c"/><span className="mesh-light mesh-d"/></div>)}</div>
    <BrandO active={active} requested={requested}/>
    <div className="three-featured-products">{journeyWorlds.map((item, index) => <div className={`three-featured-set${active === index ? ' is-active' : ''}`} aria-hidden={active !== index} key={item.id}>{item.products.map((product, productIndex) => <a href={`/products/${product.slug}`} className="three-featured-product" key={product.id} tabIndex={active === index ? 0 : -1} aria-label={`View ${product.title}`}><m.div className="motion-product-visual" initial={{opacity:0,scale:.94,y:12}} animate={visibleBunch===index?{opacity:1,scale:1,y:0}:{opacity:0,scale:.94,y:12}} transition={{...softSpring,delay:visibleBunch===index?productIndex*.07:0}} whileHover={{scale:1.03,y:-3}} whileTap={{scale:.98}}><picture><source media="(max-width: 600px)" srcSet={index<requested?thumbnailSet(product):undefined} sizes="200px"/><img src={index<requested?product.image:undefined} srcSet={index<requested?detailSet(product):undefined} sizes="350px" onError={event=>recoverImage(event,product.image)} alt={product.title} loading="eager" decoding="async" /></picture></m.div></a>)}</div>)}</div>
    <div className="three-world-ui" aria-live="polite">
      <AnimatePresence mode="sync"><m.div key={world.id} className="three-world-copy" initial={{opacity:0,scale:.985,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:1.015,y:-6,pointerEvents:'none'}} transition={{duration:.45,ease:[.25,.1,.25,1]}}><Reveal><span className="eyebrow">{world.label}</span><h2>{world.title}</h2><p>{world.description}</p><MotionLink className="three-world-cta" href={`/categories/${world.id}`}>Explore collection <span aria-hidden="true">↗</span></MotionLink><p className="collection-scroll-cue"><span className="scroll-desktop">Keep scrolling to explore</span><span className="scroll-touch">Swipe up to explore</span><span aria-hidden="true"> ↓</span></p></Reveal></m.div></AnimatePresence>
      <span className="three-world-progress">{String(active + 1).padStart(2, '0')} / 03</span><MotionLink className="three-world-browse" href="/products">Browse all 96 designs ↗</MotionLink>
    </div>
    <span className="three-world-sr">Travelling through the Toy-On world: {world.title}. Featured designs are linked to their product pages.</span>
  </div>;
}

export { journeyWorlds };
