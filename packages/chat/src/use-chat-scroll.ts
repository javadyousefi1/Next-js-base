"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type UseChatScrollOptions<TItem extends { key: string }> = {
  /** Rows, oldest → newest (e.g. `buildTimeline(...)`). */
  items: readonly TItem[];
  /** A guess per row; real heights are measured (`measureElement`). */
  estimateSize: (item: TItem) => number;
  /** More history exists above the first row. */
  hasMore: boolean;
  /** History is loading (no second request meanwhile). */
  loadingOlder: boolean;
  /** Called when the reader gets near the top. */
  onLoadOlder: () => void;
  /** Called while the newest row is in view (mark as read). */
  onSeeLatest?: () => void;
  /** Rows appended while scrolled up that count in the "new messages" badge. */
  countsAsNew?: (item: TItem) => boolean;
  /** Rows kept rendered outside the viewport. Default 8. */
  overscan?: number;
};

/** Load older history when the first rendered row is this close to the top. */
const LOAD_OLDER_WITHIN = 4;
/** "At the bottom" tolerance in px. */
const END_THRESHOLD = 48;

/**
 * Scrolling of a chat: a virtualized list (only visible rows are in the DOM) anchored to the
 * end — it opens at the latest message, follows new messages while at the bottom, keeps the
 * reader's position when older history is prepended or rows change height, loads older history
 * near the top and counts messages that arrived while scrolled up. Render `virtualItems`
 * absolutely inside a `totalSize`-high box, each row with `ref={measureElement}` and
 * `data-index`.
 */
export function useChatScroll<TItem extends { key: string }>(options: UseChatScrollOptions<TItem>) {
  // TanStack Virtual keeps mutable state; opt out of React Compiler memoization.
  "use no memo";

  const { items, estimateSize, hasMore, loadingOlder, onLoadOlder, onSeeLatest, countsAsNew } =
    options;
  const scrollRef = useRef<HTMLDivElement>(null);
  // The hook opts out of the compiler ("use no memo" above), which is what this rule asks for.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const item = items[index];
      return item ? estimateSize(item) : 0;
    },
    getItemKey: (index) => items[index]?.key ?? index,
    overscan: options.overscan ?? 8,
    anchorTo: "end",
    followOnAppend: true,
    scrollEndThreshold: END_THRESHOLD,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const isAtEnd = items.length === 0 || virtualizer.isAtEnd();
  const firstIndex = virtualItems[0]?.index ?? 0;
  const lastKey = items.at(-1)?.key;

  // Open at the latest message (once, when the first rows arrive).
  const opened = useRef(false);
  useLayoutEffect(() => {
    if (opened.current || items.length === 0) return;
    opened.current = true;
    virtualizer.scrollToEnd();
  }, [items.length, virtualizer]);

  // Older history near the top — also when the first page doesn't fill the viewport.
  useEffect(() => {
    if (opened.current && hasMore && !loadingOlder && firstIndex < LOAD_OLDER_WITHIN) onLoadOlder();
  }, [firstIndex, hasMore, loadingOlder, onLoadOlder]);

  // Messages that arrived below while the reader is scrolled up.
  const [unseen, setUnseen] = useState(0);
  const previousLastKey = useRef(lastKey);
  useEffect(() => {
    const previous = previousLastKey.current;
    previousLastKey.current = lastKey;
    if (isAtEnd) {
      setUnseen(0);
      if (lastKey !== undefined) onSeeLatest?.();
      return;
    }
    if (previous === undefined || previous === lastKey) return;
    const start = items.findIndex((item) => item.key === previous) + 1;
    const added = items.slice(start).filter((item) => countsAsNew?.(item) ?? true).length;
    if (added > 0) setUnseen((count) => count + added);
  }, [lastKey, isAtEnd, items, countsAsNew, onSeeLatest]);

  return {
    scrollRef,
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
    isAtEnd,
    /** New messages below the viewport (for a "jump to latest" badge). */
    unseen,
    scrollToEnd: (behavior: "auto" | "smooth" = "smooth") => virtualizer.scrollToEnd({ behavior }),
    /** Brings a loaded row into view (a replied-to message); `false` when it isn't loaded. */
    scrollToKey: (key: string) => {
      const index = items.findIndex((item) => item.key === key);
      if (index === -1) return false;
      virtualizer.scrollToIndex(index, { align: "center", behavior: "smooth" });
      return true;
    },
  };
}
