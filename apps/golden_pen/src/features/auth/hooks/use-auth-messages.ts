"use client";

import type { ApiError } from "@repo/http";
import { useTranslations } from "next-intl";

/** zod messages in auth.schema.ts are i18n keys of `Auth.validation`. */
const VALIDATION_KEYS = [
  "phoneInvalid",
  "passwordRequired",
  "codeInvalid",
  "firstNameRequired",
  "lastNameRequired",
] as const;

/** What a 400/401 means for the step that failed. */
type RejectedAs = "invalidCredentials" | "invalidCode";

/** Translated messages shared by every auth form: field errors and error → message mapping. */
export function useAuthMessages() {
  const t = useTranslations("Auth");

  /** A zod message (translation key) → text; `undefined` when there is no error. */
  const fieldError = (message: string | undefined) => {
    const key = VALIDATION_KEYS.find((candidate) => candidate === message);
    return key ? t(`validation.${key}`) : undefined;
  };

  /** An `ApiError` → text for the form (`null` without an error). */
  const formError = (error: ApiError | null, rejectedAs: RejectedAs = "invalidCredentials") => {
    if (!error) return null;
    if (error.status === 409) return t("errors.phoneTaken");
    if (error.code === "NOT_FOUND") return t("errors.userNotFound");
    if (error.code === "UNAUTHORIZED" || error.code === "VALIDATION") {
      return t(`errors.${rejectedAs}`);
    }
    if (error.code === "RATE_LIMITED") return t("errors.rateLimited");
    return t("errors.generic");
  };

  return { fieldError, formError };
}
