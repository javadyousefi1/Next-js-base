"use client";

import { FileDropzone } from "@repo/ui/components/file-dropzone";
import { useTranslations } from "next-intl";

import { AVATAR_RULES, DOCUMENT_RULES, useDropzoneExample } from "../hooks/use-dropzone-example";

/** `FileDropzone`: a single image with a size limit, and several files (images + PDF, at most 3). */
export function UiDropzoneExample() {
  const t = useTranslations("Examples.ui.dropzone");
  const dropzone = useDropzoneExample();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{t("heading")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FileDropzone
            {...AVATAR_RULES}
            data-testid="dropzone-single"
            labels={{ title: t("title"), hint: dropzone.labels.avatarHint, active: t("active") }}
            onFiles={dropzone.avatar.onFiles}
            onReject={dropzone.onReject}
          />
          <p className="min-h-5 text-sm" data-testid="dropzone-single-result">
            {dropzone.avatar.text}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <FileDropzone
            {...DOCUMENT_RULES}
            data-testid="dropzone-multiple"
            labels={{ title: t("title"), hint: dropzone.labels.documentsHint, active: t("active") }}
            onFiles={dropzone.documents.onFiles}
            onReject={dropzone.onReject}
          />
          <ul className="min-h-5 text-sm" data-testid="dropzone-multiple-result">
            {dropzone.documents.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      {dropzone.problems.length > 0 && (
        <ul role="alert" className="text-sm text-destructive">
          {dropzone.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
