// src/utils/routing.ts
// PRAVAH 360 - Flood-safe routing engine
// Grid A* that plans a path around Vijayawada's inundation zones.

import type {
  FloodZone,
  LatLng,
  RoutingOptions,
  SafeRoute,
} from "@/types/flood";

/** Grid resolution in degrees (~165 m at Vijayawada's latitude). */
const CELL = 0.0015;
/** Urban emergency average speed used for ETA, km/h. */
const URBAN_SPEED_KMH = 25;
/** Multiplier applied to a zone radius when checking route avoidance. */
const DETOUR_MARGIN = 1.6;
/** Padding added around the routing bounds, in degrees. */
const BOUNDS_PADDING = 0.01;

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Shortest distance in metres from a point to a lat/lng segment. */
function distanceToSegmentMeters(
  point: LatLng,
  start: LatLng,
  end: LatLng
): number {
  const latScale = 111320;
  const lngScale = 111320 * Math.cos((point.lat * Math.PI) / 180);
  const px = point.lng * lngScale;
  const py = point.lat * latScale;
  const ax = start.lng * lngScale;
  const ay = start.lat * latScale;
  const bx = end.lng * lngScale;
  const by = end.lat * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Metres from a point to a zone centre. */
function distanceToZoneMeters(point: LatLng, zone: FloodZone): number {
  return haversineKm(point, zone) * 1000;
}

interface Grid {
  cols: number;
  rows: number;
  minLat: number;
  minLng: number;
  blocked: Uint8Array;
  penalty: Float32Array;
}

function buildGrid(
  origin: LatLng,
  destination: LatLng,
  zones: FloodZone[],
  options: RoutingOptions
): Grid {
  const lats = [origin.lat, destination.lat, ...zones.map((z) => z.lat)];
  const lngs = [origin.lng, destination.lng, ...zones.map((z) => z.lng)];
  const minLat = Math.min(...lats) - BOUNDS_PADDING;
  const maxLat = Math.max(...lats) + BOUNDS_PADDING;
  const minLng = Math.min(...lngs) - BOUNDS_PADDING;
  const maxLng = Math.max(...lngs) + BOUNDS_PADDING;

  const cols = Math.max(4, Math.ceil((maxLng - minLng) / CELL) + 1);
  const rows = Math.max(4, Math.ceil((maxLat - minLat) / CELL) + 1);
  const blocked = new Uint8Array(cols * rows);
  const penalty = new Float32Array(cols * rows);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell: LatLng = {
        lat: minLat + row * CELL,
        lng: minLng + col * CELL,
      };
      let worst = 0;
      for (const zone of zones) {
        const distance = distanceToZoneMeters(cell, zone);
        if (distance > zone.radius * 2.5) continue;
        const inside = distance <= zone.radius;
        if (
          options.avoidFlooded &&
          inside &&
          (zone.severity === "HIGH" || zone.severity === "MED")
        ) {
          blocked[row * cols + col] = 1;
        }
        if (zone.severity === "HIGH") {
          worst = Math.max(worst, inside ? 1 : 1 - distance / (zone.radius * 2.5));
        } else if (zone.severity === "MED") {
          worst = Math.max(
            worst,
            inside ? 0.6 : 0.6 * (1 - distance / (zone.radius * 2.5))
          );
        } else {
          worst = Math.max(
            worst,
            inside ? 0.25 : 0.25 * (1 - distance / (zone.radius * 2.5))
          );
        }
      }
      // "Prefer elevated paths" = stay clear of the flood plain, since the
      // farther a cell is from an inundation zone the higher it sits.
      penalty[row * cols + col] = options.preferElevated ? worst : worst * 0.35;
    }
  }

  return { cols, rows, minLat, minLng, blocked, penalty };
}

function toIndex(grid: Grid, row: number, col: number): number {
  return row * grid.cols + col;
}

function toLatLng(grid: Grid, row: number, col: number): LatLng {
  return {
    lat: grid.minLat + row * CELL,
    lng: grid.minLng + col * CELL,
  };
}

/** Snap a free coordinate to the nearest unblocked grid cell. */
function snapToCell(
  grid: Grid,
  point: LatLng
): { row: number; col: number } {
  const col = Math.round((point.lng - grid.minLng) / CELL);
  const row = Math.round((point.lat - grid.minLat) / CELL);
  const clampRow = Math.max(0, Math.min(grid.rows - 1, row));
  const clampCol = Math.max(0, Math.min(grid.cols - 1, col));
  if (!grid.blocked[toIndex(grid, clampRow, clampCol)]) {
    return { row: clampRow, col: clampCol };
  }

  for (let radius = 1; radius < 12; radius += 1) {
    for (let dr = -radius; dr <= radius; dr += 1) {
      for (let dc = -radius; dc <= radius; dc += 1) {
        const r = clampRow + dr;
        const c = clampCol + dc;
        if (r < 0 || c < 0 || r >= grid.rows || c >= grid.cols) continue;
        if (!grid.blocked[toIndex(grid, r, c)]) return { row: r, col: c };
      }
    }
  }
  return { row: clampRow, col: clampCol };
}

/** Binary min-heap keyed by f-score. */
class MinHeap {
  private nodes: { key: number; index: number }[] = [];

  get size(): number {
    return this.nodes.length;
  }

  push(index: number, key: number): void {
    this.nodes.push({ key, index });
    let i = this.nodes.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.nodes[parent].key <= this.nodes[i].key) break;
      [this.nodes[parent], this.nodes[i]] = [this.nodes[i], this.nodes[parent]];
      i = parent;
    }
  }

  pop(): number | undefined {
    if (this.nodes.length === 0) return undefined;
    const top = this.nodes[0];
    const last = this.nodes.pop();
    if (last && this.nodes.length > 0) {
      this.nodes[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (
          left < this.nodes.length &&
          this.nodes[left].key < this.nodes[smallest].key
        ) {
          smallest = left;
        }
        if (
          right < this.nodes.length &&
          this.nodes[right].key < this.nodes[smallest].key
        ) {
          smallest = right;
        }
        if (smallest === i) break;
        [this.nodes[smallest], this.nodes[i]] = [this.nodes[i], this.nodes[smallest]];
        i = smallest;
      }
    }
    return top.index;
  }
}

/** A* search over the grid. Returns cell path or null when fully blocked. */
function findPath(
  grid: Grid,
  start: { row: number; col: number },
  goal: { row: number; col: number }
): { row: number; col: number }[] | null {
  const total = grid.cols * grid.rows;
  const gScore = new Float32Array(total).fill(Number.POSITIVE_INFINITY);
  const cameFrom = new Int32Array(total).fill(-1);
  const closed = new Uint8Array(total);
  const heuristic = (row: number, col: number) =>
    Math.hypot(row - goal.row, col - goal.col) * CELL;

  const startIndex = toIndex(grid, start.row, start.col);
  const goalIndex = toIndex(grid, goal.row, goal.col);
  gScore[startIndex] = 0;

  const open = new MinHeap();
  open.push(startIndex, heuristic(start.row, start.col));

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  while (open.size > 0) {
    const currentIndex = open.pop();
    if (currentIndex === undefined) break;
    if (closed[currentIndex]) continue;
    closed[currentIndex] = 1;
    if (currentIndex === goalIndex) break;

    const row = Math.floor(currentIndex / grid.cols);
    const col = currentIndex % grid.cols;

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nc < 0 || nr >= grid.rows || nc >= grid.cols) continue;
      const neighborIndex = toIndex(grid, nr, nc);
      if (grid.blocked[neighborIndex] || closed[neighborIndex]) continue;
      if (dr !== 0 && dc !== 0) {
        // Prevent diagonal shortcuts through a blocked corner.
        const sideA = toIndex(grid, row + dr, col);
        const sideB = toIndex(grid, row, col + dc);
        if (grid.blocked[sideA] || grid.blocked[sideB]) continue;
      }
      const step =
        (dr !== 0 && dc !== 0 ? Math.SQRT2 : 1) * CELL * (1 + grid.penalty[neighborIndex] * 4);
      const tentative = gScore[currentIndex] + step;
      if (tentative < gScore[neighborIndex]) {
        gScore[neighborIndex] = tentative;
        cameFrom[neighborIndex] = currentIndex;
        open.push(neighborIndex, tentative + heuristic(nr, nc));
      }
    }
  }

  if (cameFrom[goalIndex] === -1 && startIndex !== goalIndex) return null;

  const path: { row: number; col: number }[] = [];
  let cursor = goalIndex;
  while (cursor !== -1) {
    path.push({ row: Math.floor(cursor / grid.cols), col: cursor % grid.cols });
    if (cursor === startIndex) break;
    cursor = cameFrom[cursor];
  }
  return path.reverse();
}

/** Drop collinear intermediate points so the polyline stays small. */
function simplify(points: LatLng[]): LatLng[] {
  if (points.length <= 2) return points;
  const result: LatLng[] = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const previous = result[result.length - 1];
    const current = points[i];
    const next = points[i + 1];
    const cross =
      (current.lng - previous.lng) * (next.lat - previous.lat) -
      (current.lat - previous.lat) * (next.lng - previous.lng);
    if (Math.abs(cross) > 1e-9) result.push(current);
  }
  result.push(points[points.length - 1]);
  return result;
}

/**
 * Compute a flood-safe route between two points.
 * Falls back to the straight line when the grid yields no path.
 */
export function computeSafeRoute(
  origin: LatLng,
  destination: LatLng,
  zones: FloodZone[],
  options: Omit<RoutingOptions, "origin" | "destination">
): SafeRoute {
  const routingOptions: RoutingOptions = { ...options, origin, destination };
  const grid = buildGrid(origin, destination, zones, routingOptions);
  const start = snapToCell(grid, origin);
  const goal = snapToCell(grid, destination);
  const cellPath = findPath(grid, start, goal);

  let points: LatLng[];
  if (cellPath && cellPath.length > 1) {
    points = simplify([
      origin,
      ...cellPath.map((cell) => toLatLng(grid, cell.row, cell.col)),
      destination,
    ]);
  } else {
    points = [origin, destination];
  }

  let distanceKm = 0;
  for (let i = 1; i < points.length; i += 1) {
    distanceKm += haversineKm(points[i - 1], points[i]);
  }
  distanceKm = Number(distanceKm.toFixed(2));

  // Which flooded corridors does the naive straight line cross?
  const avoidedZoneIds = zones
    .filter(
      (zone) =>
        distanceToSegmentMeters(zone, origin, destination) <=
        zone.radius * DETOUR_MARGIN
    )
    .filter((zone) =>
      options.avoidFlooded
        ? zone.severity === "HIGH" || zone.severity === "MED"
        : zone.severity === "HIGH"
    )
    .map((zone) => zone.id);

  const etaMinutes = Math.max(1, Math.round((distanceKm / URBAN_SPEED_KMH) * 60));
  const summary = `${distanceKm} km · ${etaMinutes} min · ${
    avoidedZoneIds.length > 0
      ? `${avoidedZoneIds.length} flood zone${avoidedZoneIds.length > 1 ? "s" : ""} avoided`
      : "no flooding on the direct path"
  }`;

  return { points, distanceKm, etaMinutes, avoidedZoneIds, summary };
}
