"use client";

import { useMediaQuery } from "@repo/hooks/use-media-query";

/** True when the user asks for less motion: animations then use duration 0. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
