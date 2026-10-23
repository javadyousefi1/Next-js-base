import { describe, expect, test } from "bun:test";

import { getFitDistance } from "./camera-fit";

describe("getFitDistance", () => {
  test("landscape: the vertical field of view decides", () => {
    expect(getFitDistance(2, 40, 3)).toBeCloseTo(3 / Math.sin((20 * Math.PI) / 180));
    expect(getFitDistance(1.5, 40, 3)).toBeCloseTo(getFitDistance(2, 40, 3));
  });

  test("portrait pushes the camera further back", () => {
    expect(getFitDistance(0.6, 40, 3)).toBeGreaterThan(getFitDistance(1, 40, 3));
  });

  test("scales with the radius", () => {
    expect(getFitDistance(1, 40, 6)).toBeCloseTo(getFitDistance(1, 40, 3) * 2);
  });
});
