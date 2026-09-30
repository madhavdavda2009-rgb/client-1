import { categories, productById } from './catalog';
export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 9600;
const xStops = [650, 480, 720, 510, 680, 450, 710, 500, 690, 520];
const sides = [-1, 1, -1, -1, 1, -1, 1, 1, -1, 1];
export const cameraStops = categories.map((category, index) => ({
  category, index, x: xStops[index], y: WORLD_HEIGHT - 620 - index * 900,
  side: sides[index], products: category.products.slice(0, 4).map(id => productById[id]),
}));
export const cameraStart = { x: 560, y: WORLD_HEIGHT - 80 };
export const cameraEnd = { x: 620, y: 150 };
const points = [{x:560,y:WORLD_HEIGHT+850}, cameraStart, ...cameraStops, cameraEnd];
export const cameraPathData = points.reduce((d, point, i) => {
  if (!i) return `M${point.x},${point.y}`;
  const prior = points[i - 1], span = prior.y - point.y;
  return `${d} C${prior.x},${prior.y-span*.43} ${point.x},${point.y+span*.43} ${point.x},${point.y}`;
}, '');
export const clusterArrangement = [
  { x: -180, y: -20, size: .78, rotation: -5 },
  { x: -15, y: -160, size: .68, rotation: 3 },
  { x: 170, y: -35, size: .76, rotation: 5 },
  { x: 10, y: 78, size: .91, rotation: -2 },
];
export const roadColors = ['#edf8fc','#ead29b','#f5e4ad','#ddc191','#f7db98','#c5dce4','#f5d9e8','#dbd7ac','#ffe0a5','#d9caef'];
