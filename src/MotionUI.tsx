import { Children, createElement, isValidElement, useEffect, useState, useRef, type ReactNode } from 'react';
import { m, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion';
import './motion-ui.css';

export const softSpring={type:'spring' as const,stiffness:180,damping:24};
export const uiSpring={type:'spring' as const,stiffness:300,damping:25};
export const buttonSpring={type:'spring' as const,stiffness:400,damping:25};
export const fadeIn:Variants={hidden:{opacity:0},visible:{opacity:1,transition:{duration:.26}}};
export const fadeUp:Variants={hidden:{opacity:0,y:12},visible:{opacity:1,y:0,transition:softSpring}};
export const scaleIn:Variants={hidden:{opacity:0,scale:.97},visible:{opacity:1,scale:1,transition:softSpring}};
export const staggerContainer:Variants={hidden:{},visible:{transition:{staggerChildren:.055,delayChildren:.025}},exit:{transition:{staggerChildren:.035,staggerDirection:-1}}};
export const menuItem:Variants={hidden:{opacity:0,y:12},visible:{opacity:1,y:0,transition:uiSpring},exit:{opacity:0,y:6,transition:{duration:.12}}};
type ElementProps<T extends 'div'|'a'|'button'>=Omit<HTMLMotionProps<T>,'children'> & {children?:ReactNode};
const motionText={h1:m.h1,h2:m.h2,h3:m.h3,p:m.p,span:m.span};
function textSequence(children:ReactNode,reduced:boolean){return Children.map(children,child=>{
  if(!isValidElement(child)||typeof child.type!=='string'||!(child.type in motionText))return child;
  const tag=child.type as keyof typeof motionText;
  const variants=reduced?fadeIn:tag==='p'?fadeIn:tag==='h1'||tag==='h2'?{hidden:{opacity:0,y:18},visible:{opacity:1,y:0,transition:softSpring}}:fadeUp;
  return createElement(motionText[tag],{...(child.props as object),variants,key:child.key});
})}
export function Reveal({children,...props}:ElementProps<'div'>){
  const reduced=!!useReducedMotion();
  return <m.div initial="hidden" whileInView="visible" viewport={{once:true,amount:.18}} variants={staggerContainer} {...props}>{textSequence(children,reduced)}</m.div>;
}
export function MotionButton({children,...props}:ElementProps<'button'>){
  const reduced=useReducedMotion();
  return <m.button whileHover={reduced?undefined:{scale:1.035,y:-2}} whileTap={reduced?undefined:{scale:.975}} transition={buttonSpring} {...props}>{children}</m.button>;
}
export function MotionLink({children,className='',revealOrder=0,...props}:ElementProps<'a'> & {revealOrder?:number}){
  const reduced=useReducedMotion();
  const card=/catalogue-product|category-row/.test(className),cta=/text-link|business-cta|three-world-cta|three-world-browse/.test(className);
  const content=cta?Children.map(children,child=>typeof child==='string'?<m.span variants={{hover:{x:reduced?0:1},rest:{x:0}}} transition={buttonSpring}>{child}</m.span>:isValidElement(child)&&child.type==='span'?createElement(m.span,{...(child.props as object),variants:{hover:{x:reduced?0:3},rest:{x:0}},transition:buttonSpring,key:child.key}):child):children;
  return <m.a className={className} initial={card&&!reduced?{opacity:0,y:12,scale:.985}:false} whileInView={card?{opacity:1,y:0,scale:1,transition:{...uiSpring,delay:reduced?0:revealOrder*.035}}:undefined} viewport={{once:true,amount:.12}} variants={{hover:reduced?{}:card?{y:-3,scale:1.01}:cta?{y:-2,scale:1.035}:{y:-1},rest:{y:0,scale:1}}} whileHover="hover" animate="rest" whileTap={reduced?undefined:{scale:.98}} transition={cta?buttonSpring:uiSpring} {...props}>{content}</m.a>;
}
export function ScrollArrow(){
  const reduced=useReducedMotion();const ref=useRef<HTMLSpanElement>(null);const [visible,setVisible]=useState(true);
  useEffect(()=>{const element=ref.current!,parent=element.parentElement!;let intersecting=true,last=true;
    const check=()=>{const next=intersecting&&!document.hidden&&parent.style.visibility!=='hidden';if(next!==last){last=next;setVisible(next)}};
    const observer=new IntersectionObserver(([entry])=>{intersecting=entry.isIntersecting;check()});observer.observe(element);
    const style=new MutationObserver(check);style.observe(parent,{attributes:true,attributeFilter:['style']});document.addEventListener('visibilitychange',check);check();
    return()=>{observer.disconnect();style.disconnect();document.removeEventListener('visibilitychange',check)};
  },[]);
  return <m.span ref={ref} className="scroll-arrow" aria-hidden="true" animate={reduced||!visible?{y:0}:{y:[0,6,0]}} transition={reduced||!visible?{duration:.15}:{duration:2.1,repeat:Infinity,ease:'easeInOut'}}><svg viewBox="0 0 24 28" width="20" height="26" fill="none"><path d="M12 4v18m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></m.span>;
}

// Keep the current document intact until native navigation commits the destination.
export function PageTransition({children,home}:{children:ReactNode;home:boolean}){
  const reduced=useReducedMotion();
  return <m.div className={home?'home-motion-page':'page-reveal'} initial={home?false:{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} transition={{duration:reduced?.12:.25,ease:[.25,.1,.25,1]}}>{children}</m.div>;
}
