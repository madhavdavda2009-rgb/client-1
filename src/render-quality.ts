export type QualityTier='low'|'medium'|'high';
const pixelCaps={low:.8,medium:1,high:1.25};
export class RenderQuality {
  tier:QualityTier;private frames=0;private total=0;private slowWindows=0;
  constructor(width:number){const memory=(navigator as Navigator & {deviceMemory?:number}).deviceMemory;this.tier=(memory&&memory<=2||navigator.hardwareConcurrency<=2)?'low':width<620?'low':width<900?'medium':'high'}
  pixelRatio(width:number){return Math.min(devicePixelRatio,pixelCaps[this.tier],width<900?1:1.25)}
  observe(ms:number){
    // Ignore idle/resume gaps and change quality only after sustained active work.
    if(ms<8||ms>500)return false;this.frames++;this.total+=ms;if(this.frames<24)return false;
    const average=this.total/this.frames;this.frames=this.total=0;this.slowWindows=average>28?this.slowWindows+1:0;
    if(this.slowWindows<2||this.tier==='low')return false;this.tier=this.tier==='high'?'medium':'low';this.slowWindows=0;return true;
  }
}
