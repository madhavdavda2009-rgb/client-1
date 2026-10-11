import type { MouseEvent } from 'react';
import logo from '../assets/brand/toyon-hierarchy.svg?url';
import './opening-products.css';
export default function OpeningProducts({embedded=false,onEnter}:{embedded?:boolean;onEnter?:()=>void}){
 const enterWorlds=(event:MouseEvent<HTMLAnchorElement>)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(onEnter){event.preventDefault();onEnter();return;}
  const target=document.querySelector('.fallback-world, .reduced-home .category-rows')||document.getElementById('toyon-journey');if(!target)return;
  event.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
 };
 return <section className={`opening-products${embedded?' is-embedded':''}`} aria-label="Toy-On product showcase">
  <div className="opening-product-collage" aria-hidden="true"/>
  <h1 className="opening-sr">Toy-On products</h1>
  {!embedded&&<img className="opening-logo" src={logo} alt="Toy-On Industry Pvt Ltd" width="1600" height="1131" fetchPriority="high"/>}
  <div className="opening-guide"><a className="text-link opening-world-link" href="#toyon-journey" onClick={enterWorlds}>Explore worlds <span aria-hidden="true">↓</span></a><span className="opening-scroll-note">Scroll to enter the worlds</span></div>
 </section>;
}
