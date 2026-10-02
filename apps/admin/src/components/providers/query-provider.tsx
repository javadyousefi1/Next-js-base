"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

import { getQueryClient } from "@/lib/query";
import { useQueryErrorToasts } from "@/lib/query/use-query-error-toasts";

export function QueryProvider({ children }: { children: ReactNode }) {
  // No useState: getQueryClient() returns a browser singleton (safe across suspense retries).
  const queryClient = getQueryClient();
  useQueryErrorToasts();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
