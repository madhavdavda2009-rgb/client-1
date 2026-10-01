import { useEffect, useState } from 'react';
import originalLogo from '../assets/brand/toyon-original.svg?url';
import { categories, productById, heroProducts } from './catalog';
export default function Preloader() {
  const [progress,setProgress]=useState(0),[done,setDone]=useState(false);
  useEffect(()=>{
    let cancelled=false,loaded=0;
    const mobile=matchMedia('(max-width:600px)').matches;
    const featured=['christmas','dinosaurs','halloween'].flatMap(id=>categories.find(c=>c.id===id)!.products.slice(0,3).map(id=>productById[id]));
    const artwork=['chirstmas','dino','halloween'].flatMap(id=>[`/assets/scenery/supplied/${id}_bg.webp`,`/assets/scenery/supplied/${id}_o.webp`]);
    const urls=[...new Set([originalLogo,...artwork,...heroProducts.map(p=>p.thumb),...featured.map(p=>mobile?p.thumb:p.image)])];
    const previousOverflow=document.documentElement.style.overflow;
    document.documentElement.style.overflow='hidden';
    const unlock=()=>{document.documentElement.style.overflow=previousOverflow};
    const finish=()=>{if(!cancelled){unlock();setDone(true)}};
    const images=urls.map(src=>{
      const image=new Image();image.decoding='async';image.src=src;
      return image.decode().then(()=>true,()=>false).then(ok=>{if(!cancelled){if(!ok)document.documentElement.dataset.preloadFailed='true';setProgress(++loaded/(urls.length+2))}});
    });
    const fonts=document.fonts.ready.then(()=>{if(!cancelled)setProgress(++loaded/(urls.length+2))});
    let poll=0;
    const scene=new Promise<void>(resolve=>{
      const check=()=>{if(cancelled)return;const w=document.querySelector<HTMLElement>('.three-road-world');if(w?.dataset.ready==='true'&&w.dataset.gateX){setProgress(++loaded/(urls.length+2));resolve()}else poll=window.setTimeout(check,50)};check();
    });
    // A failed network request must never permanently trap navigation.
    const fallback=window.setTimeout(finish,15000);
    Promise.all([...images,fonts,scene]).then(()=>{clearTimeout(fallback);if(!cancelled){document.documentElement.dataset.journeyPreloaded='true';setProgress(1);finish()}});
    return()=>{cancelled=true;clearTimeout(fallback);clearTimeout(poll);unlock()};
  },[]);
  return <div className={`brand-preloader${done?' is-ready':''}`} aria-hidden={done} aria-label="Loading Toy-On"><img src={originalLogo} alt="Toy-On"/><div className="loading-line"><span style={{transform:`scaleX(${progress})`}}/></div></div>;
}
