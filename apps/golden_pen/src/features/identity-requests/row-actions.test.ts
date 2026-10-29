import { describe, expect, test } from "bun:test";

import { rowActionsFor } from "./row-actions";

describe("rowActionsFor", () => {
  test("a requested identity can be verified or rejected", () => {
    expect(rowActionsFor(1, true)).toEqual(["verify", "reject"]);
  });

  test("a verified identity can be revoked", () => {
    expect(rowActionsFor(3, true)).toEqual(["revoke"]);
  });

  test("other statuses have no actions", () => {
    for (const status of [null, 0, 2, 4, 5]) expect(rowActionsFor(status, true)).toEqual([]);
  });

  test("only a super-admin acts", () => {
    expect(rowActionsFor(1, false)).toEqual([]);
    expect(rowActionsFor(3, false)).toEqual([]);
  });
});
