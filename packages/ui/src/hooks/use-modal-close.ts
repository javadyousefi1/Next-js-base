"use client";

import { createContext, use } from "react";

/** `close(value)` of the `modal.open` modal around the caller; provided by `<ModalHost />`. */
export const ModalCloseContext = createContext<((value?: unknown) => void) | null>(null);

/**
 * Inside `modal.open<T>(<Content />)`: `close(value)` resolves that promise with `value` (type it
 * with `modal.open<T>`) and closes the modal.
 */
export function useModalClose(): (value?: unknown) => void {
  const close = use(ModalCloseContext);
  if (!close) throw new Error("useModalClose() must be used inside modal.open(…) content");
  return close;
}
