"use client";

import { useState } from "react";

import type { ChocolateId } from "../gift-builder.config";
import type { GiftItem } from "../gift-builder.state";

export type PresentItem = {
  uid: number;
  chocolateId: ChocolateId;
  slotIndex: number;
  /** Removed from the state but still on screen, playing its exit animation. */
  leaving: boolean;
};

/**
 * Keeps removed items rendered as `leaving` until their exit animation calls `onExited(uid)`
 * (like AnimatePresence). Live items sit in the slot of their index.
 */
export function useItemPresence(items: GiftItem[]) {
  const [previous, setPrevious] = useState(items);
  const [leaving, setLeaving] = useState<PresentItem[]>([]);

  // Adjust state while rendering: items that disappeared start leaving from their last slot.
  if (previous !== items) {
    setPrevious(items);
    const current = new Set(items.map((item) => item.uid));
    const removed = previous
      .map((item, slotIndex): PresentItem => ({ ...item, slotIndex, leaving: true }))
      .filter((item) => !current.has(item.uid) && !leaving.some((l) => l.uid === item.uid));
    if (removed.length > 0) setLeaving([...leaving, ...removed]);
  }

  const present: PresentItem[] = [
    ...items.map((item, slotIndex): PresentItem => ({ ...item, slotIndex, leaving: false })),
    ...leaving,
  ];

  const onExited = (uid: number) => setLeaving((list) => list.filter((item) => item.uid !== uid));

  return { present, onExited };
}
