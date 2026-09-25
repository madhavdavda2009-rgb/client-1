import background from '../assets/christmas/background.png?url';
export type Placement = { x: number; y: number; width: number; scale: number; rotation: number };
export type Product = { id: string; image: string; alt: string; title: string; description: string; desktop: Placement; mobile: Placement; sway: number; z: number };
export type Layer = { id: 'background' | 'far' | 'mid' | 'near' | 'foreground' | 'atmosphere'; image?: string; depth: number; z: number };
export const layers: Layer[] = [{ id: 'background', image: background, depth: 0.08, z: 0 }];
const assets = import.meta.glob('../frames/[1-8].png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
// Fixed world positions in viewport units. One shared camera visits every entry.
const positions = [
  [0.3, 0.3, -3], [1.65, 0.12, 4], [2.8, 1.05, -3], [1.35, 1.65, 3],
  [0.05, 2.35, -4], [1.65, 2.9, 3], [2.8, 3.85, 4], [0.35, 4.55, -3],
];
// Visual labels and descriptions, not manufacturer specifications.
const copy = [
  ['Christmas tree', 'A green tree decorated with colourful ornaments, a gold star and wrapped gifts at its base.'],
  ['Santa hat', 'A curved red Santa hat with a white brim and a round white pom-pom.'],
  ['Gift box', 'A red present decorated with a wide gold ribbon and an oversized bow.'],
  ['Snowman', 'A smiling snowman wearing a black top hat and a red-and-green scarf, with outstretched arms.'],
  ['Christmas stocking', 'A red stocking with a white cuff, green toe and heel, and a festive ribbon detail.'],
  ['Christmas bells', 'Two gold bells framed by green holly leaves, red berries and a red bow.'],
  ['Candy cane', 'A red-and-white striped candy cane finished with green holly and a red ribbon.'],
  ['Santa Claus', 'A waving Santa in a red suit, carrying a sack filled with colourful gifts.'],
];
export const products: Product[] = positions.map(([x, y, rotation], i) => ({
  id: String(i + 1), image: assets[`../frames/${i + 1}.png`], alt: copy[i][0], title: copy[i][0], description: copy[i][1],
  desktop: { x, y, width: 25, rotation, scale: 1 },
  mobile: { x, y, width: 48, rotation: rotation * 0.6, scale: 1 },
  sway: 0.6, z: 5 + i % 2,
}));
