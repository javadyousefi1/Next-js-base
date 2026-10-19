"use client";

import type { ReactNode } from "react";

import { useRouteAccess } from "../hooks/use-route-access";
import { NoAccess } from "./no-access";

/**
 * "No access" instead of the page once the session says the user may not open it. Until the
 * session is known the page renders as usual (optimistic, like `proxy.ts`), so its server
 * prefetch still paints at once; the backend refuses the data either way.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  return useRouteAccess() === "denied" ? <NoAccess /> : children;
}
