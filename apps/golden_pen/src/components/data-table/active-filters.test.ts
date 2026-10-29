import { describe, expect, test } from "bun:test";

import { buildActiveFilters } from "./active-filters";

const filters = [
  { type: "select", id: "role", title: "نقش", options: [{ value: "intern", label: "کارآموز" }] },
  { type: "multiSelect", id: "tags", title: "برچسب", options: [{ value: "a", label: "الف" }] },
  { type: "text", id: "phoneNumber", title: "شماره موبایل" },
] as const;

describe("buildActiveFilters", () => {
  test("is empty when nothing is set", () => {
    expect(buildActiveFilters({ q: "", searchTitle: "جستجو", values: {}, filters })).toEqual([]);
  });

  test("makes a badge for the search, select labels, text values and each multiSelect option", () => {
    const badges = buildActiveFilters({
      q: "علی",
      searchTitle: "جستجو",
      values: { role: "intern", tags: ["a", "b"], phoneNumber: "0912", other: "x" },
      filters,
    });

    expect(badges.map((badge) => [badge.title, badge.value, badge.filterId, badge.option])).toEqual(
      [
        ["جستجو", "علی", null, null],
        ["نقش", "کارآموز", "role", null],
        ["برچسب", "الف", "tags", "a"],
        ["برچسب", "b", "tags", "b"],
        ["شماره موبایل", "0912", "phoneNumber", null],
      ],
    );
  });
});
