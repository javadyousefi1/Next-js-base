"use client";

import { ruleForPath } from "@repo/access/access";
import { useAccess } from "@repo/access/access-context";

import { ROUTE_ACCESS } from "@/config/access";
import { usePathname } from "@/i18n/navigation";

/** Can the user open the current page? `pending` until the session has loaded (the page still renders). */
export function useRouteAccess(): "allowed" | "pending" | "denied" {
  const pathname = usePathname();
  const { isReady, can } = useAccess();
  const rule = ruleForPath(ROUTE_ACCESS, pathname);

  if (!rule) return "allowed";
  if (!isReady) return "pending";
  return can(rule) ? "allowed" : "denied";
}
