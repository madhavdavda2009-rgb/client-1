// Layout of the home road for any number of stations (roads from the CMS).
// Positions are measured in "station units": station k spans roughly u = k..k+1, and journey progress p = u / count.
// The first, middle and last stations reuse the exact timings of the original three-station road, so three roads
// look and scroll exactly as before; extra roads repeat the middle station.
export const MAX_ROADS = 10;
export const FEATURED_PER_ROAD = 3;

type Role = 'first' | 'middle' | 'last';
// Offsets from the start of the station: scroll pause, product bunch, scenic O gate, roadside extras.
const template: Record<Role, { pause: number; stop: number; gate: number; extras: number[] }> = {
  first: { pause: .435, stop: .51, gate: .84, extras: [.39, .51, .705, .87, 1.02] },
  middle: { pause: .365, stop: .44, gate: .80, extras: [.5, .605, .71, .815, .92] },
  last: { pause: .325, stop: .40, gate: .73, extras: [.655] },
};
// Station-unit timings shared by every station.
const BLEND = .135, GATE_ENTRY = .09, ARRIVAL_STEP = .096, ARRIVAL = .075, TRAVEL = .135, HOLD = .027;

export type Station = { start: number; end: number; pause: number; stop: number; gate: number; extras: number[]; capacity: number; last: boolean };
export type RoadLayout = ReturnType<typeof roadLayout>;

const roleOf = (k: number, n: number): Role => k === 0 ? 'first' : k === n - 1 ? 'last' : 'middle';
// Boundary between station k-1 and station k, in station units.
const boundary = (k: number, n: number) => k === 1 && n === 2 ? 1 : k === 1 ? 1.035 : k === n - 1 ? k - .035 : k;

export function roadLayout(count: number) {
  const n = Math.max(1, Math.min(MAX_ROADS, count));
  const stations: Station[] = Array.from({ length: n }, (_, k) => {
    const t = template[roleOf(k, n)];
    const extras = t.extras.map(o => k + o).filter(u => u < n - .1).map(u => u / n);
    return {
      start: k === 0 ? 0 : boundary(k, n) / n, end: k === n - 1 ? 1 : boundary(k + 1, n) / n,
      pause: (k + t.pause) / n, stop: (k + t.stop) / n, gate: (k + t.gate) / n,
      extras, capacity: FEATURED_PER_ROAD + extras.length, last: k === n - 1,
    };
  });
  return {
    count: n, stations,
    blend: BLEND / n, gateEntry: GATE_ENTRY / n, arrivalStep: ARRIVAL_STEP / n, arrival: ARRIVAL / n, travel: TRAVEL / n, hold: HOLD / n,
    // Road length needed, relative to the original three-station road.
    lengthScale: .09 + n * .91 / 3,
    // Distance along the road (relative to the original road's length) for journey progress p.
    distance: (p: number) => .045 + p * n * .91 / 3,
    stationAt(p: number) { let i = 0; while (i < n - 1 && p >= stations[i + 1].start) i += 1; return i; },
  };
}

export const roadCapacity = (index: number, count: number) => roadLayout(count).stations[Math.min(index, Math.max(0, Math.min(MAX_ROADS, count) - 1))]?.capacity ?? FEATURED_PER_ROAD;
