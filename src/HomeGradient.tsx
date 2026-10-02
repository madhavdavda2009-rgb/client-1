import { useEffect, useRef } from 'react';
import './home-gradient.css';

export default function HomeGradient(){
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=root.current!;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer=window.matchMedia('(hover: hover) and (pointer: fine)');
    const layers=[...element.querySelectorAll<HTMLElement>('.home-mesh-parallax')];
    let frame=0,x=0,y=0,tx=0,ty=0,last=0;
    const blocked=()=>media.matches||document.hidden||document.documentElement.dataset.ambientPaused==='true'||Number(element.closest('.journey')?.getAttribute('data-opening-progress')||0)>=.64;
    function tick(now:number){
      frame=0;if(blocked())return;
      const amount=1-Math.pow(.96,Math.min((now-(last||now-16.7))/16.7,3));last=now;
      x+=(tx-x)*amount;y+=(ty-y)*amount;
      layers.forEach((layer,i)=>{const depth=[1,-.65,.45,-1,.7][i];layer.style.transform=`translate3d(${x*depth}px,${y*depth}px,0)`});
      if(Math.abs(tx-x)+Math.abs(ty-y)>.05)frame=requestAnimationFrame(tick);
    }
    function move(event:PointerEvent){if(!pointer.matches||blocked()||event.pointerType!=='mouse')return;tx=(event.clientX/innerWidth-.5)*48;ty=(event.clientY/innerHeight-.5)*32;if(!frame){last=0;frame=requestAnimationFrame(tick)}}
    function reset(){document.documentElement.dataset.tabVisible=String(!document.hidden);tx=ty=0;if(frame)cancelAnimationFrame(frame);frame=0;x=y=0;layers.forEach(layer=>{layer.style.transform='translate3d(0,0,0)'})}
    window.addEventListener('pointermove',move,{passive:true});media.addEventListener('change',reset);document.addEventListener('visibilitychange',reset);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);media.removeEventListener('change',reset);document.removeEventListener('visibilitychange',reset)};
  },[]);
  return <div ref={root} className="home-mesh" aria-hidden="true"><div className="home-mesh-field">{['blue','green','warm','pink','lavender'].map(color=><div key={color} className="home-mesh-parallax"><span className={`home-mesh-light home-light-${color}`}/></div>)}</div><div className="home-mesh-calm"/></div>;
}
