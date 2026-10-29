"use client";

import { useCopyToClipboard } from "@repo/hooks/use-copy-to-clipboard";

/**
 * Copies a link and tells for a moment that it did. `navigator.clipboard` needs https or
 * localhost: elsewhere the copy fails silently (`copied` stays false).
 */
export function useCopyLink(url: string) {
  const { copied, copy } = useCopyToClipboard();

  return { copied, copy: () => void copy(url) };
}
