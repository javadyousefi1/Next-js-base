import { describe, expect, test } from "bun:test";

import { FILLER } from "../gift-builder.config";
import { getBoxOutline, pointInPolygon } from "./box-outline";
import { createFillerStrips } from "./filler-strips";

describe("createFillerStrips", () => {
  for (const shape of ["rect", "circle", "heart"] as const) {
    const outline = getBoxOutline(shape, 0);

    test(`${shape}: right count, all strips inside, y and color in range`, () => {
      const strips = createFillerStrips(outline, 120, 1);
      expect(strips).toHaveLength(120);
      for (const strip of strips) {
        expect(pointInPolygon(outline, [strip.x, strip.z])).toBe(true);
        expect(strip.y).toBeGreaterThanOrEqual(0.13);
        expect(strip.y).toBeLessThanOrEqual(0.33);
        expect(strip.colorIndex).toBeLessThan(FILLER.palette.length);
      }
    });
  }

  test("is deterministic for a seed", () => {
    const outline = getBoxOutline("rect", 0);
    expect(createFillerStrips(outline, 30, 5)).toEqual(createFillerStrips(outline, 30, 5));
    expect(createFillerStrips(outline, 30, 5)).not.toEqual(createFillerStrips(outline, 30, 6));
  });
});
