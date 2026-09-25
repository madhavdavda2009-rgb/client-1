import suppliedLogo from '../assets/brand/toyon-original.svg?raw';
import originalLogo from '../assets/brand/toyon-original.svg?url';
// Original user-supplied SVG paths, unchanged; only the coordinate system is normalized.
const artwork = suppliedLogo.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
export default function LogoArtwork() {
  return <svg className="logo" aria-label="Toyon Industry Pvt Ltd" role="img"><g data-logo-art><g transform="scale(1.2279355334)" dangerouslySetInnerHTML={{ __html: artwork }} /></g></svg>;
}
export { originalLogo };
