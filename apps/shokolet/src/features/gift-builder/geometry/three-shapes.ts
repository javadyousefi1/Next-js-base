import { ExtrudeGeometry, Path, Shape, Vector2 } from "three";

import type { BoxShape } from "../gift-builder.config";
import { BOX_SIZE, getBoxOutline, type Outline } from "./box-outline";

/*
 * ExtrudeGeometry extrudes along +Z; the meshes get `rotation.x = -Math.PI / 2`, which maps shape
 * (x, y) at depth d to world (x, d, -y). So an outline point [x, z] becomes Vector2(x, -z).
 */
function toPoints(outline: Outline): Vector2[] {
  return outline.map(([x, z]) => new Vector2(x, -z));
}

function createShape(outline: Outline, hole?: Outline): Shape {
  const shape = new Shape(toPoints(outline));
  if (hole) shape.holes.push(new Path(toPoints(hole)));

  return shape;
}

/** Builds a geometry once per box shape. */
function memoize(build: (shape: BoxShape) => ExtrudeGeometry) {
  const cache = new Map<BoxShape, ExtrudeGeometry>();

  return (shape: BoxShape) => {
    const cached = cache.get(shape);
    if (cached) return cached;

    const geometry = build(shape);
    cache.set(shape, geometry);

    return geometry;
  };
}

const outerOffset = BOX_SIZE.wallThickness;
const lidOffset = BOX_SIZE.wallThickness + BOX_SIZE.lidOverhang;

/** Outer outline with the inner outline as a hole: the four walls. */
export const createWallGeometry = memoize(
  (shape) =>
    new ExtrudeGeometry(createShape(getBoxOutline(shape, outerOffset), getBoxOutline(shape, 0)), {
      depth: BOX_SIZE.wallHeight,
      bevelEnabled: false,
    }),
);

/** The solid bottom plate. */
export const createBaseGeometry = memoize(
  (shape) =>
    new ExtrudeGeometry(createShape(getBoxOutline(shape, outerOffset)), {
      depth: BOX_SIZE.baseHeight,
      bevelEnabled: false,
    }),
);

/** A thin inner lining that sits on the base. */
export const createFloorGeometry = memoize(
  (shape) =>
    new ExtrudeGeometry(createShape(getBoxOutline(shape, 0)), {
      depth: 0.01,
      bevelEnabled: false,
    }),
);

/** The lid; its bevel adds 0.04 around and above/below the outline. */
export const createLidGeometry = memoize(
  (shape) =>
    new ExtrudeGeometry(createShape(getBoxOutline(shape, lidOffset)), {
      depth: BOX_SIZE.lidHeight,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    }),
);
