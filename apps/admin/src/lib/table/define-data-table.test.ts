import { describe, expect, test } from "bun:test";

import { defineDataTable } from "./define-data-table";

const table = defineDataTable({
  sortFields: ["name", "age"] as const,
  filters: { role: ["admin", "user"] as const },
});

describe("defineDataTable().loadParams", () => {
  test("parses the URL into typed table params", async () => {
    const params = await table.loadParams(
      Promise.resolve({ page: "3", q: "ali", sortBy: "age", order: "desc", role: "admin" }),
    );
    expect(params).toEqual({
      page: 3,
      pageSize: 10,
      q: "ali",
      sortBy: "age",
      order: "desc",
      role: "admin",
    });
  });

  test("falls back to defaults for missing or hand-edited values", async () => {
    const params = await table.loadParams(
      Promise.resolve({ page: "x", sortBy: "password", order: "sideways", role: "root" }),
    );
    expect(params).toEqual({
      page: 1,
      pageSize: 10,
      q: "",
      sortBy: null,
      order: "asc",
      role: null,
    });
  });
});
