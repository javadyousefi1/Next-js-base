import type { BoxShape } from "../gift-builder.config";

/** A point in the world XZ plane: `[x, z]` (Y is up, the box floor is at y = 0). */
export type Point = readonly [number, number];
/** A closed polygon (the last point is not repeated). */
export type Outline = readonly Point[];

/** Box dimensions in world units (slot spacing is 1.0). */
export const BOX_SIZE = {
  wallThickness: 0.12,
  lidOverhang: 0.06,
  wallHeight: 0.9,
  baseHeight: 0.12,
  lidHeight: 0.26,
  /** Top of the inner lining: chocolates rest here... */
  floorTop: 0.13,
  /** ...or here, on top of the paper straw. */
  strawTop: 0.3,
} as const;

const RECT_WIDTH = 4.3;
const RECT_DEPTH = 3.3;
const RECT_CORNER_RADIUS = 0.25;
const CIRCLE_RADIUS = 1.85;
const CIRCLE_SEGMENTS = 64;
const HEART_WIDTH = 4.5;
const HEART_SEGMENTS = 96;
const CORNER_SEGMENTS = 6;

function getRectOutline(offset: number): Outline {
  const halfX = RECT_WIDTH / 2 + offset;
  const halfZ = RECT_DEPTH / 2 + offset;
  const radius = RECT_CORNER_RADIUS + offset;
  // Corner arc centers with the angle where each arc starts (counter-clockwise).
  const corners: [number, number, number][] = [
    [halfX - radius, halfZ - radius, 0],
    [-(halfX - radius), halfZ - radius, Math.PI / 2],
    [-(halfX - radius), -(halfZ - radius), Math.PI],
    [halfX - radius, -(halfZ - radius), (Math.PI * 3) / 2],
  ];

  return corners.flatMap(([cx, cz, start]) =>
    Array.from({ length: CORNER_SEGMENTS + 1 }, (_, i): Point => {
      const angle = start + ((Math.PI / 2) * i) / CORNER_SEGMENTS;
      return [cx + radius * Math.cos(angle), cz + radius * Math.sin(angle)];
    }),
  );
}

function getCircleOutline(offset: number): Outline {
  const radius = CIRCLE_RADIUS + offset;

  return Array.from({ length: CIRCLE_SEGMENTS }, (_, i): Point => {
    const angle = (Math.PI * 2 * i) / CIRCLE_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

function getHeartOutline(offset: number): Outline {
  const raw = Array.from({ length: HEART_SEGMENTS }, (_, i): Point => {
    const t = (Math.PI * 2 * i) / HEART_SEGMENTS;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    // The lobes (positive y) go to the back of the box (−z).
    return [x, -y];
  });
  const bounds = polygonBounds(raw);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const scale = HEART_WIDTH / (bounds.maxX - bounds.minX);
  // Offsetting a heart exactly is hard; scaling it about its center is a good approximation.
  const grow = 1 + offset / (HEART_WIDTH / 2);

  return raw.map(([x, z]): Point => [(x - centerX) * scale * grow, (z - centerZ) * scale * grow]);
}

/**
 * Closed outline of a box in world XZ. `offset` 0 is the inner wall line; positive grows outward
 * (`BOX_SIZE.wallThickness` = outer wall, + `lidOverhang` = lid).
 */
export function getBoxOutline(shape: BoxShape, offset: number): Outline {
  if (shape === "rect") return getRectOutline(offset);
  if (shape === "circle") return getCircleOutline(offset);

  return getHeartOutline(offset);
}

export function polygonBounds(outline: Outline) {
  const xs = outline.map(([x]) => x);
  const zs = outline.map(([, z]) => z);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  };
}

/** Every edge `[from, to]` of the closed polygon. */
function getEdges(outline: Outline): [Point, Point][] {
  return outline.map((to, i): [Point, Point] => [
    outline[(i + outline.length - 1) % outline.length] ?? to,
    to,
  ]);
}

/** Even-odd ray casting. */
export function pointInPolygon(outline: Outline, [x, z]: Point): boolean {
  let inside = false;

  for (const [[xj, zj], [xi, zi]] of getEdges(outline)) {
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }

  return inside;
}

/** Shortest distance from a point to any edge of the polygon. */
export function distanceToPolygonEdge(outline: Outline, [x, z]: Point): number {
  let best = Infinity;

  for (const [[ax, az], [bx, bz]] of getEdges(outline)) {
    const dx = bx - ax;
    const dz = bz - az;
    const lengthSquared = dx * dx + dz * dz;
    const t = lengthSquared === 0 ? 0 : ((x - ax) * dx + (z - az) * dz) / lengthSquared;
    const clamped = Math.min(1, Math.max(0, t));
    best = Math.min(best, Math.hypot(x - (ax + clamped * dx), z - (az + clamped * dz)));
  }

  return best;
}

/**
 * Where the line through the center along `axis` ("x": the line z = 0, "z": the line x = 0)
 * enters and leaves the outline: `[min, max]` along that axis.
 */
export function spanThroughCenter(outline: Outline, axis: "x" | "z"): [number, number] {
  // `fixed` is the coordinate the line is pinned to (0); `free` runs along the axis.
  const split = ([x, z]: Point): [number, number] => (axis === "x" ? [z, x] : [x, z]);
  const hits: number[] = [];

  for (const [from, to] of getEdges(outline)) {
    const [fixedA, freeA] = split(from);
    const [fixedB, freeB] = split(to);
    if (fixedA > 0 !== fixedB > 0) {
      hits.push(freeA + ((0 - fixedA) / (fixedB - fixedA)) * (freeB - freeA));
    }
  }

  const bounds = polygonBounds(outline);
  if (hits.length === 0) {
    return axis === "x" ? [bounds.minX, bounds.maxX] : [bounds.minZ, bounds.maxZ];
  }

  return [Math.min(...hits), Math.max(...hits)];
}
