"use client";

import { FileDropzone } from "@repo/ui/components/file-dropzone";

import { useUploadFile } from "../hooks/use-upload-file";
import type { DocumentKind } from "../schemas/profile.schema";

/** Drop zone that uploads an image or a PDF as a document of the given kind. */
export function DocumentDropzone({ kind }: { kind: DocumentKind }) {
  const dropzone = useUploadFile(kind);

  return <FileDropzone {...dropzone} data-testid={`${kind}-input`} />;
}
