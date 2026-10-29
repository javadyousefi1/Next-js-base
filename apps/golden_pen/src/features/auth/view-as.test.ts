import { describe, expect, test } from "bun:test";

import { effectiveRoles, parseViewAs } from "./view-as";

describe("parseViewAs", () => {
  test("accepts the known roles", () => {
    expect(parseViewAs("lawyer")).toBe("lawyer");
    expect(parseViewAs("super-admin")).toBe("super-admin");
  });

  test("rejects anything else", () => {
    for (const value of [null, undefined, "", "root", "Lawyer"]) {
      expect(parseViewAs(value)).toBeNull();
    }
  });
});

describe("effectiveRoles", () => {
  test("a super-admin with an override acts as that role", () => {
    expect(effectiveRoles(["super-admin"], "lawyer")).toEqual(["lawyer"]);
  });

  test("without an override the real roles stay", () => {
    expect(effectiveRoles(["super-admin"], null)).toEqual(["super-admin"]);
  });

  test("an unknown override is ignored", () => {
    expect(effectiveRoles(["super-admin"], "root")).toEqual(["super-admin"]);
  });

  test("a non-super-admin can never override", () => {
    expect(effectiveRoles(["operator"], "super-admin")).toEqual(["operator"]);
    expect(effectiveRoles([], "super-admin")).toEqual([]);
  });
});
