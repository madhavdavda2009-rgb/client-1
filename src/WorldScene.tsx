import { layers, products } from './scene';
export default function WorldScene() {
  return <div className="world-scene">
    {layers.filter(layer => layer.image).map(layer => <img key={layer.id} className="world-layer" data-layer={layer.id} src={layer.image} alt="" style={{ zIndex: layer.z }} />)}
    <div className="product-camera">{products.map(product => <div key={product.id} className="world-product" data-product={product.id} style={{ zIndex: product.z }}>
      <img src={product.image} alt={product.alt} draggable={false} decoding="async" />
    </div>)}</div>
  </div>;
}

