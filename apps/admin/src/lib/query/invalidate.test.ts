import { describe, expect, it } from "bun:test";

import { QueryClient, type QueryKey } from "@tanstack/react-query";

import { collectAffectedQueries } from "./invalidate";
import "./register";

function seed(queryClient: QueryClient, queryKey: QueryKey, relatedKeys?: readonly QueryKey[]) {
  return queryClient.getQueryCache().build(queryClient, { queryKey, meta: { relatedKeys } });
}

describe("collectAffectedQueries", () => {
  it("matches the key itself and every child key", () => {
    const client = new QueryClient();
    const list = seed(client, ["users", "list", { page: 1 }]);
    const detail = seed(client, ["users", "detail", 1]);
    const other = seed(client, ["posts", "list"]);

    const affected = collectAffectedQueries(client, [["users"]]);

    expect(affected.has(list.queryHash)).toBe(true);
    expect(affected.has(detail.queryHash)).toBe(true);
    expect(affected.has(other.queryHash)).toBe(false);
  });

  it("follows relatedKeys in both directions", () => {
    const client = new QueryClient();
    const stats = seed(client, ["dashboard", "stats"], [["users"]]);

    expect(collectAffectedQueries(client, [["users", "detail", 7]]).has(stats.queryHash)).toBe(true);
    expect(collectAffectedQueries(client, [["users"]]).has(stats.queryHash)).toBe(true);
    expect(collectAffectedQueries(client, [["posts"]]).has(stats.queryHash)).toBe(false);
  });

  it("is transitive and terminates on cycles", () => {
    const client = new QueryClient();
    const a = seed(client, ["a"], [["b"]]);
    const b = seed(client, ["b"], [["c"]]);
    const c = seed(client, ["c"], [["a"]]);

    const affected = collectAffectedQueries(client, [["c"]]);

    expect([...affected].sort()).toEqual([a.queryHash, b.queryHash, c.queryHash].sort());
  });
});
