import { describe, expect, test } from "bun:test";

import { isImageUrl, reviewFieldValues } from "./review-fields";

describe("isImageUrl", () => {
  test("recognizes image links and data URLs", () => {
    expect(isImageUrl("https://example.com/a.PNG")).toBe(true);
    expect(isImageUrl("https://example.com/a.jpg?x=1")).toBe(true);
    expect(isImageUrl("data:image/png;base64,AAAA")).toBe(true);
  });

  test("a PDF, a missing link or a lookalike is not an image", () => {
    expect(isImageUrl("https://example.com/a.pdf")).toBe(false);
    expect(isImageUrl("https://example.com/png")).toBe(false);
    expect(isImageUrl(null)).toBe(false);
  });
});

describe("reviewFieldValues", () => {
  test("no identity → every field empty except the looked-up names", () => {
    const values = reviewFieldValues(null, { province: "تهران", city: null });
    expect(values.province).toBe("تهران");
    expect(values.specialty).toBeNull();
    expect(values.nationalId).toBeNull();
  });
});
