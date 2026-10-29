import { z } from "zod";

import {
  checkUploadFile,
  DOCUMENT_KINDS,
  type DocumentKind,
  type Profile,
  type UpdateIdentityInput,
  type UpdateInfoInput,
  type UploadInput,
  type UploadTarget,
} from "../schemas/profile.schema";

/**
 * The ONLY file that knows the backend's profile API: `GET /User/Get?includeIdentity=true`,
 * `PUT /User/Update` (`type` 1 = info, 2 = identity; every key of the chosen section is sent,
 * the other section is `null`) and `POST /User/Upload` (multipart: `uploadType` 1 = avatar,
 * 2 = identity document with a `fieldType`). A new backend → change this file (+
 * `API_ENDPOINTS`, the MSW mock), nothing else.
 */
export const UPDATE_TYPE = { info: 1, identity: 2 } as const;
export const UPLOAD_TYPE = { avatar: 1, identityDocument: 2 } as const;
/** `fieldType` of an identity document. */
export const DOCUMENT_FIELD = { license: "licenseFile", document: "documents" } as const;

/** The signed-in user together with their identity. */
export function toProfileQuery() {
  return { includeIdentity: true };
}

const backendDocumentSchema = z.object({
  fieldType: z.string(),
  name: z.string(),
  url: z.string().nullish(),
});

const backendIdentitySchema = z.object({
  statusType: z.number().int(),
  message: z.string().nullish(),
  specialty: z.string().nullish(),
  bio: z.string().nullish(),
  licenseNumber: z.string().nullish(),
  barAssociation: z.string().nullish(),
  provinceId: z.union([z.number(), z.string()]).nullish(),
  cityId: z.union([z.number(), z.string()]).nullish(),
  nationalId: z.string().nullish(),
  companyName: z.string().nullish(),
  companyNationalId: z.string().nullish(),
  companyRegistrationNumber: z.string().nullish(),
  companyRepresentativeName: z.string().nullish(),
  documents: z.array(backendDocumentSchema).nullish(),
});

const backendProfileSchema = z.object({
  info: z.object({
    fullName: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    phoneNumber: z.string(),
    username: z.string().nullish(),
    email: z.string().nullish(),
    avatarUrl: z.string().nullish(),
  }),
  identity: backendIdentitySchema.nullish(),
});

/** Ids come as numbers or numeric strings (int64). */
const idOf = (value: number | string | null | undefined) => {
  const id = value === null || value === undefined ? NaN : Number(value);
  return Number.isInteger(id) ? id : null;
};

/** `fieldType` → the document kind; anything but the license counts as "other documents". */
function kindOf(fieldType: string): DocumentKind {
  return DOCUMENT_KINDS.find((kind) => DOCUMENT_FIELD[kind] === fieldType) ?? "document";
}

/** Backend `GetUserRsDto` → the app's `Profile`. */
export const profileResponse = backendProfileSchema.transform(({ info, identity }): Profile => {
  const firstName = info.firstName ?? "";
  const lastName = info.lastName ?? "";
  return {
    info: {
      fullName: info.fullName || `${firstName} ${lastName}`.trim() || info.phoneNumber,
      firstName,
      lastName,
      phoneNumber: info.phoneNumber,
      username: info.username ?? null,
      email: info.email ?? null,
      avatarUrl: info.avatarUrl ?? null,
    },
    identity: identity
      ? {
          statusType: identity.statusType,
          message: identity.message ?? null,
          specialty: identity.specialty ?? null,
          bio: identity.bio ?? null,
          licenseNumber: identity.licenseNumber ?? null,
          barAssociation: identity.barAssociation ?? null,
          provinceId: idOf(identity.provinceId),
          cityId: idOf(identity.cityId),
          nationalId: identity.nationalId ?? null,
          companyName: identity.companyName ?? null,
          companyNationalId: identity.companyNationalId ?? null,
          companyRegistrationNumber: identity.companyRegistrationNumber ?? null,
          companyRepresentativeName: identity.companyRepresentativeName ?? null,
          documents: (identity.documents ?? []).map((document) => ({
            kind: kindOf(document.fieldType),
            name: document.name,
            url: document.url ?? null,
          })),
        }
      : null,
  };
});

/** `PUT /User/Update` body for the basic info: only `info` is filled. */
export function toUpdateInfoBody(input: UpdateInfoInput) {
  return {
    type: UPDATE_TYPE.info,
    info: {
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      username: input.username,
      email: input.email,
    },
    identity: null,
  };
}

/** `PUT /User/Update` body for the identity: only `identity` is filled (all keys, nullable). */
export function toUpdateIdentityBody(input: UpdateIdentityInput) {
  return { type: UPDATE_TYPE.identity, info: null, identity: { ...input } };
}

/** The upload form the browser sends to our BFF (`/api/upload`): the backend's own field names. */
export function toUploadFormData({ target, file }: UploadInput): FormData {
  const form = new FormData();
  if (target === "avatar") {
    form.append("uploadType", String(UPLOAD_TYPE.avatar));
  } else {
    form.append("uploadType", String(UPLOAD_TYPE.identityDocument));
    form.append("fieldType", DOCUMENT_FIELD[target]);
  }
  if (file) {
    form.append("file", file, file.name);
    form.append("originalFileName", file.name);
  }
  return form;
}

/** Which `UploadTarget` an upload form is for (`null` = not a valid combination). */
function targetOf(uploadType: string, fieldType: string | null): UploadTarget | null {
  if (uploadType === String(UPLOAD_TYPE.avatar)) return "avatar";
  if (uploadType !== String(UPLOAD_TYPE.identityDocument)) return null;
  return DOCUMENT_KINDS.find((kind) => DOCUMENT_FIELD[kind] === fieldType) ?? null;
}

export type UploadFormCheck = { ok: true; form: FormData } | { ok: false; message: string };

/**
 * The pure part of the upload route: validates what the browser sent (`toUploadFormData`) and
 * builds the form for the upstream `POST /User/Upload`. An avatar without a file deletes it.
 */
export function validateUploadForm(input: FormData): UploadFormCheck {
  const uploadType = input.get("uploadType");
  const fieldType = input.get("fieldType");
  const file = input.get("file");

  const target =
    typeof uploadType === "string"
      ? targetOf(uploadType, typeof fieldType === "string" ? fieldType : null)
      : null;
  if (target === null) return { ok: false, message: "Invalid upload type" };
  if (file !== null && !(file instanceof File)) return { ok: false, message: "Invalid file" };
  if (file === null && target !== "avatar") return { ok: false, message: "A file is required" };

  const form = new FormData();
  form.append(
    "uploadType",
    String(target === "avatar" ? UPLOAD_TYPE.avatar : UPLOAD_TYPE.identityDocument),
  );
  if (target !== "avatar") form.append("fieldType", DOCUMENT_FIELD[target]);
  if (file) {
    const problem = checkUploadFile(target, file);
    if (problem === "type") return { ok: false, message: "Unsupported file type" };
    if (problem === "size") return { ok: false, message: "The file is too large" };
    form.append("file", file, file.name);
    form.append("originalFileName", file.name);
  }
  return { ok: true, form };
}
