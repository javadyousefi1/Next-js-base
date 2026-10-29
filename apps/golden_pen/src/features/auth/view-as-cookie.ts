"use client";

import { parseViewAs, VIEW_AS_COOKIE } from "./view-as";

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** The stored override (`null` when none or not a known role). */
export function readViewAs() {
  const entry = document.cookie.split("; ").find((part) => part.startsWith(`${VIEW_AS_COOKIE}=`));
  return parseViewAs(entry?.slice(VIEW_AS_COOKIE.length + 1));
}

/** Session cookie (no max-age): it ends with the browser session and is shared by every tab. */
export function writeViewAs(role: string | null) {
  document.cookie = role
    ? `${VIEW_AS_COOKIE}=${role}; path=/; samesite=lax`
    : `${VIEW_AS_COOKIE}=; path=/; max-age=0; samesite=lax`;
  notify();
}

/** `useSyncExternalStore` subscription: this tab's writes, and other tabs' writes on focus. */
export function subscribeViewAs(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("focus", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("focus", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}
