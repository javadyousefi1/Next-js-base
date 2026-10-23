import { describe, expect, test } from "bun:test";

import {
  countsByChocolate,
  getCapacity,
  getTotals,
  giftReducer,
  INITIAL_STATE,
  isFull,
  type GiftAction,
  type GiftState,
} from "./gift-builder.state";

function run(actions: GiftAction[], from: GiftState = INITIAL_STATE): GiftState {
  return actions.reduce(giftReducer, from);
}

describe("add", () => {
  test("appends items with unique uids", () => {
    const state = run([
      { type: "add", chocolateId: "hobby" },
      { type: "add", chocolateId: "kitkat" },
    ]);
    expect(state.items.map((i) => i.chocolateId)).toEqual(["hobby", "kitkat"]);
    expect(new Set(state.items.map((i) => i.uid)).size).toBe(2);
  });

  test("is ignored when the box is full", () => {
    const full = run(Array.from({ length: 12 }, () => ({ type: "add", chocolateId: "hobby" })));
    expect(isFull(full)).toBe(true);
    expect(run([{ type: "add", chocolateId: "kitkat" }], full)).toBe(full);
  });

  test("is ignored when wrapped", () => {
    const wrapped = run([{ type: "add", chocolateId: "hobby" }, { type: "wrap" }]);
    expect(run([{ type: "add", chocolateId: "kitkat" }], wrapped)).toBe(wrapped);
  });
});

describe("remove", () => {
  test("removes the last item of that type; later items slide down", () => {
    const state = run([
      { type: "add", chocolateId: "hobby" },
      { type: "add", chocolateId: "kitkat" },
      { type: "add", chocolateId: "hobby" },
      { type: "add", chocolateId: "snickers" },
      { type: "remove", chocolateId: "hobby" },
    ]);
    expect(state.items.map((i) => [i.uid, i.chocolateId])).toEqual([
      [1, "hobby"],
      [2, "kitkat"],
      [4, "snickers"],
    ]);
  });

  test("is ignored for a missing type and when wrapped", () => {
    expect(run([{ type: "remove", chocolateId: "hobby" }])).toBe(INITIAL_STATE);
    const wrapped = run([{ type: "add", chocolateId: "hobby" }, { type: "wrap" }]);
    expect(run([{ type: "remove", chocolateId: "hobby" }], wrapped)).toBe(wrapped);
  });
});

describe("setBox", () => {
  test("changes the box and its capacity", () => {
    const state = run([{ type: "setBox", boxId: "round" }]);
    expect(state.boxId).toBe("round");
    expect(getCapacity(state)).toBe(8);
  });

  test("is ignored when the items do not fit", () => {
    const state = run([
      ...Array.from({ length: 10 }, () => ({ type: "add", chocolateId: "hobby" }) as const),
      { type: "setBox", boxId: "round" },
    ]);
    expect(state.boxId).toBe("classic");
  });

  test("is ignored when wrapped", () => {
    const wrapped = run([{ type: "add", chocolateId: "hobby" }, { type: "wrap" }]);
    expect(run([{ type: "setBox", boxId: "round" }], wrapped).boxId).toBe("classic");
  });
});

describe("setColor and toggleFiller", () => {
  test("setColor changes the color, even when wrapped", () => {
    const wrapped = run([{ type: "add", chocolateId: "hobby" }, { type: "wrap" }]);
    expect(run([{ type: "setColor", colorId: "navy" }], wrapped).colorId).toBe("navy");
  });

  test("toggleFiller flips, but not when wrapped", () => {
    const on = run([{ type: "toggleFiller" }]);
    expect(on.filler).toBe(true);
    expect(run([{ type: "toggleFiller" }], on).filler).toBe(false);
    const wrapped = run([{ type: "add", chocolateId: "hobby" }, { type: "wrap" }]);
    expect(run([{ type: "toggleFiller" }], wrapped).filler).toBe(false);
  });
});

describe("wrap, unwrap, reset", () => {
  test("wrap needs at least one item", () => {
    expect(run([{ type: "wrap" }]).wrapped).toBe(false);
    expect(run([{ type: "add", chocolateId: "hobby" }, { type: "wrap" }]).wrapped).toBe(true);
  });

  test("unwrap opens the box again", () => {
    const state = run([
      { type: "add", chocolateId: "hobby" },
      { type: "wrap" },
      { type: "unwrap" },
    ]);
    expect(state.wrapped).toBe(false);
  });

  test("reset goes back to the initial state", () => {
    const state = run([
      { type: "add", chocolateId: "hobby" },
      { type: "toggleFiller" },
      { type: "wrap" },
      { type: "reset" },
    ]);
    expect(state).toEqual(INITIAL_STATE);
  });
});

describe("selectors", () => {
  test("countsByChocolate", () => {
    const state = run([
      { type: "add", chocolateId: "hobby" },
      { type: "add", chocolateId: "hobby" },
      { type: "add", chocolateId: "kinder" },
    ]);
    expect(countsByChocolate(state)).toEqual({ hobby: 2, kitkat: 0, kinder: 1, snickers: 0 });
  });

  test("getTotals sums chocolates, box and filler", () => {
    const state = run([
      { type: "add", chocolateId: "hobby" },
      { type: "add", chocolateId: "kinder" },
      { type: "toggleFiller" },
    ]);
    expect(getTotals(state)).toEqual({
      chocolates: 115_000,
      box: 90_000,
      filler: 25_000,
      total: 230_000,
    });
  });
});
