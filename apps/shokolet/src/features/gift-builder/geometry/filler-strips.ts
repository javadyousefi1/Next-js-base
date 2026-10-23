import { FILLER } from "../gift-builder.config";
import { distanceToPolygonEdge, pointInPolygon, polygonBounds, type Outline } from "./box-outline";
import { createRandom } from "./random";

export type FillerStrip = {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  colorIndex: number;
};

const MIN_EDGE_DISTANCE = 0.08;
const MIN_Y = 0.13;
const MAX_Y = 0.33;

/** Scatters `count` paper strips inside the outline. Deterministic for a given `seed`. */
export function createFillerStrips(outline: Outline, count: number, seed: number): FillerStrip[] {
  const random = createRandom(seed);
  const bounds = polygonBounds(outline);

  return Array.from({ length: count }, () => {
    // Rejection sampling: draw in the bounding box until the point is inside the box.
    let x = 0;
    let z = 0;
    do {
      x = bounds.minX + random() * (bounds.maxX - bounds.minX);
      z = bounds.minZ + random() * (bounds.maxZ - bounds.minZ);
    } while (
      !pointInPolygon(outline, [x, z]) ||
      distanceToPolygonEdge(outline, [x, z]) < MIN_EDGE_DISTANCE
    );

    return {
      x,
      y: MIN_Y + random() * (MAX_Y - MIN_Y),
      z,
      rotX: (random() - 0.5) * 0.6,
      rotY: random() * Math.PI * 2,
      rotZ: (random() - 0.5) * 0.6,
      colorIndex: Math.floor(random() * FILLER.palette.length),
    };
  });
}
