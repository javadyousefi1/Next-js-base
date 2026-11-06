import { describe, expect, test } from "bun:test";

import { toUploadFormData, validateUploadForm } from "./profile.backend";
import { MAX_UPLOAD_BYTES } from "./schemas/profile.schema";

const pngFile = (name = "me.png") => new File([new Uint8Array(8)], name, { type: "image/png" });

describe("toUploadFormData", () => {
  test("avatar: uploadType 1 and the file", () => {
    const form = toUploadFormData({ target: "avatar", file: pngFile() });
    expect(form.get("uploadType")).toBe("1");
    expect(form.get("fieldType")).toBeNull();
    expect((form.get("file") as File).name).toBe("me.png");
    expect(form.get("originalFileName")).toBe("me.png");
  });

  test("removing the avatar sends no file", () => {
    const form = toUploadFormData({ target: "avatar", file: null });
    expect(form.get("uploadType")).toBe("1");
    expect(form.get("file")).toBeNull();
  });

  test("license / other documents: uploadType 2 with their fieldType", () => {
    const license = toUploadFormData({ target: "license", file: pngFile() });
    expect(license.get("uploadType")).toBe("2");
    expect(license.get("fieldType")).toBe("licenseFile");
    expect(toUploadFormData({ target: "document", file: pngFile() }).get("fieldType")).toBe(
      "documents",
    );
  });
});

const messageOf = (form: FormData) => {
  const checked = validateUploadForm(form);
  return checked.ok ? null : checked.message;
};

describe("validateUploadForm (the upload route)", () => {
  test("accepts what the browser builds and forwards the same fields", () => {
    const checked = validateUploadForm(toUploadFormData({ target: "license", file: pngFile() }));
    expect(checked.ok).toBe(true);
    if (checked.ok) {
      expect(checked.form.get("uploadType")).toBe("2");
      expect(checked.form.get("fieldType")).toBe("licenseFile");
      expect((checked.form.get("file") as File).name).toBe("me.png");
    }
  });

  test("an avatar without a file is a delete", () => {
    expect(validateUploadForm(toUploadFormData({ target: "avatar", file: null })).ok).toBe(true);
  });

  test("rejects an unknown uploadType or fieldType", () => {
    const bad = new FormData();
    bad.append("uploadType", "9");
    expect(messageOf(bad)).toBe("Invalid upload type");

    const noField = new FormData();
    noField.append("uploadType", "2");
    noField.append("file", pngFile());
    expect(messageOf(noField)).toBe("Invalid upload type");

    noField.append("fieldType", "other");
    expect(messageOf(noField)).toBe("Invalid upload type");
  });

  test("a document needs a file", () => {
    const form = new FormData();
    form.append("uploadType", "2");
    form.append("fieldType", "documents");
    expect(messageOf(form)).toBe("A file is required");
  });

  test("rejects a wrong type and a too-large file", () => {
    const pdfAvatar = new FormData();
    pdfAvatar.append("uploadType", "1");
    pdfAvatar.append("file", new File([new Uint8Array(4)], "a.pdf", { type: "application/pdf" }));
    expect(messageOf(pdfAvatar)).toBe("Unsupported file type");

    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "big.png", { type: "image/png" });
    expect(messageOf(toUploadFormData({ target: "document", file: big }))).toBe(
      "The file is too large",
    );
  });

  test("a PDF is fine as a document", () => {
    const pdf = new File([new Uint8Array(4)], "a.pdf", { type: "application/pdf" });
    expect(validateUploadForm(toUploadFormData({ target: "document", file: pdf })).ok).toBe(true);
  });
});
