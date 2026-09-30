import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, m, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import IllustratedWorld from './IllustratedWorld';
import Atmosphere from './Atmosphere';
import { cameraStart, cameraStops, clusterArrangement, WORLD_HEIGHT } from './world';
import type { Product } from './catalog';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const range=(v:number,a:number,b:number)=>clamp((v-a)/(b-a));
const smooth=(v:number)=>v*v*v*(v*(v*6-15)+10);
const Balloon=memo(function Balloon({product,index,categoryIndex,progress,active}:{product:Product;index:number;categoryIndex:number;progress:MotionValue<number>;active:boolean}) {
  const place=clusterArrangement[index];
  const assembly=useTransform(progress,p=>smooth(range(p*cameraStops.length-categoryIndex,.34+index*.055,.55+index*.055)));
  const x=useTransform(assembly,p=>(1-p)*[-14,0,14,0][index]);
  const y=useTransform(assembly,p=>(1-p)*[0,-10,0,16][index]);
  const scale=useTransform(assembly,p=>.93+p*.07);
  const shadowScale=useTransform(assembly,p=>.85+p*.15);
  return <div className="balloon-anchor" style={{left:place.x,top:place.y,zIndex:index===3?4:index, '--balloon-size':place.size*1.18} as CSSProperties}>
    <m.div className="balloon-ground-shadow" style={{scaleX:shadowScale}} animate={active?{opacity:[.29,.23,.29]}:{opacity:.29}} transition={{duration:active?7+index:0,repeat:active?Infinity:0}}/>
    <m.a className="balloon-assembly" href={`/products/${product.slug}`} aria-label={`Explore ${product.title}`} style={{x,y,scale}} whileHover={{scale:1.045}} whileTap={{scale:.98}}>
      <m.div className="balloon-idle" animate={active?{y:[0,-3,0],rotate:[place.rotation,place.rotation+1,place.rotation]}:{y:0,rotate:place.rotation}} transition={{duration:active?7+index:0,repeat:active?Infinity:0,ease:'easeInOut'}}>
        <picture><source media="(max-width: 767px)" srcSet={product.image.replace('.webp','-scene.webp')}/><img src={product.image} alt={product.title} width="240" height="280" loading={categoryIndex===0?'eager':'lazy'} decoding="async"/></picture>
      </m.div>
    </m.a>
  </div>;
});
export default function RoadWorld({progress}:{progress:MotionValue<number>}) {
  const root=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null);
  const geometry=useRef<{samples:{x:number;y:number;length:number}[];stops:number[];start:number}>({samples:[],stops:[],start:0});
  const viewport=useRef({width:390,height:844});
  const activeRef=useRef(0), nameRef=useRef(0),holdingRef=useRef(false);
  const [active,setActive]=useState(0),[selected,setSelected]=useState(0),[holding,setHolding]=useState(false),[paused,setPaused]=useState(false);
  const warmed=useRef(new Set<string>());
  const lastPose=useRef('');
  const opacity=useTransform(progress,p=>{const f=p===1?1:p*cameraStops.length%1;return smooth(range(f,.31,.42))*(1-smooth(range(f,.94,1)));});
  function update(p:number) {
    const geo=geometry.current;if(!geo.samples.length||!world.current)return;
    const value=Math.min(cameraStops.length-.000001,p*cameraStops.length),index=Math.floor(value),f=value-index;
    const stop=cameraStops[index],arrival=smooth(range(f,0,.48));
    const length=(index?geo.stops[index-1]:geo.start)+(geo.stops[index]-(index?geo.stops[index-1]:geo.start))*arrival;
    const last=geo.samples.length-1, samplePos=length/geo.samples[last].length*last,i=Math.min(last-1,Math.floor(samplePos)),mix=samplePos-i;
    const point={x:geo.samples[i].x+(geo.samples[i+1].x-geo.samples[i].x)*mix,y:geo.samples[i].y+(geo.samples[i+1].y-geo.samples[i].y)*mix};
    const {width,height}=viewport.current,mobile=width<768,scale=mobile?Math.min(width/760,height/1000):Math.min(width/1280,height/790,1.2);
    const previous=cameraStops[Math.max(0,index-1)];
    const facing=previous.side+(stop.side-previous.side)*arrival;
    // Keep the road within the central viewing area while steering toward the product bank.
    const frameX=width*(mobile?.5-facing*.18:.5-facing*.065),frameY=height*(mobile?.59:.61);
    const pose=`translate3d(${(frameX-point.x*scale).toFixed(2)}px,${(frameY-point.y*scale).toFixed(2)}px,0) scale(${scale})`;
    if(pose!==lastPose.current){world.current.style.transform=pose;lastPose.current=pose}
    root.current!.dataset.cameraX=point.x.toFixed(2);root.current!.dataset.cameraY=point.y.toFixed(2);
    root.current!.dataset.category=stop.category.id;root.current!.dataset.phase=f<.48?'travel':f<.94?'hold':'release';
    const nextHolding=f>=.48&&f<.94;
    if(nextHolding!==holdingRef.current){holdingRef.current=nextHolding;setHolding(nextHolding)}
    if(index!==activeRef.current){activeRef.current=index;setActive(index)}
    const name=Math.min(3,Math.floor(range(f,.40,.94)*4));
    if(name!==nameRef.current){nameRef.current=name;setSelected(name)}
    root.current!.style.setProperty('--world-ink', '#19313b');
    for(const next of cameraStops.slice(index,index+2)){const src=next.category.background;if(!warmed.current.has(src)){warmed.current.add(src);const image=new Image();image.src=src;}}
    for(const next of cameraStops.slice(index,index+2))for(const product of next.products){const src=mobile?product.image.replace('.webp','-scene.webp'):product.image;if(!warmed.current.has(src)){warmed.current.add(src);const image=new Image();image.src=src;}}
  }
  useMotionValueEvent(progress,'change',update);
  useLayoutEffect(()=>{
    const path=root.current!.querySelector<SVGPathElement>('#cameraPath')!,length=path.getTotalLength();
    const samples=Array.from({length:501},(_,i)=>{const distance=length*i/500,point=path.getPointAtLength(distance);return{x:point.x,y:point.y,length:distance}});
    const nearest=(y:number)=>samples.reduce((best,p)=>Math.abs(p.y-y)<Math.abs(best.y-y)?p:best,samples[0]).length;
    geometry.current={samples,stops:cameraStops.map(s=>nearest(s.y)),start:nearest(cameraStart.y)};
    const measure=()=>{viewport.current={width:root.current!.clientWidth,height:root.current!.clientHeight};update(progress.get())};
    measure();const observer=new ResizeObserver(measure);observer.observe(root.current!);
    return()=>observer.disconnect();
  },[progress]);
  useEffect(()=>{const sync=()=>setPaused(document.documentElement.dataset.ambientPaused==='true');sync();window.addEventListener('toyon:motion',sync);return()=>window.removeEventListener('toyon:motion',sync)},[]);
  const stop=cameraStops[active],product=stop.products[selected];
  return <div ref={root} className="cluster-world">
    <Atmosphere progress={progress}/>
    <div ref={world} className="world-camera" style={{height:WORLD_HEIGHT+900}}>
      <IllustratedWorld active={active}/>
      <div className="world-clusters">{cameraStops.filter(s=>Math.abs(s.index-active)<=1).map(s=><div className="product-cluster" id={`products-${s.category.id}`} key={s.category.id} style={{left:s.x+s.side*325,top:s.y-10,'--shadow-ink':s.category.ink} as CSSProperties}>
        {s.products.map((p,i)=><Balloon key={p.id} product={p} index={i} categoryIndex={s.index} progress={progress} active={s.index===active&&holding&&!paused}/>)}
      </div>)}</div>
    </div>
    <m.section className={`cluster-copy cluster-copy-${stop.side<0?'right':'left'}`} style={{opacity}} aria-hidden={!holding}>
      <m.a className="product-category" href={`/categories/${stop.category.id}`} key={stop.category.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.3}}>{stop.category.title}</m.a>
      <AnimatePresence mode="wait"><m.div className="cluster-name" key={product.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.2}}><h2>{product.title}</h2><m.a href={`/products/${product.slug}`} className="explore-product" whileHover={{x:4}} whileTap={{scale:.98}}>Explore Product →</m.a></m.div></AnimatePresence>
    </m.section>
    <a href="/products" className="journey-browse">Browse all products ↗</a><span className="journey-position">{String(active+1).padStart(2,'0')} / {cameraStops.length}</span>
  </div>;
}
