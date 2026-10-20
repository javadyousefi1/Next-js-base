"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { createChatStore, type ChatStoreOptions } from "./chat-store";

/**
 * A chat bound to React: creates the store once, connects on mount, disconnects on unmount.
 * To switch to another transport or conversation, remount it (`key`).
 */
export function useChat(options: ChatStoreOptions) {
  const [store] = useState(() => createChatStore(options));
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  useEffect(() => {
    void store.start();
    return () => store.stop();
  }, [store]);

  return { ...state, store };
}
