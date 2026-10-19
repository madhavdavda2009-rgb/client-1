import { artworkSrc } from './assets';
import { cloudinaryImage } from './cloudinary';
import { m, useReducedMotion } from 'framer-motion';
import { softSpring } from './MotionUI';
import { suppliedLogo } from './logo-inline';
const originalLogo = '/assets/brand/toyon-hierarchy.svg';
// Original user-supplied SVG paths, unchanged; only the coordinate system is normalized.
const artwork = suppliedLogo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<path\b[^>]*>/g, path => path.replace('<path', path.includes('fill="#fefefe"') ? '<path data-logo-paper' : path.includes('fill="#019e42"') ? '<path data-logo-o' : '<path data-logo-surround'));
const gateArtwork=[
  {src:'/assets/scenery/supplied/chirstmas_o.webp',cx:645,cy:600,rx:510,ry:545,hx:644,hy:607,hrx:203,hry:215},
  {src:'/assets/scenery/supplied/dino_o.webp',cx:653,cy:595,rx:547,ry:544,hx:655,hy:612,hrx:183,hry:196},
  {src:'/assets/scenery/supplied/halloween_o.webp',cx:649,cy:589,rx:546,ry:540,hx:645,hy:606,hrx:189,hry:199},
];
// themes maps each road station to its portal artwork (0 festive, 1 dinosaur, 2 halloween); custom holds an optional
// uploaded O artwork per station (Admin → Roads → Scene look), which replaces the theme artwork for that station.
export function BrandO({ active, requested=3, themes=[0,1,2], custom=[] }: { active:number;requested?:number;themes?:number[];custom?:(string|undefined)[] }) {
  const shown=custom[active]?-1:themes[active]??active,loaded=themes.filter((_,station)=>station<requested&&!custom[station]);
  // The active artwork also masks a light sweep, so the shine only crosses the painted O (not its hole).
  const customUrl=custom[active],activeSrc=customUrl&&active<requested?cloudinaryImage(customUrl,1024):loaded.includes(shown)?artworkSrc(shown):undefined;
  return <div className="three-portal-o" aria-hidden="true"><div className="portal-breathe">{gateArtwork.map((art,index)=><img key={art.src} className={`three-portal-world${index===shown?' is-active':''}`} src={loaded.includes(index)?artworkSrc(index):undefined} width="1024" height="1024" decoding="async" alt=""/>)}
    {custom.map((url,station)=>url&&<img key={`custom-${station}`} className={`three-portal-world${station===active?' is-active':''}`} src={station<requested?cloudinaryImage(url,innerWidth<620&&devicePixelRatio<=2?768:1024):undefined} width="1024" height="1024" decoding="async" alt=""/>)}
    {activeSrc&&<span key={activeSrc} className="portal-shine" style={{'--o-mask':`url("${activeSrc}")`} as React.CSSProperties}/>}</div></div>;
}
export default function LogoArtwork() {
  const reduced=useReducedMotion();
  return <svg className="logo" aria-label="Toyon Industry Pvt Ltd" role="img"><g data-logo-art><m.g initial={reduced?false:{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={softSpring}><g transform="scale(1.2279355334)" dangerouslySetInnerHTML={{ __html: artwork }} /></m.g></g></svg>;
}
export { originalLogo };
