import { describe, expect, test } from "bun:test";

import { MAX_UPLOAD_BYTES, updateIdentityFormSchema } from "../schemas/profile.schema";
import {
  profileResponse,
  toProfileQuery,
  toUpdateIdentityBody,
  toUpdateInfoBody,
  toUploadFormData,
  UPDATE_TYPE,
  validateUploadForm,
} from "./profile.backend";

const pngFile = (name = "me.png") => new File([new Uint8Array(8)], name, { type: "image/png" });

describe("toProfileQuery", () => {
  test("asks for the identity", () => {
    expect(toProfileQuery()).toEqual({ includeIdentity: true });
  });
});

describe("profileResponse", () => {
  const info = { phoneNumber: "09120000000", firstName: "علی", lastName: "رضایی" };

  test("maps info, ids, and the documents by kind", () => {
    const profile = profileResponse.parse({
      info: { ...info, fullName: "علی رضایی", avatarUrl: "https://x/a.png", email: null },
      identity: {
        statusType: 4,
        message: "رد شد",
        provinceId: "1",
        cityId: 2,
        documents: [
          { fieldType: "licenseFile", name: "a.pdf", url: "https://x/a.pdf" },
          { fieldType: "documents", name: "b.pdf", url: null },
          { fieldType: "unknown", name: "c.pdf" },
        ],
      },
    });

    expect(profile.info).toMatchObject({
      fullName: "علی رضایی",
      avatarUrl: "https://x/a.png",
      email: null,
      username: null,
    });
    expect(profile.identity).toMatchObject({
      statusType: 4,
      message: "رد شد",
      provinceId: 1,
      cityId: 2,
    });
    expect(profile.identity?.documents).toEqual([
      { kind: "license", name: "a.pdf", url: "https://x/a.pdf" },
      { kind: "document", name: "b.pdf", url: null },
      { kind: "document", name: "c.pdf", url: null },
    ]);
  });

  test("a user without identity maps to null; the full name falls back to first + last", () => {
    const profile = profileResponse.parse({ info, identity: null });
    expect(profile.identity).toBeNull();
    expect(profile.info.fullName).toBe("علی رضایی");
  });
});

describe("update bodies", () => {
  test("info: type 1, all keys, identity null", () => {
    expect(
      toUpdateInfoBody({
        firstName: "علی",
        lastName: "رضایی",
        phoneNumber: "09120000000",
        username: null,
        email: null,
      }),
    ).toEqual({
      type: UPDATE_TYPE.info,
      info: {
        firstName: "علی",
        lastName: "رضایی",
        phoneNumber: "09120000000",
        username: null,
        email: null,
      },
      identity: null,
    });
  });

  test("identity: type 2, every key present with nulls, info null", () => {
    const input = updateIdentityFormSchema.parse({
      specialty: "",
      bio: "",
      licenseNumber: "",
      barAssociation: "",
      provinceId: "",
      cityId: "",
      officeText: "",
      officePostalCode: "",
      officePhone: "",
      nationalId: "",
      companyName: "",
      companyNationalId: "",
      companyRegistrationNumber: "",
      companyRepresentativeName: "",
    });
    const body = toUpdateIdentityBody(input);

    expect(body.type).toBe(UPDATE_TYPE.identity);
    expect(body.info).toBeNull();
    expect(body.identity).toEqual({
      specialty: null,
      bio: null,
      licenseNumber: null,
      barAssociation: null,
      provinceId: null,
      cityId: null,
      officeAddress: null,
      nationalId: null,
      companyName: null,
      companyNationalId: null,
      companyRegistrationNumber: null,
      companyRepresentativeName: null,
    });
  });
});

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
