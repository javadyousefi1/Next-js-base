"use client";

import type { FileRejection } from "@repo/ui/lib/file-validation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { uploadMutation } from "../api/profile.queries";
import {
  AVATAR_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  type UploadTarget,
} from "../schemas/profile.schema";

const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

/**
 * The props of a `FileDropzone` for one target (avatar or a document kind): the limits come from
 * the profile schema, the dropzone validates (Persian errors via `onReject`), the upload mutation
 * runs for the accepted file and the result is toasted.
 */
export function useUploadFile(target: UploadTarget) {
  const t = useTranslations("Profile.upload");
  const mutation = uploadMutation.useMutation({
    onSuccess: () => toast.success(t("success")),
    onError: () => toast.error(t("failed")),
  });

  const reasons = { type: "invalidType", size: "tooLarge", count: "tooMany" } as const;

  return {
    accept: target === "avatar" ? AVATAR_MIME_TYPES : DOCUMENT_MIME_TYPES,
    maxSize: MAX_UPLOAD_BYTES,
    busy: mutation.isPending,
    labels: {
      title: t(target === "avatar" ? "avatarTitle" : "documentTitle"),
      hint: t(target === "avatar" ? "avatarHint" : "documentHint", { size: MAX_UPLOAD_MB }),
      active: t("active"),
      busy: t("busy"),
    },
    onFiles: ([file]: File[]) => {
      if (file) mutation.mutate({ target, file });
    },
    onReject: ([first]: FileRejection[]) => {
      if (first) toast.error(t(reasons[first.reason]));
    },
  };
}
