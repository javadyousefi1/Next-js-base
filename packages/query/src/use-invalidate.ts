"use client";

import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useCallback } from "react";

import { invalidateKeys } from "./invalidate";

/** Hook form of `invalidateKeys` (respects `relatedKeys`). */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return useCallback(
    (keys: readonly QueryKey[]) => invalidateKeys(queryClient, keys),
    [queryClient],
  );
}
