"use client";

import { useCopyToClipboard } from "@repo/hooks/use-copy-to-clipboard";
import { useDebouncedCallback } from "@repo/hooks/use-debounced-callback";
import { useDebouncedValue } from "@repo/hooks/use-debounced-value";
import { useDisclosure } from "@repo/hooks/use-disclosure";
import { useEventListener } from "@repo/hooks/use-event-listener";
import { useInterval } from "@repo/hooks/use-interval";
import { useIsClient } from "@repo/hooks/use-is-client";
import { useLocalStorage } from "@repo/hooks/use-local-storage";
import { useMediaQuery } from "@repo/hooks/use-media-query";
import { usePrevious } from "@repo/hooks/use-previous";
import { type ChangeEvent, useState } from "react";
import { z } from "zod";

const NOTE_KEY = "examples:hooks:note";
const INSTALL_COMMAND = "bun run setup && bun run dev";

/** One small demo per `@repo/hooks` hook. */
export function useHooksExample() {
  // useDebouncedValue · useDebouncedCallback
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const [callbackRuns, setCallbackRuns] = useState(0);
  const countRun = useDebouncedCallback(() => setCallbackRuns((runs) => runs + 1), 500);

  // useInterval · usePrevious
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(true);
  useInterval(() => setCount((value) => value + 1), running ? 1000 : null);
  const previousCount = usePrevious(count);

  // useLocalStorage (validated with zod)
  const [note, setNote, removeNote] = useLocalStorage(NOTE_KEY, z.string().max(500), "");

  // useDisclosure · useCopyToClipboard
  const details = useDisclosure();
  const clipboard = useCopyToClipboard();

  // useMediaQuery · useIsClient · useEventListener
  const isWide = useMediaQuery("(min-width: 1024px)");
  const isClient = useIsClient();
  const [lastKey, setLastKey] = useState<string>();
  useEventListener("keydown", (event) => setLastKey(event.key === " " ? "Space" : event.key));

  return {
    debounce: {
      value: search,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        countRun();
      },
      debounced: debouncedSearch,
      calls: callbackRuns,
    },
    interval: {
      count,
      previous: previousCount,
      running,
      toggle: () => setRunning((value) => !value),
    },
    storage: {
      value: note,
      onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
        setNote(event.target.value.slice(0, 500)),
      clear: removeNote,
      length: note.length,
    },
    details: { open: details.isOpen, onOpenChange: details.setIsOpen, toggle: details.toggle },
    clipboard: {
      text: INSTALL_COMMAND,
      copied: clipboard.copied,
      copy: () => void clipboard.copy(INSTALL_COMMAND),
    },
    environment: { isWide, isClient, lastKey },
  };
}
