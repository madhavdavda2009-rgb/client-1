import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import { categories } from './catalog';

const vertex = 'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
const fragment = `precision mediump float;
varying vec2 uv;
uniform float time;
uniform vec3 sky;
uniform vec3 ground;

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

void main(){
    vec2 p = uv * 2.0;
    float t = time * 0.15;
    
    vec2 q = vec2(0.);
    q.x = noise(p + vec2(t, 0.0));
    q.y = noise(p + vec2(0.0, t));
    
    vec2 r = vec2(0.);
    r.x = noise(p + 1.0 * q + vec2(t * 1.2, t * 0.9));
    r.y = noise(p + 1.0 * q + vec2(t * 0.5, t * 1.5));
    
    float f = noise(p + r);
    
    vec3 col1 = sky;
    vec3 col2 = ground;
    vec3 col3 = mix(sky, vec3(1.0), 0.4);
    vec3 col4 = mix(ground, sky, 0.5);
    
    vec3 color = mix(col1, col2, smoothstep(0.1, 0.9, f + uv.y*0.3));
    color = mix(color, col3, smoothstep(0.0, 1.0, q.x) * 0.5);
    color = mix(color, col4, smoothstep(0.0, 1.0, r.y) * 0.5);
    
    float vig = length(uv - 0.5) * 2.0;
    color = mix(color, color * 0.85, smoothstep(0.5, 1.5, vig));
    
    color += (rand(gl_FragCoord.xy) - 0.5) / 128.0;
    gl_FragColor = vec4(color, 1.0);
}`;
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
const mix=(a:number[],b:number[],v:number)=>a.map((n,i)=>n+(b[i]-n)*v);

/** One low-resolution atmosphere; decorative rendering never drives scroll. */
export default function Atmosphere({progress}:{progress?:MotionValue<number>}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current!;
    const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
    if(!gl)return;
    const shaders:WebGLShader[]=[];
    const compile=(type:number,source:string)=>{
      const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);
      shaders.push(shader);return gl.getShaderParameter(shader,gl.COMPILE_STATUS)?shader:null;
    };
    const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
    if(!vs||!fs){shaders.forEach(s=>gl.deleteShader(s));return;}
    const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);return;}
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const uniforms={time:gl.getUniformLocation(program,'time'),sky:gl.getUniformLocation(program,'sky'),ground:gl.getUniformLocation(program,'ground')};
    let frame=0,last=0,elapsed=0,visible=true,paused=false,dirty=true,lost=false;
    const journey=canvas.closest<HTMLElement>('.journey');
    const hero=Boolean(canvas.closest('.hero-life'));
    const rendererInfo=gl.getExtension('WEBGL_debug_renderer_info');
    const software=rendererInfo&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL));
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const measure=()=>{const r=canvas.getBoundingClientRect(),scale=r.width<768?.4:.55;canvas.width=Math.max(1,Math.round(r.width*scale));canvas.height=Math.max(1,Math.round(r.height*scale));gl.viewport(0,0,canvas.width,canvas.height);dirty=true;};
    const palette=()=>{
      if(!progress)return {sky:rgb('#f2f8e9'),ground:rgb('#dcefe9')};
      const value=Math.min(categories.length-1,progress.get()*categories.length),i=Math.floor(value);
      // Match camera travel, then hold the palette while products are viewed.
      const t=Math.min(1,(value-i)/.48),blend=t*t*t*(t*(t*6-15)+10);
      const previous=categories[Math.max(0,i-1)],next=categories[i];
      return {sky:mix(rgb(previous.sky),rgb(next.sky),blend),ground:mix(rgb(previous.ground),rgb(next.ground),blend)};
    };
    const draw=(now:number)=>{
      frame=requestAnimationFrame(draw);
      const interval=canvas.clientWidth<768?1000/15:1000/24;
      const sceneHidden=journey&&(hero?journey.dataset.phase!=='hero':Number(journey.dataset.openingProgress)<.6);
      if(lost||document.hidden||!visible||sceneHidden||now-last<interval||((paused||reduced.matches||software)&&!dirty))return;
      if(!paused&&!reduced.matches&&!software)elapsed+=Math.min((now-last)/1000,.1);
      last=now;dirty=false;const colors=palette();
      gl.uniform1f(uniforms.time,elapsed);gl.uniform3fv(uniforms.sky,colors.sky);gl.uniform3fv(uniforms.ground,colors.ground);gl.drawArrays(gl.TRIANGLES,0,6);
    };
    const sync=()=>{paused=document.documentElement.dataset.ambientPaused==='true';dirty=true;};
    const contextLost=(event:Event)=>{event.preventDefault();lost=true;canvas.style.opacity='0';};
    const resize=new ResizeObserver(measure);resize.observe(canvas);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;dirty=true;});observer.observe(canvas);
    const unsubscribe=progress?.on('change',()=>{dirty=true;});
    window.addEventListener('toyon:motion',sync);reduced.addEventListener('change',sync);canvas.addEventListener('webglcontextlost',contextLost);
    sync();measure();frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();unsubscribe?.();window.removeEventListener('toyon:motion',sync);reduced.removeEventListener('change',sync);canvas.removeEventListener('webglcontextlost',contextLost);gl.deleteBuffer(buffer);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);};
  },[progress]);
  return <canvas ref={ref} className="atmospheric-gradient" aria-hidden="true"/>;
}
