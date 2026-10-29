import { z } from "zod";

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits → Latin, so a Persian keyboard works everywhere. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

/**
 * Auth contracts, shared by the forms (react-hook-form), the mutations and the BFF routes.
 * Error messages are translation keys under `Auth.validation`.
 */
export const phoneNumberSchema = z
  .string()
  .transform((value) => toLatinDigits(value.trim()))
  .pipe(z.string().regex(/^09\d{9}$/, { error: "phoneInvalid" }));

export const passwordLoginInputSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: z.string().min(1, { error: "passwordRequired" }),
});
export type PasswordLoginInput = z.infer<typeof passwordLoginInputSchema>;

export const otpSendInputSchema = z.object({ phoneNumber: phoneNumberSchema });
export type OtpSendInput = z.infer<typeof otpSendInputSchema>;

export const otpVerifyInputSchema = z.object({
  phoneNumber: phoneNumberSchema,
  code: z
    .string()
    .transform((value) => toLatinDigits(value.trim()))
    .pipe(z.string().regex(/^\d{4,6}$/, { error: "codeInvalid" })),
});
export type OtpVerifyInput = z.infer<typeof otpVerifyInputSchema>;

export const registerInputSchema = z.object({
  firstName: z.string().trim().min(1, { error: "firstNameRequired" }),
  lastName: z.string().trim().min(1, { error: "lastNameRequired" }),
  phoneNumber: phoneNumberSchema,
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

/** The user as exposed to the browser (never contains the token). */
export const sessionUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  roles: z.array(z.string()),
  avatarUrl: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/** Response of our BFF `/api/auth/login` and `/api/auth/otp/verify`. */
export const sessionResponseSchema = z.object({ user: sessionUserSchema });
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

/** Response of the BFF routes that only trigger something (SMS code, logout). */
export const okResponseSchema = z.object({ ok: z.literal(true) });

/** The backend session token (server only — never sent to the browser). */
export type SessionToken = { accessToken: string; expiresInSeconds?: number };
