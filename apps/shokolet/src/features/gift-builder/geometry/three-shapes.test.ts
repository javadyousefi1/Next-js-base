import { describe, expect, test } from "bun:test";

import {
  createBaseGeometry,
  createFloorGeometry,
  createLidGeometry,
  createWallGeometry,
} from "./three-shapes";

function depth(geometry: ReturnType<typeof createWallGeometry>) {
  geometry.computeBoundingBox();
  return (geometry.boundingBox?.max.z ?? 0) - (geometry.boundingBox?.min.z ?? 0);
}

describe("three shapes", () => {
  test("geometries are memoized per box shape", () => {
    expect(createWallGeometry("rect")).toBe(createWallGeometry("rect"));
    expect(createWallGeometry("rect")).not.toBe(createWallGeometry("circle"));
  });

  test("extrusion depth matches the box dimensions", () => {
    expect(depth(createWallGeometry("rect"))).toBeCloseTo(0.9, 5);
    expect(depth(createBaseGeometry("rect"))).toBeCloseTo(0.12, 5);
    expect(depth(createFloorGeometry("rect"))).toBeCloseTo(0.01, 5);
    // Lid: 0.26 + a 0.04 bevel on both sides.
    expect(depth(createLidGeometry("rect"))).toBeCloseTo(0.34, 5);
  });
});
