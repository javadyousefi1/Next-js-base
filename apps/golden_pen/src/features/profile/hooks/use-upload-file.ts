"use client";

import { useTranslations } from "next-intl";
import { useRef, type ChangeEvent } from "react";
import { toast } from "sonner";

import { uploadMutation } from "../api/profile.queries";
import { checkUploadFile, type UploadTarget } from "../schemas/profile.schema";

/**
 * A hidden file input + the upload mutation for one target (avatar or a document kind): checks
 * the type and size first (Persian errors), uploads, toasts the result. `openPicker` opens the
 * file dialog.
 */
export function useUploadFile(target: UploadTarget) {
  const t = useTranslations("Profile.upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = uploadMutation.useMutation({
    onSuccess: () => toast.success(t("success")),
    onError: () => toast.error(t("failed")),
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset, so choosing the same file again still fires `change`.
    event.target.value = "";
    if (!file) return;

    const problem = checkUploadFile(target, file);
    if (problem) {
      toast.error(t(problem === "type" ? "invalidType" : "tooLarge"));
      return;
    }
    mutation.mutate({ target, file });
  };

  return {
    inputRef,
    openPicker: () => inputRef.current?.click(),
    onChange,
    isUploading: mutation.isPending,
  };
}
