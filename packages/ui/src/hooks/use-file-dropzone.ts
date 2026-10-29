"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";

import { validateFiles, type FileRejection, type FileRules } from "../lib/file-validation";

export type UseFileDropzoneOptions = FileRules & {
  onFiles: (accepted: File[]) => void;
  onReject?: (rejected: FileRejection[]) => void;
  /** Blocks every interaction (`disabled` or `busy`). */
  blocked?: boolean;
};

const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

/**
 * State of `FileDropzone`: the hidden input, click/keyboard to open the dialog, drag events with a
 * depth counter (entering a child fires `dragenter` before the parent's `dragleave`), validation.
 */
export function useFileDropzone({
  onFiles,
  onReject,
  blocked = false,
  ...rules
}: UseFileDropzoneOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handle = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const { accepted, rejected } = validateFiles(Array.from(list), rules);
    if (accepted.length > 0) onFiles(accepted);
    if (rejected.length > 0) onReject?.(rejected);
  };

  const open = () => {
    if (!blocked) inputRef.current?.click();
  };

  return {
    isDragging: isDragging && !blocked,
    /** Spread on the hidden `<input type="file">`. */
    inputProps: {
      ref: inputRef,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const list = event.target.files;
        if (!blocked) handle(list);
        // Reset, so choosing the same file again still fires `change`.
        event.target.value = "";
      },
    },
    onClick: open,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    },
    onDragEnter: (event: DragEvent) => {
      if (blocked || !hasFiles(event)) return;
      event.preventDefault();
      depth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (event: DragEvent) => {
      if (blocked || !hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (event: DragEvent) => {
      if (blocked || !hasFiles(event)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      if (!blocked) handle(event.dataTransfer.files);
    },
  };
}
