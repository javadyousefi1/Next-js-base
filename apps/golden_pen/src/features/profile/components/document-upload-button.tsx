"use client";

import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUploadFile } from "../hooks/use-upload-file";
import type { DocumentKind } from "../schemas/profile.schema";

/** Uploads an image or a PDF as a document of the given kind. */
export function DocumentUploadButton({ kind }: { kind: DocumentKind }) {
  const t = useTranslations("Profile.documents");
  const { inputRef, openPicker, onChange, isUploading } = useUploadFile(kind);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        data-testid={`${kind}-input`}
        accept="image/*,application/pdf"
        onChange={onChange}
      />
      <Button type="button" variant="outline" disabled={isUploading} onClick={openPicker}>
        {isUploading ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <UploadIcon data-icon="inline-start" />
        )}
        {t("upload")}
      </Button>
    </>
  );
}
