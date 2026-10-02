import { useEffect, useState } from 'react';
import originalLogo from '../assets/brand/toyon-original.svg?url';
import { heroProducts } from './catalog';
import { prepareWorld,preloadImage,thumbnailSet,heroSizes } from './assets';
export default function Preloader(){
  const [progress,setProgress]=useState(0),[done,setDone]=useState(false);
  useEffect(()=>{
    let cancelled=false,loaded=0,poll=0;
    const previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    const unlock=()=>{document.documentElement.style.overflow=previousOverflow};
    const finish=()=>{if(!cancelled){unlock();document.documentElement.dataset.journeyPreloaded='true';setProgress(1);setDone(true)}};
    const tasks:Promise<unknown>[]=[preloadImage(originalLogo),...heroProducts.slice(0,6).map(p=>preloadImage(p.thumb,thumbnailSet(p),heroSizes)),prepareWorld(0),document.fonts.ready];
    const scene=new Promise<void>(resolve=>{const check=()=>{if(cancelled)return;const w=document.querySelector<HTMLElement>('.three-road-world');if(w?.dataset.ready==='true'&&w.dataset.gateX)resolve();else poll=window.setTimeout(check,80)};check()});tasks.push(scene);
    const fallback=window.setTimeout(finish,15000);
    Promise.all(tasks.map(task=>Promise.resolve(task).then(result=>{if(!cancelled){if(result===false)document.documentElement.dataset.preloadFailed='true';setProgress(++loaded/tasks.length)}}))).then(()=>{clearTimeout(fallback);finish()});
    return()=>{cancelled=true;clearTimeout(fallback);clearTimeout(poll);unlock()};
  },[]);
  return <div className={`brand-preloader${done?' is-ready':''}`} aria-hidden={done} aria-label="Loading Toy-On"><img src={originalLogo} alt="Toy-On" width="500" height="354" fetchPriority="high"/><div className="loading-line"><span style={{transform:`scaleX(${progress})`}}/></div></div>;
}
