import { heroProducts } from './catalog';
import Atmosphere from './Atmosphere';
export default function HeroStream() {
  return <div className="hero-life">
    <Atmosphere/>
    <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
    <div className="hero-sparkles" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ left: `${8 + i * 17}%`, top: '-20px', animationDelay: `${-i * .6}s` }} />)}</div>
    <div className="hero-stream" aria-label="A moving selection of Toy-On products">
      <div className="stream-track">{[0, 1].map(copy => <div className="stream-group" aria-hidden={copy === 1 ? true : undefined} key={copy}>
        {heroProducts.map((product, i) => <div className={`stream-product stream-size-${i % 3}`} key={product.id} style={{ animationDelay: `${-i * .7}s` }}>
          <img src={product.thumb} alt={copy === 0 ? product.title : ''} width="240" height="240" decoding="async" />
        </div>)}
      </div>)}</div>
    </div>
  </div>;
}
