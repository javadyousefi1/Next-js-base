"use client";

import { formatBytes, type FileRejection } from "@repo/ui/lib/file-validation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export const AVATAR_RULES = { accept: ["image/png", "image/jpeg"], maxSize: 1024 * 1024 } as const;
export const DOCUMENT_RULES = {
  accept: ["image/*", ".pdf"],
  maxSize: 2 * 1024 * 1024,
  maxFiles: 3,
  multiple: true,
} as const;

/** State of the dropzone demos: the picked files and a translated message per rejected file. */
export function useDropzoneExample() {
  const t = useTranslations("Examples.ui.dropzone");
  const locale = useLocale();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);

  const describe = (file: File) => `${file.name} (${formatBytes(file.size, locale)})`;
  const explain = ({ file, reason }: FileRejection) =>
    t(`reasons.${reason}`, { name: file.name, size: formatBytes(AVATAR_RULES.maxSize, locale) });

  return {
    labels: {
      title: t("title"),
      active: t("active"),
      avatarHint: t("avatarHint", { size: formatBytes(AVATAR_RULES.maxSize, locale) }),
      documentsHint: t("documentsHint", {
        size: formatBytes(DOCUMENT_RULES.maxSize, locale),
        count: DOCUMENT_RULES.maxFiles,
      }),
    },
    avatar: {
      text: avatar ? describe(avatar) : null,
      onFiles: (files: File[]) => {
        setAvatar(files[0] ?? null);
        setProblems([]);
      },
    },
    documents: {
      items: documents.map(describe),
      onFiles: (files: File[]) => {
        setDocuments(files);
        setProblems([]);
      },
    },
    problems,
    onReject: (rejected: FileRejection[]) => setProblems(rejected.map(explain)),
  };
}
