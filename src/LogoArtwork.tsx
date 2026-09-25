import originalLogo from '../toyon.jpeg?url';
// Render the supplied artwork unchanged. An original vector can replace this later.
export default function LogoArtwork() {
  return <svg className="logo" aria-label="Toyon Industry Pvt Ltd" role="img">
    <g data-logo-art><image href={originalLogo} width="1600" height="1131" /></g>
  </svg>;
}
export { originalLogo };
