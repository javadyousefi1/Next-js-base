import { describe, expect, test } from "bun:test";

import { z } from "zod";

import { labelFromKey, parseInput } from "./validation";

describe("labelFromKey", () => {
  test("names errors after the key constant", () => {
    expect(labelFromKey(["users", "list", { page: 1 }])).toBe("users.list");
    expect(labelFromKey(["auth", "login"])).toBe("auth.login");
  });
});

describe("parseInput", () => {
  test("throws a VALIDATION ApiError labelled with the key", () => {
    expect(() => parseInput(z.object({ id: z.number() }), { id: "1" }, "users.detail")).toThrow(
      /Invalid input for users\.detail/,
    );
  });
});
