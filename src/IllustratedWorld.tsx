import { memo } from 'react';
import { cameraPathData, cameraStops, WORLD_HEIGHT, roadColors } from './world';

function CategoryTerrain({index}:{index:number}) {
  const stop=cameraStops[index],top=WORLD_HEIGHT-(index+1)*900-80,c=stop.category;
  // Overlap adjacent scenes and feather their edges into the continuous terrain.
  const bgW=2200;
  const bgH=1520;
  const bgX=stop.x - bgW/2;
  const bgY=stop.y - bgH * 0.73;
  return <g id={`category-${c.id}`}>
    <defs><linearGradient id={`scene-fade-${index}`} gradientUnits="userSpaceOnUse" x1="0" y1={bgY} x2="0" y2={bgY+bgH}><stop stopColor="black"/><stop offset=".16" stopColor="white"/><stop offset=".84" stopColor="white"/><stop offset="1" stopColor="black"/></linearGradient><mask id={`scene-mask-${index}`} maskUnits="userSpaceOnUse" x={bgX} y={bgY} width={bgW} height={bgH}><rect x={bgX} y={bgY} width={bgW} height={bgH} fill={`url(#scene-fade-${index})`}/></mask></defs>
    <image href={c.background} x={bgX} y={bgY} width={bgW} height={bgH} preserveAspectRatio="xMidYMid slice" opacity=".96" mask={`url(#scene-mask-${index})`}/>
    <path d={`M-700 ${top+960}Q-130 ${top+680} 260 ${top+900}T1350 ${top+840}L1600 ${top+1150}H-700Z`} fill={c.ground} opacity=".24"/>
    <path d={`M-700 ${top+1080}Q100 ${top+830} 490 ${top+1000}T1550 ${top+900}L1550 ${top+1270}H-700Z`} fill={c.ground} opacity=".21"/>
  </g>;
}
export default memo(function IllustratedWorld({active}:{active:number}) {
  return <svg className="illustrated-world" width="1200" height={WORLD_HEIGHT+900} viewBox={`0 0 1200 ${WORLD_HEIGHT+900}`} aria-hidden="true">
    <defs>
      <path id="cameraPath" d={cameraPathData}/>
      <radialGradient id="daylight" cx=".45" cy=".25" r=".8"><stop stopColor="#fffdf0" stopOpacity=".6"/><stop offset="1" stopColor="#fffdf0" stopOpacity="0"/></radialGradient>
      <linearGradient id="road-materials" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2={WORLD_HEIGHT+900}>{[...cameraStops].reverse().flatMap(stop=>{const y=WORLD_HEIGHT-(stop.index+1)*900-80;return [<stop key={`${stop.index}-a`} offset={Math.max(0,(y+100)/(WORLD_HEIGHT+900))} stopColor={roadColors[stop.index]}/>,<stop key={`${stop.index}-b`} offset={(y+760)/(WORLD_HEIGHT+900)} stopColor={roadColors[stop.index]}/>]})}</linearGradient>
      <pattern id="clay-grain" width="37" height="43" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r=".7" fill="#fff" opacity=".35"/><circle cx="25" cy="30" r=".6" fill="#89744b" opacity=".13"/></pattern>
      <radialGradient id="scenery-fade"><stop offset=".3" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient>
      <mask id="distant-scenery-fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#scenery-fade)"/></mask>
      <linearGradient id="continuous-terrain" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2={WORLD_HEIGHT+900}>
        {[...cameraStops].reverse().flatMap(stop=>[
          <stop key={`${stop.index}-sky`} offset={Math.max(0,(stop.y-520)/(WORLD_HEIGHT+900))} stopColor={stop.category.sky}/>,
          <stop key={`${stop.index}-ground`} offset={(stop.y+190)/(WORLD_HEIGHT+900)} stopColor={stop.category.ground}/>,
        ])}
      </linearGradient>
    </defs>
    <path d={`M-2400 -1600H3600V${WORLD_HEIGHT+2400}H-2400Z`} fill="url(#continuous-terrain)" opacity=".79"/>
    <g id="background">{cameraStops.filter(s=>Math.abs(s.index-active)<=1).sort((a,b)=>Math.abs(b.index-active)-Math.abs(a.index-active)).map(s=><CategoryTerrain index={s.index} key={s.category.id}/>)}</g>
    <g id="road-layer" strokeLinecap="round" fill="none">
      <use href="#cameraPath" transform="translate(5 11)" stroke="#203b33" strokeWidth="142" opacity=".09"/>
      <use href="#cameraPath" stroke="#fff8e9" strokeWidth="132"/>
      <use href="#cameraPath" stroke="url(#road-materials)" strokeWidth="119"/>
      <use href="#cameraPath" stroke="url(#clay-grain)" strokeWidth="112"/>
      <use href="#cameraPath" stroke="#fffdf4" strokeWidth="2.5" strokeDasharray="11 35" opacity=".53"/>
    </g>
    <g id="product-display-zones">{cameraStops.map(stop=><circle id={`cluster-${stop.category.id}`} key={stop.category.id} cx={stop.x+stop.side*340} cy={stop.y-100} r="1" fill="none"/>)}</g>
  </svg>;
});
