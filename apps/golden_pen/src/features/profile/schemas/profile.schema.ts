import { z } from "zod";

import { phoneNumberSchema, toLatinDigits } from "@/features/auth/schemas/auth.schema";

/** Kinds of identity document: the license (پروانه وکالت) and everything else (سایر مدارک). */
export const DOCUMENT_KINDS = ["license", "document"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/** What a file can be uploaded as: the avatar or one of the document kinds. */
export const UPLOAD_TARGETS = ["avatar", ...DOCUMENT_KINDS] as const;
export type UploadTarget = (typeof UPLOAD_TARGETS)[number];

/** Upload limits, checked in the browser (friendly errors) and again in the BFF route. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const AVATAR_MIME_TYPES: readonly string[] = ["image/jpeg", "image/png"];
export const DOCUMENT_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

/** Why a file cannot be uploaded: wrong type or too big (`null` = it can). */
export function checkUploadFile(
  target: UploadTarget,
  file: { type: string; size: number },
): "type" | "size" | null {
  const allowed = target === "avatar" ? AVATAR_MIME_TYPES : DOCUMENT_MIME_TYPES;
  if (!allowed.includes(file.type)) return "type";
  return file.size > MAX_UPLOAD_BYTES ? "size" : null;
}

/** An identity document as the app uses it; `url` is `null` when the file has no link. */
export type ProfileDocument = { kind: DocumentKind; name: string; url: string | null };

/** The basic info of the signed-in user. */
export type ProfileInfo = {
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
};

/** The identity / professional data; the backend shape lives in api/profile.backend.ts. */
export type ProfileIdentity = {
  /** Identity status (see `IDENTITY_STATUSES` of the users feature). */
  statusType: number;
  /** The reviewer's message, e.g. the reason of a rejection. */
  message: string | null;
  specialty: string | null;
  bio: string | null;
  licenseNumber: string | null;
  barAssociation: string | null;
  provinceId: number | null;
  cityId: number | null;
  nationalId: string | null;
  companyName: string | null;
  companyNationalId: string | null;
  companyRegistrationNumber: string | null;
  companyRepresentativeName: string | null;
  documents: ProfileDocument[];
};

/** `identity` is `null` until the user has sent identity data. */
export type Profile = { info: ProfileInfo; identity: ProfileIdentity | null };

/** Empty text → `null`. */
const optionalText = z.string().transform((value) => value.trim() || null);

/** Latin or Persian digits, exactly `length` of them, or empty (→ `null`). */
const optionalDigits = (length: number, error: string) =>
  z
    .string()
    .transform((value) => toLatinDigits(value.trim()))
    .refine((value) => value === "" || new RegExp(`^\\d{${length}}$`).test(value), { error })
    .transform((value) => value || null);

/**
 * The basic-info form, as typed. Messages are translation keys under `Profile.validation`.
 * Empty username/email → `null`.
 */
export const updateInfoFormSchema = z.object({
  firstName: z.string().trim().min(1, { error: "firstNameRequired" }),
  lastName: z.string().trim().min(1, { error: "lastNameRequired" }),
  phoneNumber: phoneNumberSchema,
  username: optionalText,
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      error: "emailInvalid",
    })
    .transform((value) => value || null),
});
export type UpdateInfoFormInput = z.input<typeof updateInfoFormSchema>;

/** Variables of the update-info mutation (the parsed form). */
export const updateInfoInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  username: z.string().nullable(),
  email: z.string().nullable(),
});
export type UpdateInfoInput = z.infer<typeof updateInfoInputSchema>;

/**
 * The identity form, as typed: ids are select values (`""` = none) and the office address is
 * three flat fields. Parsed, empty fields are `null` and the address is one object (or `null`).
 */
export const updateIdentityFormSchema = z
  .object({
    specialty: optionalText,
    bio: optionalText,
    licenseNumber: optionalText,
    barAssociation: optionalText,
    provinceId: z.string().transform((value) => (value === "" ? null : Number(value))),
    cityId: z.string().transform((value) => (value === "" ? null : Number(value))),
    officeText: optionalText,
    officePostalCode: optionalDigits(10, "postalCodeInvalid"),
    officePhone: z.string().transform((value) => toLatinDigits(value.trim()) || null),
    nationalId: optionalDigits(10, "nationalIdInvalid"),
    companyName: optionalText,
    companyNationalId: optionalText,
    companyRegistrationNumber: optionalText,
    companyRepresentativeName: optionalText,
  })
  .transform(({ officeText, officePostalCode, officePhone, ...rest }) => ({
    ...rest,
    officeAddress:
      officeText === null && officePostalCode === null && officePhone === null
        ? null
        : { postalCode: officePostalCode, phoneNumber: officePhone, text: officeText },
  }));
export type UpdateIdentityFormInput = z.input<typeof updateIdentityFormSchema>;

const nullableString = z.string().nullable();

/** Variables of the update-identity mutation (the parsed form). */
export const updateIdentityInputSchema = z.object({
  specialty: nullableString,
  bio: nullableString,
  licenseNumber: nullableString,
  barAssociation: nullableString,
  provinceId: z.number().int().nullable(),
  cityId: z.number().int().nullable(),
  officeAddress: z
    .object({ postalCode: nullableString, phoneNumber: nullableString, text: nullableString })
    .nullable(),
  nationalId: nullableString,
  companyName: nullableString,
  companyNationalId: nullableString,
  companyRegistrationNumber: nullableString,
  companyRepresentativeName: nullableString,
});
export type UpdateIdentityInput = z.infer<typeof updateIdentityInputSchema>;

/** Variables of the upload mutation. `file: null` with `avatar` removes the avatar. */
export const uploadInputSchema = z
  .object({
    target: z.enum(UPLOAD_TARGETS),
    file: z.instanceof(File).nullable(),
  })
  .refine((input) => input.target === "avatar" || input.file !== null);
export type UploadInput = z.infer<typeof uploadInputSchema>;
