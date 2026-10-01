import suppliedLogo from '../assets/brand/toyon-original.svg?raw';
import originalLogo from '../assets/brand/toyon-original.svg?url';
// Original user-supplied SVG paths, unchanged; only the coordinate system is normalized.
const artwork = suppliedLogo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<path\b[^>]*>/g, path => path.replace('<path', path.includes('fill="#fefefe"') ? '<path data-logo-paper' : path.includes('fill="#019e42"') ? '<path data-logo-o' : '<path data-logo-surround'));
const gateArtwork=[
  {src:'/assets/scenery/supplied/chirstmas_o.png',cx:645,cy:600,rx:510,ry:545,hx:644,hy:607,hrx:203,hry:215},
  {src:'/assets/scenery/supplied/dino_o.png',cx:653,cy:595,rx:547,ry:544,hx:655,hy:612,hrx:183,hry:196},
  {src:'/assets/scenery/supplied/halloween_o.png',cx:649,cy:589,rx:546,ry:540,hx:645,hy:606,hrx:189,hry:199},
];
export function BrandO({ active }: { active:number }) {
  return <svg className="three-portal-o" viewBox="100 45 1100 1100" aria-hidden="true">
    <defs>{gateArtwork.map((art,index)=><mask key={art.src} id={`supplied-o-${index}`} maskUnits="userSpaceOnUse" x="100" y="45" width="1100" height="1100"><ellipse cx={art.cx} cy={art.cy} rx={art.rx} ry={art.ry} fill="white"/><ellipse cx={art.hx} cy={art.hy} rx={art.hrx} ry={art.hry} fill="black"/></mask>)}</defs>
    {gateArtwork.map((art,index)=><g key={art.src} className={`three-portal-world${index===active?' is-active':''}`}><image href={art.src} x="0" y="0" width="1298" height="1212" mask={`url(#supplied-o-${index})`}/></g>)}
  </svg>;
}
export default function LogoArtwork() {
  return <svg className="logo" aria-label="Toyon Industry Pvt Ltd" role="img"><g data-logo-art><g transform="scale(1.2279355334)" dangerouslySetInnerHTML={{ __html: artwork }} /></g></svg>;
}
export { originalLogo };
