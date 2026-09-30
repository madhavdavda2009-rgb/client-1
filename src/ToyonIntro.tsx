import { useLayoutEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoadWorld from './DepthRoadWorld';
import HeroStream from './HeroStream';
import CloudTransition, { cloudUrl } from './CloudTransition';
import LogoArtwork, { originalLogo } from './LogoArtwork';
import { categories } from './catalog';
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const range=(v:number,a:number,b:number)=>clamp((v-a)/(b-a));
const ease=(v:number)=>v*v*(3-2*v);
const intro={holeX:.348,holeY:.477,radius:.0274,length:2.5};
export default function ToyonIntro(){
  const rootRef=useRef<HTMLElement>(null),journeyProgress=useMotionValue(0);
  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
    const root=rootRef.current!,stage=root.querySelector<HTMLElement>('.stage')!;
    const logo=root.querySelector<SVGSVGElement>('.logo')!,art=root.querySelector<SVGGElement>('[data-logo-art]')!;
    const preview=root.querySelector<HTMLElement>('.portal-preview')!,portal=root.querySelector<HTMLElement>('.portal')!;
    const hero=root.querySelector<HTMLElement>('.hero-life')!,hint=root.querySelector<HTMLElement>('.scroll-hint')!;
    const cover=root.querySelector<HTMLElement>('.cloud-cover')!,clouds=[...root.querySelectorAll<HTMLElement>('.cloud-bank')];
    let width=1,height=1,baseWidth=1,progress=0,target=0,running=false,disposed=false,lastOpening=-1;
    const totalLength=intro.length+categories.length*3.2+1,openingFraction=intro.length/totalLength;
    function measure(){width=stage.clientWidth;height=stage.clientHeight;baseWidth=Math.min(width*.96,height*1.2,860);root.style.height=`${height*(1+totalLength)}px`;logo.setAttribute('viewBox',`0 0 ${width} ${height}`);lastOpening=-1;}
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
    function render(){
      const opening=clamp(progress/openingFraction),travel=range(progress,openingFraction,(totalLength-1)/totalLength);
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
      preview.style.opacity = `${ease(range(opening,.01,.12)) * (1-ease(range(opening,.52,.59)))}`;
      logo.style.opacity = `${1 - ease(range(opening, .53, .60))}`;
      logo.style.visibility = opening >= .60 ? 'hidden' : 'visible';
      preview.style.visibility = opening >= .59 ? 'hidden' : 'visible';
      const worldReveal = ease(range(opening, .48, .56));
      portal.style.opacity = `${worldReveal}`; portal.style.visibility = worldReveal ? 'visible' : 'hidden';
      paintClouds(opening);
      }
      journeyProgress.set(travel);
    }
    function tick(_time:number,delta:number){
      if(disposed||document.hidden)return;
      const dt=Math.min(delta/1000,1/20),distance=target-progress,limit=progress<=openingFraction?openingFraction*.8*dt:.22*dt;
      progress=Math.abs(distance)<.000001?target:progress+clamp(distance*(1-Math.exp(-dt/.14)),-limit,limit);render();
      if(progress===target){gsap.ticker.remove(tick);running=false;}
    }
    function follow(value:number){target=value;if(!running){running=true;gsap.ticker.add(tick)}}
    measure();render();const observer=new IntersectionObserver(([entry])=>{root.dataset.visible=String(entry.isIntersecting)});observer.observe(stage);
    const context=gsap.context(()=>{ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:self=>follow(self.progress),onRefreshInit:measure,onRefresh:self=>{render();follow(self.progress)}})},root);
    return()=>{disposed=true;gsap.ticker.remove(tick);context.revert();observer.disconnect()};
  },[journeyProgress]);
  return <><link rel="preload" as="image" href={originalLogo}/><link rel="preload" as="image" href={cloudUrl}/><main ref={rootRef} className="journey" aria-label="Toy-On road journey"><div className="stage"><HeroStream/><div className="portal-preview" aria-hidden="true" style={{backgroundImage:`linear-gradient(145deg, #b9e7f6ba, #fff9e1aa), url(${categories[0].background})`}}/><LogoArtwork/><div className="portal"><RoadWorld progress={journeyProgress}/></div><CloudTransition/><p className="scroll-hint">Scroll Down to See<span aria-hidden="true">↓</span></p></div></main></>;
}
