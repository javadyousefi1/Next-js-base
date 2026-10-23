import { BOXES, type BoxId, type BoxShape } from "../gift-builder.config";
import { distanceToPolygonEdge, getBoxOutline, pointInPolygon, type Point } from "./box-outline";

const SLOT_SPACING = 1;
/** Minimum distance between a slot center and the inner wall (chocolate footprint ≤ 0.85). */
const MIN_EDGE_DISTANCE = 0.47;

/** Rect: 4 columns × 3 rows, centered. */
function getRectSlots(): Point[] {
  return Array.from({ length: 12 }, (_, i): Point => [(i % 4) - 1.5, Math.floor(i / 4) - 1]);
}

/** Circle: one in the center and seven on a ring. */
function getCircleSlots(): Point[] {
  const ring = Array.from({ length: 7 }, (_, i): Point => {
    const angle = (Math.PI * 2 * i) / 7 - Math.PI / 2;
    return [1.2 * Math.cos(angle), 1.2 * Math.sin(angle)];
  });

  return [[0, 0], ...ring];
}

/**
 * Heart: a grid of spacing 1.0, shifted so the layout holds the most slots. X offsets 0 and 0.5
 * keep the grid symmetric about x = 0 (the heart itself is).
 */
function getHeartSlots(): Point[] {
  const inner = getBoxOutline("heart", 0);
  const range = Array.from({ length: 11 }, (_, i) => i - 5);
  let best: Point[] = [];

  for (const offsetX of [0, 0.5]) {
    for (let step = 0; step < 10; step++) {
      const offsetZ = step / 10;
      const candidates = range.flatMap((row) =>
        range.map((col): Point => [offsetX + col * SLOT_SPACING, offsetZ + row * SLOT_SPACING]),
      );
      const slots = candidates.filter(
        (point) =>
          pointInPolygon(inner, point) && distanceToPolygonEdge(inner, point) >= MIN_EDGE_DISTANCE,
      );
      if (slots.length > best.length) best = slots;
    }
  }

  return best;
}

const cache = new Map<BoxShape, readonly Point[]>();

/** Slot centers `[x, z]` of a box, in fill order (back to front, then left to right). */
export function getSlotPositions(shape: BoxShape): readonly Point[] {
  const cached = cache.get(shape);
  if (cached) return cached;

  const slots =
    shape === "rect" ? getRectSlots() : shape === "circle" ? getCircleSlots() : getHeartSlots();
  const sorted = slots.toSorted((a, b) => a[1] - b[1] || a[0] - b[0]);
  cache.set(shape, sorted);

  return sorted;
}

/** How many chocolates each box holds: derived from its slot layout (single source of truth). */
export const BOX_CAPACITY = Object.fromEntries(
  BOXES.map((box) => [box.id, getSlotPositions(box.shape).length]),
) as Record<BoxId, number>;
