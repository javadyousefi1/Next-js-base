import { describe, expect, test } from "bun:test";

import { BOXES } from "../gift-builder.config";
import { distanceToPolygonEdge, getBoxOutline, pointInPolygon } from "./box-outline";
import { BOX_CAPACITY, getSlotPositions } from "./slots";

describe("getSlotPositions", () => {
  for (const box of BOXES) {
    const slots = getSlotPositions(box.shape);
    const inner = getBoxOutline(box.shape, 0);

    test(`${box.id} has slots and BOX_CAPACITY matches`, () => {
      expect(slots.length).toBeGreaterThan(0);
      expect(BOX_CAPACITY[box.id]).toBe(slots.length);
    });

    test(`${box.id} slots are inside the wall with room to spare`, () => {
      for (const slot of slots) {
        expect(pointInPolygon(inner, slot)).toBe(true);
        expect(distanceToPolygonEdge(inner, slot)).toBeGreaterThanOrEqual(0.45);
      }
    });

    test(`${box.id} slots do not overlap`, () => {
      for (const [i, a] of slots.entries()) {
        for (const b of slots.slice(i + 1)) {
          expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeGreaterThanOrEqual(0.95);
        }
      }
    });
  }

  test("known capacities of the simple boxes", () => {
    expect(BOX_CAPACITY.classic).toBe(12);
    expect(BOX_CAPACITY.round).toBe(8);
  });

  test("heart layout is symmetric about x = 0", () => {
    const slots = getSlotPositions("heart");
    for (const [x, z] of slots) {
      const mirrored = slots.some(([mx, mz]) => Math.abs(mx + x) < 1e-6 && Math.abs(mz - z) < 1e-6);
      expect(mirrored).toBe(true);
    }
  });
});
