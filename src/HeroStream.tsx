import { heroProducts } from './catalog';
export default function HeroStream() {
  return <div className="hero-life">
    <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
    <div className="hero-sparkles" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${7 + i * 11}%`, top: `${18 + i % 3 * 24}%`, animationDelay: `${-i * .6}s` }} />)}</div>
    <div className="hero-stream" aria-label="A moving selection of Toy-On products">
      <div className="stream-track">{[0, 1].map(copy => <div className="stream-group" aria-hidden={copy === 1 ? true : undefined} key={copy}>
        {heroProducts.map((product, i) => <div className={`stream-product stream-size-${i % 3}`} key={product.id} style={{ animationDelay: `${-i * .7}s` }}>
          <img src={product.thumb} alt={copy === 0 ? product.title : ''} width="240" height="240" decoding="async" />
        </div>)}
      </div>)}</div>
    </div>
  </div>;
}
