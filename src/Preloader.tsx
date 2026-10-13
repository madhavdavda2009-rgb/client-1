import { useEffect, useState } from 'react';
const originalLogo = '/assets/brand/toyon-hierarchy.svg';
import { preloadImage,showcaseSrc } from './assets';
export default function Preloader(){
  const [progress,setProgress]=useState(0),[done,setDone]=useState(false);
  useEffect(()=>{
    let cancelled=false,loaded=0,finished=false,poll=0;
    const previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    const unlock=()=>{document.documentElement.style.overflow=previousOverflow};
    const finish=()=>{if(!cancelled&&!finished){finished=true;unlock();document.documentElement.dataset.journeyPreloaded='true';setProgress(1);setDone(true)}};
    const opening=new Promise<void>(resolve=>{const check=()=>{if(cancelled)return;const journey=document.querySelector<HTMLElement>('.journey');if(journey?.dataset.phase)resolve();else poll=window.setTimeout(check,60)};check()});
    const tasks=[preloadImage(originalLogo),preloadImage(showcaseSrc())];
    const fallback=window.setTimeout(()=>{if(document.querySelector('.journey'))finish()},10000);
    Promise.all([opening,...tasks.map(task=>task.then(result=>{if(!cancelled){if(!result)document.documentElement.dataset.preloadFailed='true';setProgress(++loaded/tasks.length)}}))]).then(()=>{clearTimeout(fallback);finish()});
    return()=>{cancelled=true;clearTimeout(fallback);clearTimeout(poll);unlock()};
  },[]);
  return <div className={`brand-preloader${done?' is-ready':''}`} aria-hidden={done} aria-label="Loading Toy-On"><img src={originalLogo} alt="Toy-On" width="500" height="354" fetchPriority="high"/><div className="loading-line"><span style={{transform:`scaleX(${progress})`}}/></div></div>;
}
