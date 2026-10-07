"use client";

import { AccessProvider } from "@repo/access/access-context";
import type { ReactNode } from "react";

import { useSessionAccess } from "../hooks/use-session-access";

/** Hands the signed-in user's access to `<Can>`, `useAccess()` and the route guard. */
export function SessionAccessProvider({ children }: { children: ReactNode }) {
  const access = useSessionAccess();

  return <AccessProvider access={access}>{children}</AccessProvider>;
}
