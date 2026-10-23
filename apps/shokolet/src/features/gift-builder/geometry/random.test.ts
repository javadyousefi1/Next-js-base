import { describe, expect, test } from "bun:test";

import { createRandom } from "./random";

describe("createRandom", () => {
  test("is deterministic per seed and stays in [0, 1)", () => {
    const a = createRandom(7);
    const b = createRandom(7);
    for (let i = 0; i < 50; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test("different seeds differ", () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)());
  });
});
