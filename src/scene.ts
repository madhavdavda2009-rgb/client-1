import background from '../assets/christmas/background.png?url';
export type Placement = { x: number; y: number; width: number; scale: number; rotation: number };
export type Product = { id: string; image: string; alt: string; desktop: Placement; mobile: Placement; sway: number; z: number };
export type Layer = { id: 'background' | 'far' | 'mid' | 'near' | 'foreground' | 'atmosphere'; image?: string; depth: number; z: number };
export const layers: Layer[] = [{ id: 'background', image: background, depth: 0.08, z: 0 }];
const assets = import.meta.glob('../frames/[1-8].png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
// Fixed world positions in viewport units. One shared camera visits every entry.
const positions = [
  [0.3, 0.3, -3], [1.65, 0.12, 4], [2.8, 1.05, -3], [1.35, 1.65, 3],
  [0.05, 2.35, -4], [1.65, 2.9, 3], [2.8, 3.85, 4], [0.35, 4.55, -3],
];
export const products: Product[] = positions.map(([x, y, rotation], i) => ({
  id: String(i + 1), image: assets[`../frames/${i + 1}.png`], alt: `Toyon product artwork ${i + 1}`,
  desktop: { x, y, width: 36, rotation, scale: 1 },
  mobile: { x, y, width: 78, rotation: rotation * 0.6, scale: 1 },
  sway: 0.6, z: 5 + i % 2,
}));
