import { useLayoutEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeRoadWorld from './ThreeRoadWorld';
import HeroStream from './HeroStream';
import HomeGradient from './HomeGradient';
import { ScrollArrow } from './MotionUI';
import LogoArtwork, { originalLogo } from './LogoArtwork';
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const range=(v:number,a:number,b:number)=>clamp((v-a)/(b-a));
const ease=(v:number)=>v*v*(3-2*v);
const intro={holeX:.348,holeY:.477,radius:.0274,length:1.35};
export default function ToyonIntro(){
  const rootRef=useRef<HTMLElement>(null),journeyProgress=useMotionValue(0);
  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
    const root=rootRef.current!,stage=root.querySelector<HTMLElement>('.stage')!;
    const logo=root.querySelector<SVGSVGElement>('.logo')!,art=root.querySelector<SVGGElement>('[data-logo-art]')!;
    const surroundingLetters=[...root.querySelectorAll<SVGPathElement>('[data-logo-surround]')];
    const preview=root.querySelector<HTMLElement>('.portal-preview')!,portal=root.querySelector<HTMLElement>('.portal')!;
    const hero=root.querySelector<HTMLElement>('.hero-life')!,hint=root.querySelector<HTMLElement>('.scroll-hint')!;
    const journeyHint=root.querySelector<HTMLElement>('.journey-scroll-cue')!;
    let width=1,height=1,baseWidth=1,portalRadius=1,progress=0,target=0,running=false,disposed=false,lastOpening=-1,lastTick=performance.now();
    let closingOrigin:{x:number;y:number}|null=null;
    const totalLength=intro.length+3*2.05+1,openingFraction=intro.length/totalLength;
    function measure(){width=stage.clientWidth;height=stage.clientHeight;baseWidth=Math.min(width*.96,height*1.2,860);portalRadius=Math.min(width*(width<700?.45:.31),height*(width<700?.265:.43));root.style.setProperty('--portal-radius',`${portalRadius}px`);root.style.height=`${height*(1+totalLength)}px`;logo.setAttribute('viewBox',`0 0 ${width} ${height}`);lastOpening=-1;}
    function render(){
      // Start travelling as soon as the scenic O is revealed; avoid an empty hold after the logo.
      const opening=clamp(progress/openingFraction),travel=range(progress,openingFraction*.44,(totalLength-1)/totalLength);
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
      const alignment = ease(range(opening, 0, .32));
      const world=root.querySelector<HTMLElement>('.three-road-world')!;
      const gateX=Number(world.dataset.gateX)||width/2,gateY=Number(world.dataset.gateY)||height/2;
      const gateDiameter=Number(world.dataset.gateDiameter)||portalRadius*2;
      const scale = Math.pow(gateDiameter * 1600 / (210 * 1.2279355334 * baseWidth),alignment);
      const factor = baseWidth / 1600 * scale;
      const offsetX = (intro.holeX - .5) * baseWidth, offsetY = (intro.holeY - .5) * baseWidth / (1600 / 1131);
      const cx = (width/2+offsetX)*(1-alignment)+gateX*alignment, cy=(height*.48+offsetY)*(1-alignment)+gateY*alignment;
      art.setAttribute('transform', `matrix(${factor} 0 0 ${factor} ${cx - intro.holeX * 1600 * factor} ${cy - intro.holeY * 1131 * factor})`);
      preview.style.clipPath = `circle(${intro.radius * baseWidth * scale}px at ${cx}px ${cy}px)`;
      logo.style.clipPath=opening>.28?`circle(${gateDiameter*.51}px at ${gateX}px ${gateY}px)`:'none';
      const lettersOpacity=1-ease(range(opening,.14,.28));
      surroundingLetters.forEach(letter=>{letter.style.opacity=`${lettersOpacity}`});
      preview.style.opacity = `${ease(range(opening,.01,.12)) * (1-ease(range(opening,.32,.64)))}`;
      logo.style.opacity = `${1 - ease(range(opening, .32, .64))}`;
      logo.style.visibility = opening >= .64 ? 'hidden' : 'visible';
      preview.style.visibility = opening >= .64 ? 'hidden' : 'visible';
      const worldReveal = ease(range(opening, .32, .64));
      root.style.setProperty('--home-mesh-opacity',String(1-worldReveal));
      root.style.setProperty('--home-mesh-pull',String(1-.18*ease(range(opening,0,.64))));
      root.style.setProperty('--home-motion',String(1-ease(range(opening,0,.64))));
      root.style.setProperty('--home-mesh-play',opening>=.64?'paused':'running');
      portal.style.opacity = `${worldReveal}`; portal.style.visibility = worldReveal ? 'visible' : 'hidden';
      }
      const closing=ease(range(progress,(totalLength-1)/totalLength,1));
      root.dataset.closing=String(closing>0);root.dataset.closingProgress=closing.toFixed(4);
      const cueOpacity=ease(range(opening,.10,.24))*(1-ease(range(opening,.56,.70)));
      journeyHint.style.opacity=String(cueOpacity);journeyHint.style.visibility=cueOpacity>0?'visible':'hidden';
      root.dataset.scrollCue=closing>0?'finish':opening<.64?'enter':travel>.70?'finish':'next';
      root.style.setProperty('--ending-white',String(ease(range(closing,0,.5))));
      if(closing===0)closingOrigin=null;
      if(closing===0 && opening===1){root.dataset.phase='road';logo.style.opacity='0';logo.style.visibility='hidden';portal.style.opacity='1';portal.style.visibility='visible'}
      if(closing>0){
        root.dataset.phase='closing';logo.style.clipPath='none';
        const world=root.querySelector<HTMLElement>('.three-road-world')!;
        closingOrigin??={x:Number(world.dataset.roadEndX)||width/2,y:Number(world.dataset.roadEndY)||height*.38};
        const emerge=ease(range(closing,0,.52)),assemble=ease(range(closing,.55,1));
        const endingScale=(.18+2.62*emerge)*(1-assemble)+assemble,factor=baseWidth/1600*endingScale;
        const finalX=width/2+(intro.holeX-.5)*baseWidth,finalY=height*.44+(intro.holeY-.5)*baseWidth/(1600/1131);
        const risenX=closingOrigin.x+(width/2-closingOrigin.x)*emerge;
        const risenY=closingOrigin.y+(height*.44-closingOrigin.y)*emerge;
        const cx=risenX+(finalX-risenX)*assemble,cy=risenY+(finalY-risenY)*assemble;
        art.setAttribute('transform',`matrix(${factor} 0 0 ${factor} ${cx-intro.holeX*1600*factor} ${cy-intro.holeY*1131*factor})`);
        surroundingLetters.forEach(letter=>{letter.style.opacity=String(ease(range(closing,.65,1)))});
        logo.style.opacity=String(ease(range(closing,0,.06)));logo.style.visibility='visible';
        const roadFade=ease(range(closing,.4,.85));
        portal.style.opacity=String(1-roadFade);portal.style.visibility=closing>=1?'hidden':'visible';
        preview.style.visibility='hidden';
      }
      journeyProgress.set(travel);
    }
    function tick(){
      const now=performance.now(),dt=Math.min((now-lastTick)/1000,.5);lastTick=now;
      if(disposed||document.hidden)return;
      const distance=target-progress,limit=progress<=openingFraction?openingFraction*.8*dt:.65*dt;
      progress=Math.abs(distance)<.000001?target:progress+clamp(distance*(1-Math.exp(-dt/.14)),-limit,limit);render();
      if(progress===target){gsap.ticker.remove(tick);running=false;}
    }
    function follow(value:number){target=value;if(!running){running=true;lastTick=performance.now();gsap.ticker.add(tick)}}
    measure();render();const observer=new IntersectionObserver(([entry])=>{root.dataset.visible=String(entry.isIntersecting)});observer.observe(root);
    const context=gsap.context(()=>{ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:self=>follow(self.progress),onRefreshInit:measure,onRefresh:self=>{render();follow(self.progress)}})},root);
    return()=>{disposed=true;gsap.ticker.remove(tick);context.revert();observer.disconnect()};
  },[journeyProgress]);
  return <><link rel="preload" as="image" href={originalLogo}/><main ref={rootRef} className="journey" aria-label="Toy-On road journey"><div className="stage"><HomeGradient/><HeroStream/><div className="portal-preview" aria-hidden="true"/><LogoArtwork/><div className="portal"><ThreeRoadWorld progress={journeyProgress}/></div><p className="scroll-hint"><span className="scroll-desktop">Scroll down to explore</span><span className="scroll-touch">Swipe up to explore</span><ScrollArrow/></p><p className="journey-scroll-cue"><span className="cue-enter"><span className="scroll-desktop">Keep scrolling to enter</span><span className="scroll-touch">Swipe up to enter</span></span><span className="cue-next"><span className="scroll-desktop">Scroll for the next collection</span><span className="scroll-touch">Swipe up for the next collection</span></span><span className="cue-finish"><span className="scroll-desktop">Scroll to continue</span><span className="scroll-touch">Swipe up to continue</span></span><ScrollArrow/></p></div></main></>;
}
