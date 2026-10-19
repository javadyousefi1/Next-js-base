"use client";

import { modalStore, type ModalEntry } from "@repo/ui/lib/modal";
import { useSyncExternalStore } from "react";

/** The open (and closing) modals, oldest first. Empty during SSR. */
export function useModalEntries(): readonly ModalEntry[] {
  return useSyncExternalStore(
    modalStore.subscribe,
    modalStore.getSnapshot,
    modalStore.getServerSnapshot,
  );
}
