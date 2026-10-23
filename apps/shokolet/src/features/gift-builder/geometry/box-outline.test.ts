import { describe, expect, test } from "bun:test";

import {
  distanceToPolygonEdge,
  getBoxOutline,
  pointInPolygon,
  polygonBounds,
  spanThroughCenter,
} from "./box-outline";

describe("getBoxOutline", () => {
  test("rect inner outline is 4.3 × 3.3", () => {
    const bounds = polygonBounds(getBoxOutline("rect", 0));
    expect(bounds.maxX - bounds.minX).toBeCloseTo(4.3, 5);
    expect(bounds.maxZ - bounds.minZ).toBeCloseTo(3.3, 5);
  });

  test("circle inner radius is 1.85", () => {
    const bounds = polygonBounds(getBoxOutline("circle", 0));
    expect(bounds.maxX).toBeCloseTo(1.85, 5);
  });

  test("heart is 4.5 wide, centered, with the lobes at the back (−z)", () => {
    const outline = getBoxOutline("heart", 0);
    const bounds = polygonBounds(outline);
    expect(bounds.maxX - bounds.minX).toBeCloseTo(4.5, 5);
    expect(bounds.minX + bounds.maxX).toBeCloseTo(0, 5);
    expect(bounds.minZ + bounds.maxZ).toBeCloseTo(0, 5);
    // The tip is a single point at the front (+z) on x = 0; the lobes are wider at the back.
    const front = outline.filter(([, z]) => z > bounds.maxZ - 0.05);
    expect(front.every(([x]) => Math.abs(x) < 0.3)).toBe(true);
  });

  test("a positive offset grows every shape", () => {
    for (const shape of ["rect", "circle", "heart"] as const) {
      const inner = polygonBounds(getBoxOutline(shape, 0));
      const outer = polygonBounds(getBoxOutline(shape, 0.12));
      expect(outer.maxX).toBeGreaterThan(inner.maxX);
      expect(outer.maxZ).toBeGreaterThan(inner.maxZ);
    }
  });
});

describe("polygon helpers", () => {
  const square = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const;

  test("pointInPolygon", () => {
    expect(pointInPolygon(square, [0, 0])).toBe(true);
    expect(pointInPolygon(square, [1.5, 0])).toBe(false);
  });

  test("distanceToPolygonEdge", () => {
    expect(distanceToPolygonEdge(square, [0, 0])).toBeCloseTo(1, 5);
    expect(distanceToPolygonEdge(square, [0.5, 0])).toBeCloseTo(0.5, 5);
  });

  test("polygonBounds", () => {
    expect(polygonBounds(square)).toEqual({ minX: -1, maxX: 1, minZ: -1, maxZ: 1 });
  });

  test("spanThroughCenter follows the outline", () => {
    const [minX, maxX] = spanThroughCenter(getBoxOutline("rect", 0), "x");
    expect(minX).toBeCloseTo(-2.15, 5);
    expect(maxX).toBeCloseTo(2.15, 5);
    const [minZ, maxZ] = spanThroughCenter(getBoxOutline("rect", 0), "z");
    expect(minZ).toBeCloseTo(-1.65, 5);
    expect(maxZ).toBeCloseTo(1.65, 5);
  });
});
