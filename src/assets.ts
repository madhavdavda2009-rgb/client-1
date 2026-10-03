import { useSyncExternalStore } from 'react';
import { categories, productById, type Product } from './catalog';
import dimensions from './asset-dimensions.json';

export const worldIds=['christmas','dinosaurs','halloween'] as const;
export const worldArtwork=['chirstmas','dino','halloween'].map(id=>`/assets/scenery/supplied/${id}_o.webp`);
export const productDimensions=(product:Product)=>dimensions[product.id as keyof typeof dimensions];
export const thumbnailSet=(product:Product)=>`${product.thumb} 240w, ${product.image.replace('.webp','-480.webp')} 480w`;
export const detailSet=(product:Product)=>`${product.image.replace('.webp','-detail-480.webp')} ${Math.min(480,productDimensions(product).width)}w, ${product.image} ${productDimensions(product).width}w`;
export const heroSizes='(max-width:600px) 112px, (max-width:900px) 130px, 190px';
export const catalogueSizes='(max-width:600px) calc((86vw - 18px)/2), (max-width:900px) calc((88vw - 50px)/3), min(24vw, 300px)';
export function artworkSrc(index:number){return worldArtwork[index].replace('_o.webp',innerWidth<620&&devicePixelRatio<=2?'_portal-v2-768.webp':'_portal-v2-1024.webp')}
const cache=new Map<string,Promise<boolean>>();
export function preloadImage(src:string,srcset?:string,sizes?:string){
  const key=srcset?`${srcset}|${sizes}`:src;const existing=cache.get(key);if(existing)return existing;
  const task=new Promise<boolean>(resolve=>{const image=new Image();image.decoding='async';if(srcset){image.sizes=sizes||'100vw';image.srcset=srcset}image.src=src;image.decode().then(()=>resolve(true),()=>resolve(false))});cache.set(key,task);return task;
}
const prepared=new Map<string,Promise<boolean[]>>();
let requested=1;const subscribers=new Set<()=>void>();
export function useRequestedWorlds(){return useSyncExternalStore(callback=>{subscribers.add(callback);return()=>{subscribers.delete(callback)}},()=>requested)}
export function prepareWorld(index:number){
  if(index+1>requested){requested=index+1;subscribers.forEach(callback=>callback())}
  const key=`${index}|${innerWidth<=600}|${devicePixelRatio<=2}`;const previous=prepared.get(key);if(previous)return previous;
  const task=Promise.all(worldIds.slice(0,index+1).flatMap((id,i)=>[preloadImage(artworkSrc(i)),...categories.find(c=>c.id===id)!.products.slice(0,3).map(id=>{const product=productById[id];return innerWidth<=600?preloadImage(product.thumb,thumbnailSet(product),'200px'):preloadImage(product.image,detailSet(product),'350px')})]));prepared.set(key,task);return task;
}
export function recoverImage(event:{currentTarget:HTMLImageElement},original:string){
  const image=event.currentTarget;
  if(image.dataset.imageRetried!=='true'){
    image.dataset.imageRetried='true';
    image.closest('picture')?.querySelectorAll('source').forEach(source=>source.removeAttribute('srcset'));
    image.removeAttribute('srcset');image.src=original;
  }else{image.dataset.imageFailed='true';image.style.visibility='hidden'}
}
