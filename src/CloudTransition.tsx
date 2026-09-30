import cloud from '../assets/opening/clouds.webp?url';
export { cloud as cloudUrl };
export default function CloudTransition() {
  return <div className="clouds" aria-hidden="true">
    <div className="cloud-cover" />
    <div className="cloud-bank cloud-depth-0"><img src={cloud} alt="" draggable={false} fetchPriority="high" decoding="async" /></div>
  </div>;
}
