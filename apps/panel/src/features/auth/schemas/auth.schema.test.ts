import { describe, expect, test } from "bun:test";

import {
  otpVerifyInputSchema,
  phoneNumberSchema,
  registerInputSchema,
  toLatinDigits,
} from "./auth.schema";

describe("toLatinDigits", () => {
  test("converts Persian and Arabic-Indic digits", () => {
    expect(toLatinDigits("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
    expect(toLatinDigits("٠٩١٢٣٤٥٦٧٨٩")).toBe("09123456789");
  });

  test("leaves everything else alone", () => {
    expect(toLatinDigits("abc 123")).toBe("abc 123");
  });
});

describe("phoneNumberSchema", () => {
  test("accepts a mobile number, trimmed and with Persian digits", () => {
    expect(phoneNumberSchema.parse("09123456789")).toBe("09123456789");
    expect(phoneNumberSchema.parse(" ۰۹۱۲۳۴۵۶۷۸۹ ")).toBe("09123456789");
  });

  test.each(["", "9123456789", "0912345678", "091234567890", "08123456789", "0912345678a"])(
    "rejects %p with the phoneInvalid key",
    (value) => {
      const result = phoneNumberSchema.safeParse(value);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("phoneInvalid");
    },
  );
});

describe("otpVerifyInputSchema", () => {
  test("accepts a 4 to 6 digit code (Persian digits too)", () => {
    const phoneNumber = "09123456789";
    expect(otpVerifyInputSchema.parse({ phoneNumber, code: "۱۲۳۴۵۶" }).code).toBe("123456");
    expect(otpVerifyInputSchema.safeParse({ phoneNumber, code: "1234" }).success).toBe(true);
    expect(otpVerifyInputSchema.safeParse({ phoneNumber, code: "123" }).success).toBe(false);
    expect(otpVerifyInputSchema.safeParse({ phoneNumber, code: "1234567" }).success).toBe(false);
    expect(otpVerifyInputSchema.safeParse({ phoneNumber, code: "12ab" }).success).toBe(false);
  });
});

describe("registerInputSchema", () => {
  test("needs a first and a last name", () => {
    const result = registerInputSchema.safeParse({
      firstName: " ",
      lastName: "",
      phoneNumber: "09123456789",
    });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "firstNameRequired",
      "lastNameRequired",
    ]);
  });
});
