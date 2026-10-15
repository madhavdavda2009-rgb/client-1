"use client";
import { useMemo, useState } from 'react';
import StationBackdrop from '../StationBackdrop';
import { artworkSrc } from '../assets';
import { themeIndex, type RoadTheme } from '../catalog';
import { cloudinaryImage } from '../cloudinary';
import { cleanScene, motionDefaults, portalTemplate, themeMotionColors, themeRoadColor, type BackgroundKind, type MotionSpeed, type MotionStrength, type RoadScene } from '../road-scene';
import { uploadSceneMedia } from './supabase';
import '../animated-backdrops.css';

const KINDS: [BackgroundKind, string][] = [['theme', 'Theme default'], ['motion', 'Moving colours'], ['image', 'Image / GIF'], ['video', 'Video']];
const SPEEDS: [MotionSpeed, string][] = [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']];
const FOLLOW: [MotionStrength, string][] = [['off', 'Off'], ['gentle', 'Gentle'], ['strong', 'Strong']];
const lighter = (hex: string) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * .45 + 255 * .55).toString(16).padStart(2, '0')).join('');

// "Scene look" of one road station: background (theme / moving colours / image or GIF / video), road colour and O artwork.
export default function SceneEditor({ scene, theme, name, onChange, notify }: { scene: RoadScene; theme: RoadTheme; name: string; onChange: (scene: RoadScene) => void; notify: (kind: 'ok' | 'error', text: string) => void }) {
  const [uploading, setUploading] = useState<'background' | 'portal' | null>(null);
  const bg = scene.background ?? { kind: 'theme' as BackgroundKind };
  const preview = useMemo(() => cleanScene(scene), [scene]);
  const road = scene.roadColor ?? themeRoadColor[theme];
  const speed = scene.motion?.speed ?? motionDefaults.speed, follow = scene.motion?.interactive ?? motionDefaults.interactive;
  const setMotion = (motion: NonNullable<RoadScene['motion']>) => onChange({ ...scene, motion: { ...scene.motion, ...motion } });

  function setKind(kind: BackgroundKind) {
    if (kind === 'theme') return onChange({ ...scene, background: undefined });
    if (kind === 'motion') return onChange({ ...scene, background: { kind, colors: bg.colors ?? themeMotionColors[theme] } });
    onChange({ ...scene, background: { kind, url: bg.kind === kind ? bg.url : undefined } });
  }
  async function upload(file: File, use: 'background' | 'portal') {
    setUploading(use);
    try {
      const url = await uploadSceneMedia(file, use, `${name || 'road'}-${use}`);
      if (use === 'portal') onChange({ ...scene, portalUrl: url });
      else onChange({ ...scene, background: { kind: file.type.startsWith('video/') ? 'video' : 'image', url } });
      notify('ok', 'Uploaded. Save the road to publish it.');
    } catch (e) { notify('error', e instanceof Error ? e.message : 'Upload failed.'); }
    setUploading(null);
  }
  const fileInput = (use: 'background' | 'portal', accept: string, label: string) => <label className="adm-btn">{uploading === use ? 'Uploading…' : label}
    <input type="file" hidden accept={accept} disabled={!!uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, use); e.target.value = ''; }} /></label>;

  return <fieldset className="adm-scene">
    <legend>Scene look on the home road</legend>
    <div className="adm-scene-grid">
      <div className="adm-stack">
        <div className="adm-stack-sm">
          <span className="adm-label">Background</span>
          <div className="adm-seg" role="radiogroup" aria-label="Background">{KINDS.map(([kind, label]) => <button type="button" key={kind} role="radio" aria-checked={bg.kind === kind} className={bg.kind === kind ? 'active' : ''} onClick={() => setKind(kind)}>{label}</button>)}</div>
          {bg.kind === 'motion' && <div className="adm-row">{[0, 1, 2].map(i => <label key={i} className="adm-color"><input type="color" value={(bg.colors ?? themeMotionColors[theme])[i]} onChange={e => { const colors = [...(bg.colors ?? themeMotionColors[theme])] as [string, string, string]; colors[i] = e.target.value; onChange({ ...scene, background: { kind: 'motion', colors } }); }} />Colour {i + 1}</label>)}</div>}
          {bg.kind === 'image' && <div className="adm-row">{fileInput('background', 'image/png,image/jpeg,image/webp,image/gif', bg.url ? 'Replace image / GIF' : 'Upload image / GIF')}<small className="adm-muted">JPG, PNG, WebP or animated GIF, up to 15 MB. Landscape works best (1920×1080).</small></div>}
          {bg.kind === 'video' && <div className="adm-row">{fileInput('background', 'video/mp4,video/webm,video/quicktime', bg.url ? 'Replace video' : 'Upload video')}<small className="adm-muted">MP4, WebM or MOV, up to 60 MB. It plays silently on a loop; 5–15 seconds is ideal.</small></div>}
          {(bg.kind === 'image' || bg.kind === 'video') && !bg.url && <small className="adm-muted">Until a file is uploaded, the theme background is used.</small>}
        </div>
        <div className="adm-stack-sm">
          <span className="adm-label">Motion</span>
          <div className="adm-row"><span className="adm-muted adm-inline-label">Speed</span><div className="adm-seg" role="radiogroup" aria-label="Motion speed">{SPEEDS.map(([value, label]) => <button type="button" key={value} role="radio" aria-checked={speed === value} className={speed === value ? 'active' : ''} onClick={() => setMotion({ speed: value })}>{label}</button>)}</div></div>
          <div className="adm-row"><span className="adm-muted adm-inline-label">Follows the mouse</span><div className="adm-seg" role="radiogroup" aria-label="Follows the mouse">{FOLLOW.map(([value, label]) => <button type="button" key={value} role="radio" aria-checked={follow === value} className={follow === value ? 'active' : ''} onClick={() => setMotion({ interactive: value })}>{label}</button>)}</div></div>
          <small className="adm-muted">The background moves gently on its own and shifts with the visitor’s mouse (phones get the gentle movement only).</small>
        </div>
        <div className="adm-stack-sm">
          <span className="adm-label">Road colour</span>
          <div className="adm-row">
            <label className="adm-check"><input type="checkbox" checked={!!scene.roadColor} onChange={e => onChange({ ...scene, roadColor: e.target.checked ? themeRoadColor[theme] : undefined })} />Custom road colour</label>
            {scene.roadColor && <label className="adm-color"><input type="color" value={scene.roadColor} onChange={e => onChange({ ...scene, roadColor: e.target.value })} />{scene.roadColor}</label>}
          </div>
        </div>
        <div className="adm-stack-sm">
          <span className="adm-label">O shape</span>
          <div className="adm-row">
            {fileInput('portal', 'image/png,image/webp,image/gif', scene.portalUrl ? 'Replace O artwork' : 'Upload custom O artwork')}
            {scene.portalUrl && <button type="button" className="adm-btn" onClick={() => onChange({ ...scene, portalUrl: undefined })}>Use theme O</button>}
          </div>
          <small className="adm-muted">Square PNG, WebP or GIF (1024×1024) with a transparent hole in the middle, like the <a href={portalTemplate} download target="_blank" rel="noopener noreferrer">template</a>.</small>
        </div>
      </div>
      <div className="adm-stack-sm">
        <span className="adm-label">Preview</span>
        <div className="adm-scene-preview" onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--bg-px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); e.currentTarget.style.setProperty('--bg-py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); }} onPointerLeave={e => { e.currentTarget.style.setProperty('--bg-px', '0'); e.currentTarget.style.setProperty('--bg-py', '0'); }}>
          <StationBackdrop theme={theme} scene={preview} present load />
          <svg className="adm-scene-road" viewBox="0 0 400 225" preserveAspectRatio="none" aria-hidden="true"><polygon points="118,225 282,225 212,118 188,118" fill={lighter(road)} /><polygon points="134,225 266,225 208,118 192,118" fill={road} /></svg>
          <img className="adm-scene-o" src={preview.portalUrl ? cloudinaryImage(preview.portalUrl, 512) : artworkSrc(themeIndex(theme))} alt="" />
        </div>
        <small className="adm-muted">Approximate preview: move your mouse over it. Save the road, then check the home page.</small>
      </div>
    </div>
  </fieldset>;
}
