import { describe, expect, test } from "bun:test";

import { listValue, normalizeFilterValue, singleValue, toggleOption } from "./filters";

describe("normalizeFilterValue", () => {
  test("an empty string or list is not filtered", () => {
    expect(normalizeFilterValue("")).toBeNull();
    expect(normalizeFilterValue([])).toBeNull();
  });

  test("keeps a string and a list of strings", () => {
    expect(normalizeFilterValue("a")).toBe("a");
    expect(normalizeFilterValue(["a"])).toEqual(["a"]);
    expect(normalizeFilterValue(["a", "b"])).toEqual(["a", "b"]);
  });

  test("drops what is not a string", () => {
    expect(normalizeFilterValue([1, "a", null])).toEqual(["a"]);
    expect(normalizeFilterValue([1])).toBeNull();
  });

  test("anything else is not filtered", () => {
    expect(normalizeFilterValue(undefined)).toBeNull();
    expect(normalizeFilterValue(null)).toBeNull();
    expect(normalizeFilterValue(3)).toBeNull();
    expect(normalizeFilterValue({ a: 1 })).toBeNull();
  });
});

describe("toggleOption", () => {
  test("adds an option the value does not have", () => {
    expect(toggleOption(["a"], "b")).toEqual(["a", "b"]);
  });

  test("removes an option the value has", () => {
    expect(toggleOption(["a", "b"], "a")).toEqual(["b"]);
  });

  test("removing the last option leaves the filter unset", () => {
    expect(toggleOption(["a"], "a")).toBeNull();
  });

  test("starts a list from nothing", () => {
    expect(toggleOption(null, "a")).toEqual(["a"]);
  });

  test("treats a string as a one-item list", () => {
    expect(toggleOption("a", "b")).toEqual(["a", "b"]);
    expect(toggleOption("a", "a")).toBeNull();
  });
});

describe("singleValue / listValue", () => {
  test("read a filter value the way each field needs it", () => {
    expect(singleValue("a")).toBe("a");
    expect(singleValue(["a"])).toBeNull();
    expect(singleValue(null)).toBeNull();
    expect(listValue(["a", "b"])).toEqual(["a", "b"]);
    expect(listValue("a")).toEqual(["a"]);
    expect(listValue(null)).toEqual([]);
  });
});
