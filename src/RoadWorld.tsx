import { categories } from './catalog';
export default function RoadWorld() {
  return <div className="world-scene">
    <div className="scene-sky" />
    <div className="environment-layer"><img className="scene-background scene-background-a" src={categories[0].background} alt="" /><img className="scene-background scene-background-b" alt="" /></div>
    <div className="world-atmosphere" aria-hidden="true"><img className="drift-cloud drift-one" src={categories[0].cloud} alt="" /></div>
    <svg className="road-canvas" aria-hidden="true" preserveAspectRatio="none">
      <path className="road-surface" /><path className="road-edge" fill="none" />

    </svg>
    <div className="world-sparkles" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ left: `${[3, 94, 9, 88, 16, 81][i]}%`, top: '-30px', animationDelay: `${-i * 2.7}s` }}><svg viewBox="0 0 24 24"><path /></svg></i>)}</div>
    <div className="product-camera">{Array.from({ length: 4 }, (_, i) => <div key={i} className="world-product" data-slot={i}><img alt="" decoding="async" /></div>)}</div>
    <div className="product-copy"><section className="product-details" aria-hidden="true"><a className="product-category" /><h2 /><p /><a className="explore-product">Explore product <span aria-hidden="true">↗</span></a></section></div>
    <svg className="foreground-decoration" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><g className="foreground-left"><path d="M0 180Q8 45 90 30Q84 135 0 180M20 180Q60 65 140 85Q106 164 20 180" /></g><g className="foreground-right"><path d="M1000 180Q992 45 910 30Q916 135 1000 180M980 180Q940 65 860 85Q894 164 980 180" /></g></svg>
    <a href="/products" className="journey-browse">Browse all products <span aria-hidden="true">↗</span></a>
    <span className="journey-position" aria-hidden="true" />
  </div>;
}
