import { defineConfig } from 'vite';
export default defineConfig({
  plugins:[{name:'client-only-motion-directives',enforce:'pre',transform(code,id){if(id.includes('/node_modules/framer-motion/')&&/^['"]use client['"]/.test(code))return {code:code.replace(/^['"]use client['"];?/,''),map:null};}},{name:'critical-body-font',transformIndexHtml(_html,context){
    const font=Object.values(context.bundle??{}).find(asset=>asset.fileName.includes('manrope-latin-wght-normal')&&asset.fileName.endsWith('.woff2'));
    const logo=Object.values(context.bundle??{}).find(asset=>asset.fileName.includes('toyon-original')&&asset.fileName.endsWith('.svg'));
    const tags=logo?[{tag:'link',attrs:{rel:'preload',as:'image',href:`/${logo.fileName}`},injectTo:'head' as const}]:[];
    return font?[...tags,{tag:'link',attrs:{rel:'preload',as:'font',type:'font/woff2',crossorigin:'anonymous',href:`/${font.fileName}`},injectTo:'head' as const}]:tags;
  }}],
  build:{sourcemap:true,rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules/three/'))return 'world-engine';if(id.includes('node_modules/gsap/'))return 'scroll-engine';}}}}
});
