import { describe, expect, test } from "bun:test";

import { formatBytes, validateFiles } from "./file-validation";

const file = (name: string, type: string, size = 10) =>
  new File([new Uint8Array(size)], name, { type });

describe("validateFiles", () => {
  test("accepts everything without rules (one file)", () => {
    const { accepted, rejected } = validateFiles([file("a.txt", "text/plain")]);
    expect(accepted).toHaveLength(1);
    expect(rejected).toHaveLength(0);
  });

  test("matches MIME types, wildcards and extensions", () => {
    const files = [file("a.png", "image/png"), file("b.pdf", "application/pdf"), file("c.zip", "")];
    const mime = validateFiles(files, { accept: ["image/png"], multiple: true });
    expect(mime.accepted.map((f) => f.name)).toEqual(["a.png"]);
    const wildcard = validateFiles(files, { accept: ["image/*"], multiple: true });
    expect(wildcard.accepted.map((f) => f.name)).toEqual(["a.png"]);
    const extension = validateFiles(files, { accept: [".PDF", ".zip"], multiple: true });
    expect(extension.accepted.map((f) => f.name)).toEqual(["b.pdf", "c.zip"]);
    expect(mime.rejected.every((r) => r.reason === "type")).toBe(true);
  });

  test("rejects files over maxSize", () => {
    const { accepted, rejected } = validateFiles(
      [file("s.png", "image/png", 5), file("b.png", "image/png", 50)],
      { maxSize: 10, multiple: true },
    );
    expect(accepted.map((f) => f.name)).toEqual(["s.png"]);
    expect(rejected.map((r) => [r.file.name, r.reason])).toEqual([["b.png", "size"]]);
  });

  test("limits the count with maxFiles", () => {
    const files = ["1", "2", "3"].map((name) => file(name, "image/png"));
    const { accepted, rejected } = validateFiles(files, { multiple: true, maxFiles: 2 });
    expect(accepted).toHaveLength(2);
    expect(rejected.map((r) => r.reason)).toEqual(["count"]);
  });

  test("a single zone keeps the first file", () => {
    const { accepted, rejected } = validateFiles([file("1", "a/b"), file("2", "a/b")], {
      maxFiles: 5,
    });
    expect(accepted.map((f) => f.name)).toEqual(["1"]);
    expect(rejected.map((r) => r.reason)).toEqual(["count"]);
  });
});

describe("formatBytes", () => {
  test("picks the unit", () => {
    expect(formatBytes(512, "en")).toBe("512 B");
    expect(formatBytes(1536, "en")).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024, "en")).toBe("5 MB");
  });
});
