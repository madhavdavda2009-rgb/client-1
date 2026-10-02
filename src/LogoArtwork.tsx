import { artworkSrc } from './assets';
import { m, useReducedMotion } from 'framer-motion';
import { softSpring } from './MotionUI';
import suppliedLogo from '../assets/brand/toyon-original.svg?raw';
import originalLogo from '../assets/brand/toyon-original.svg?url';
// Original user-supplied SVG paths, unchanged; only the coordinate system is normalized.
const artwork = suppliedLogo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<path\b[^>]*>/g, path => path.replace('<path', path.includes('fill="#fefefe"') ? '<path data-logo-paper' : path.includes('fill="#019e42"') ? '<path data-logo-o' : '<path data-logo-surround'));
const gateArtwork=[
  {src:'/assets/scenery/supplied/chirstmas_o.webp',cx:645,cy:600,rx:510,ry:545,hx:644,hy:607,hrx:203,hry:215},
  {src:'/assets/scenery/supplied/dino_o.webp',cx:653,cy:595,rx:547,ry:544,hx:655,hy:612,hrx:183,hry:196},
  {src:'/assets/scenery/supplied/halloween_o.webp',cx:649,cy:589,rx:546,ry:540,hx:645,hy:606,hrx:189,hry:199},
];
export function BrandO({ active, requested=3 }: { active:number;requested?:number }) {
  return <div className="three-portal-o" aria-hidden="true">{gateArtwork.map((art,index)=><img key={art.src} className={`three-portal-world${index===active?' is-active':''}`} src={index<requested?artworkSrc(index):undefined} width="1024" height="1024" decoding="async" alt=""/>)}</div>;
}
export default function LogoArtwork() {
  const reduced=useReducedMotion();
  return <svg className="logo" aria-label="Toyon Industry Pvt Ltd" role="img"><g data-logo-art><m.g initial={reduced?false:{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={softSpring}><g transform="scale(1.2279355334)" dangerouslySetInnerHTML={{ __html: artwork }} /></m.g></g></svg>;
}
export { originalLogo };
