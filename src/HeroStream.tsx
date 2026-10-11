import OpeningProducts from './OpeningProducts';
export default function HeroStream({onEnter}:{onEnter:()=>void}){
 return <div className="hero-life"><OpeningProducts embedded onEnter={onEnter}/></div>;
}
