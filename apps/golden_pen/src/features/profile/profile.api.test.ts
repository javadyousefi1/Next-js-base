import { describe, expect, test } from "bun:test";

import {
  profileResponse,
  toProfileQuery,
  toUpdateIdentityBody,
  toUpdateInfoBody,
  UPDATE_TYPE,
} from "./profile.api";
import { updateIdentityFormSchema } from "./schemas/profile.schema";

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
