import type { RoadTheme } from './catalog';

// Per-station look of the home road, edited in Admin → Roads (stored in roads.scene).
// Anything not set falls back to the station's theme (festive / dinosaur / halloween).
export type BackgroundKind = 'theme' | 'motion' | 'image' | 'video';
export type RoadScene = {
  background?: { kind: BackgroundKind; url?: string; colors?: [string, string, string] };
  roadColor?: string;
  portalUrl?: string;
  // How the background moves: speed of the drift/colour animation, and how strongly it follows the mouse.
  motion?: { speed?: MotionSpeed; interactive?: MotionStrength };
};
export type MotionSpeed = 'slow' | 'normal' | 'fast';
export type MotionStrength = 'off' | 'gentle' | 'strong';
export const motionDefaults = { speed: 'normal' as MotionSpeed, interactive: 'gentle' as MotionStrength };
// Animation duration multiplier and mouse-follow distance (px) used by StationBackdrop.
export const speedFactor: Record<MotionSpeed, number> = { slow: 1.7, normal: 1, fast: .5 };
export const followDistance: Record<MotionStrength, number> = { off: 0, gentle: 16, strong: 40 };

// Theme defaults, used to pre-fill the admin form and when nothing custom is set.
export const themeMotionColors: Record<RoadTheme, [string, string, string]> = {
  christmas: ['#59bdf5', '#eaf8fa', '#ffd5c5'],
  dinosaurs: ['#55c9b6', '#e7efa7', '#ff9a50'],
  halloween: ['#542063', '#9b346b', '#ff9d2e'],
};
export const themeRoadColor: Record<RoadTheme, string> = { christmas: '#d8ba85', dinosaurs: '#c4ad78', halloween: '#c99b79' };
// Template for custom O artwork (1024×1024, transparent hole in the middle).
export const portalTemplate = '/assets/scenery/supplied/chirstmas_portal-v2-1024.webp';

const HEX = /^#[0-9a-f]{6}$/i;
const color = (value: unknown) => typeof value === 'string' && HEX.test(value) ? value.toLowerCase() : undefined;
// Only media hosted by us: Cloudinary, the project's Supabase storage, or files bundled with the site.
const mediaUrl = (value: unknown) => typeof value === 'string' && value.length <= 600
  && (/^https:\/\/res\.cloudinary\.com\/[^/\s"'()]+\/(image|video)\/upload\/[^\s"'()]+$/.test(value) || /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s"'()]+$/.test(value) || /^\/assets\/[^\s"'()]+$/.test(value))
  ? value : undefined;
export const isVideoUrl = (url: string) => /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url);

// Validates data from the database before it reaches the page (colours end up in CSS, URLs in src attributes).
export function cleanScene(raw: unknown): RoadScene {
  if (!raw || typeof raw !== 'object') return {};
  const input = raw as Record<string, unknown>;
  const scene: RoadScene = {};
  const bg = input.background as Record<string, unknown> | undefined;
  if (bg && typeof bg === 'object') {
    const kind = bg.kind;
    const colors = Array.isArray(bg.colors) ? bg.colors.map(color) : [];
    const url = mediaUrl(bg.url);
    if (kind === 'motion' && colors.length === 3 && colors.every(Boolean)) scene.background = { kind, colors: colors as [string, string, string] };
    else if (kind === 'image' && url && !isVideoUrl(url)) scene.background = { kind, url };
    else if (kind === 'video' && url && isVideoUrl(url)) scene.background = { kind, url };
  }
  const road = color(input.roadColor); if (road) scene.roadColor = road;
  const portal = mediaUrl(input.portalUrl); if (portal && !isVideoUrl(portal)) scene.portalUrl = portal;
  const motion = input.motion as Record<string, unknown> | undefined;
  if (motion && typeof motion === 'object') {
    const speed = ['slow', 'normal', 'fast'].includes(String(motion.speed)) ? motion.speed as MotionSpeed : undefined;
    const interactive = ['off', 'gentle', 'strong'].includes(String(motion.interactive)) ? motion.interactive as MotionStrength : undefined;
    if (speed || interactive) scene.motion = { ...(speed && { speed }), ...(interactive && { interactive }) };
  }
  return scene;
}
