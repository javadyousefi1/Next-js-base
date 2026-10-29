import { describe, expect, test } from "bun:test";

import { baseInfoOptionsResponse, toCitiesQuery, toProvincesQuery } from "./base-info.backend";

describe("queries", () => {
  test("provinces are type 1, cities type 2 with the province as parentId", () => {
    expect(toProvincesQuery()).toEqual({ type: 1 });
    expect(toCitiesQuery({ provinceId: 7 })).toEqual({ type: 2, parentId: 7 });
  });
});

describe("baseInfoOptionsResponse", () => {
  test("maps an array, numeric-string ids, and ignores extra keys", () => {
    expect(
      baseInfoOptionsResponse.parse([
        { id: 1, name: "تهران", extra: true },
        { id: "2", name: "اصفهان" },
      ]),
    ).toEqual([
      { id: 1, name: "تهران" },
      { id: 2, name: "اصفهان" },
    ]);
  });

  test("accepts { items }", () => {
    expect(baseInfoOptionsResponse.parse({ items: [{ id: 3, name: "فارس" }] })).toEqual([
      { id: 3, name: "فارس" },
    ]);
  });

  test("rejects an option without a numeric id", () => {
    expect(baseInfoOptionsResponse.safeParse([{ id: "x", name: "a" }]).success).toBe(false);
  });
});
