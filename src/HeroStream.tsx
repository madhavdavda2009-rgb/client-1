import { thumbnailSet,heroSizes,recoverImage } from './assets';
import { m, useReducedMotion } from 'framer-motion';
import { uiSpring } from './MotionUI';
import { heroProducts } from './catalog';
export default function HeroStream(){
  const reduced=useReducedMotion();
  return <div className="hero-life"><h1 className="hero-title">Toy-On Products</h1><div className="hero-balloon-field" aria-label="Explore Toy-On product designs">{heroProducts.slice(0,6).map((product,index)=><a key={product.id} className={`hero-placed-balloon balloon-${index+1}`} href={`/products/${product.slug}`} aria-label={`View ${product.title}`}><m.img initial={reduced?false:{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{...uiSpring,delay:index*.055}} whileHover={reduced?undefined:{scale:1.035,y:-3}} whileTap={reduced?undefined:{scale:.98}} src={product.thumb} srcSet={thumbnailSet(product)} sizes={heroSizes} onError={event=>recoverImage(event,product.image)} alt={product.title} width="240" height="240" loading="eager" decoding="async"/></a>)}</div></div>;
}
