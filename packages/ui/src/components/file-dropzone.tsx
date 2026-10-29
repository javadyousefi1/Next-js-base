"use client";

import { cn } from "cn";
import { Loader2Icon, UploadCloudIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

import { useFileDropzone } from "../hooks/use-file-dropzone";
import type { FileRejection } from "../lib/file-validation";

export type FileDropzoneLabels = {
  /** Main text, e.g. «drop a file here or click». */
  title: string;
  /** Second line, e.g. the accepted types and the size limit. */
  hint?: string;
  /** Replaces the title while a file is dragged over the zone. */
  active?: string;
  /** Replaces the title while `busy`. */
  busy?: string;
};

export type FileDropzoneProps = {
  onFiles: (accepted: File[]) => void;
  onReject?: (rejected: FileRejection[]) => void;
  /** MIME types, wildcards (`image/*`) or extensions (`.pdf`). */
  accept?: readonly string[];
  /** Bytes. */
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  /** Shows a spinner and blocks input (e.g. while uploading). */
  busy?: boolean;
  invalid?: boolean;
  labels: FileDropzoneLabels;
  /** Replaces the default upload icon. */
  icon?: ReactNode;
  /** Replaces the whole inner content (title, hint and icon). */
  children?: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  "aria-describedby"?: string;
  "data-testid"?: string;
};

/**
 * Drag-and-drop / click file picker with type, size and count validation (`validateFiles`).
 * Headless about text: every visible string comes from `labels`. The zone has a fixed minimum
 * height, so its states never shift the layout.
 */
export function FileDropzone({
  onFiles,
  onReject,
  accept,
  maxSize,
  maxFiles,
  multiple = false,
  disabled = false,
  busy = false,
  invalid = false,
  labels,
  icon,
  children,
  className,
  id,
  name,
  "aria-describedby": describedBy,
  "data-testid": testId,
}: FileDropzoneProps) {
  const blocked = disabled || busy;
  const zone = useFileDropzone({ onFiles, onReject, accept, maxSize, maxFiles, multiple, blocked });
  const autoId = useId();
  const hintId = `${id ?? autoId}-hint`;
  const title =
    busy && labels.busy
      ? labels.busy
      : zone.isDragging && labels.active
        ? labels.active
        : labels.title;

  return (
    <div
      data-slot="file-dropzone"
      data-dragging={zone.isDragging || undefined}
      role="button"
      tabIndex={blocked ? -1 : 0}
      aria-disabled={blocked || undefined}
      aria-busy={busy || undefined}
      data-invalid={invalid || undefined}
      aria-label={labels.title}
      aria-describedby={cn(labels.hint && hintId, describedBy) || undefined}
      id={id}
      onClick={zone.onClick}
      onKeyDown={zone.onKeyDown}
      onDragEnter={zone.onDragEnter}
      onDragOver={zone.onDragOver}
      onDragLeave={zone.onDragLeave}
      onDrop={zone.onDrop}
      className={cn(
        "flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/40 p-4 text-center transition-colors outline-none",
        "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-[dragging]:border-primary data-[dragging]:bg-primary/10",
        "data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 dark:data-[invalid]:ring-destructive/40",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-muted/40",
        className,
      )}
    >
      <input
        {...zone.inputProps}
        type="file"
        name={name}
        className="sr-only"
        tabIndex={-1}
        aria-label={labels.title}
        data-testid={testId}
        multiple={multiple}
        accept={accept?.join(",")}
        disabled={disabled}
        onClick={(event) => event.stopPropagation()}
      />
      {children ?? (
        <>
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary",
              "[&_svg:not([class*='size-'])]:size-5",
            )}
          >
            {busy ? (
              <Loader2Icon className="animate-spin" aria-hidden />
            ) : (
              (icon ?? <UploadCloudIcon aria-hidden />)
            )}
          </span>
          <span className="text-sm font-medium">{title}</span>
          {labels.hint && (
            <span id={hintId} className="text-xs text-muted-foreground">
              {labels.hint}
            </span>
          )}
        </>
      )}
    </div>
  );
}
