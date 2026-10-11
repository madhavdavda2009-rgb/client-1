import OpeningProducts from './OpeningProducts';
import { BrandO } from './LogoArtwork';
import { categories, productById } from './catalog';
import { worldIds, thumbnailSet } from './assets';
import { MotionLink, Reveal } from './MotionUI';
export default function FallbackJourney(){return <main id="toyon-journey" className="fallback-journey" data-webgl-fallback="true"><OpeningProducts/>{worldIds.map((id,index)=>{const category=categories.find(c=>c.id===id)!;return <section className={`fallback-world palette-${id}`} key={id}><div className="fallback-scene"><BrandO active={index}/><div className="fallback-products">{category.products.slice(0,3).map(id=>{const product=productById[id];return <MotionLink href={`/products/${product.slug}`} key={id}><img src={product.thumb} srcSet={thumbnailSet(product)} sizes="150px" alt={product.title} width="240" height="240" loading="lazy"/></MotionLink>})}</div></div><Reveal className="fallback-copy"><span className="eyebrow">Product collection</span><h2>{category.title}</h2><MotionLink className="text-link" href={`/categories/${id}`}>Explore collection ↗</MotionLink></Reveal></section>})}</main>}
