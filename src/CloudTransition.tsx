import cloud from '../assets/christmas/clouds.png?url';
export default function CloudTransition() {
  return <div className="clouds" aria-hidden="true">{[0, 1, 2].map(i =>
    <div className={`cloud-group cloud-group-${i}`} data-cloud={i} key={i}>
      {['top', 'bottom'].map(side => <div key={side} className={`cloud-bank cloud-${side}`}>
        <img src={cloud} alt="" draggable={false} />
      </div>)}
    </div>
  )}</div>;
}
