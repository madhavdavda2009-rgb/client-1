import { heroProducts } from './catalog';

export default function HeroStream() {
  return <div className="hero-life">
    <div className="hero-carousel" aria-label="A selection of Toy-On balloon designs">
      <div className="hero-carousel-track">
        {[0, 1].map(copy => <div className="hero-carousel-group" aria-hidden={copy === 1} key={copy}>
          {heroProducts.map(product => <a href={`/products/${product.slug}`} className="hero-carousel-product" key={`${copy}-${product.id}`} tabIndex={copy ? -1 : 0} aria-label={`View ${product.title}`}><img src={product.thumb} alt={product.title} decoding="async" loading={copy ? 'lazy' : 'eager'} /></a>)}
        </div>)}
      </div>
    </div>
    <a href="/products" className="hero-skip-link">Skip home page <span aria-hidden="true">↗</span></a>
  </div>;
}
