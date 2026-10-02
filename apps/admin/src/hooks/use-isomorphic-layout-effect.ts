import { useEffect, useLayoutEffect } from "react";

import { isBrowser } from "@/lib/utils/runtime";

/** `useLayoutEffect` in the browser, `useEffect` on the server (no SSR warnings). */
export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
