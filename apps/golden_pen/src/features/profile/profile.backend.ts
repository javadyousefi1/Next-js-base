import {
  checkUploadFile,
  DOCUMENT_KINDS,
  type UploadInput,
  type UploadTarget,
} from "./schemas/profile.schema";

/**
 * The upload half of the profile API, kept apart from `profile.api.ts` because the BFF route
 * (`app/api/upload/route.ts`) imports it on the server: `POST /User/Upload` (multipart:
 * `uploadType` 1 = avatar, 2 = identity document with a `fieldType`) and its validation. No env
 * and no secrets here; the browser imports it too (`toUploadFormData`).
 */

/** Relative to `API_BASE_URL` (server). The browser posts to our own `/api/upload`. */
export const UPLOAD_ENDPOINT = "/User/Upload";
export const UPLOAD_TYPE = { avatar: 1, identityDocument: 2 } as const;
/** `fieldType` of an identity document. */
export const DOCUMENT_FIELD = { license: "licenseFile", document: "documents" } as const;

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
