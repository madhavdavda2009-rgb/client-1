import { useEffect, useState } from 'react';
import originalLogo from '../assets/brand/toyon-original.svg?url';
import { categories, heroProducts } from './catalog';
import { cloudUrl } from './CloudTransition';
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const urls = [originalLogo, cloudUrl, categories[0].background, ...heroProducts.map(p => p.thumb)];
    let loaded = 0;
    const jobs = urls.map(src => new Promise<void>(resolve => {
      const image = new Image(); image.src = src;
      image.decode().catch(() => {}).finally(() => { if (!cancelled) setProgress(++loaded / urls.length); resolve(); });
    }));
    // Failed images must not permanently trap navigation behind a loader.
    const timeout = window.setTimeout(() => { if (!cancelled) setDone(true); }, 6000);
    Promise.all(jobs).then(() => { if (!cancelled) { setDone(true); clearTimeout(timeout); } });
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);
  return <div className={`brand-preloader${done ? ' is-ready' : ''}`} aria-hidden={done} aria-label="Loading Toy-On">
    <img src={originalLogo} alt="Toy-On" /><div className="loading-line"><span style={{ transform: `scaleX(${progress})` }} /></div>
  </div>;
}
