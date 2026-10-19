"use client";

import { ruleForPath } from "@repo/access/access";
import { useAccess } from "@repo/access/access-context";

import { ROUTE_ACCESS } from "@/config/access";
import { NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { usePathname } from "@/i18n/navigation";

function isActive(pathname: string, href: string) {
  return href === ROUTES.dashboard ? pathname === href : pathname.startsWith(href);
}

/** Sidebar items the user may open (pages without an access rule are always listed), with their active state for the current (locale-less) pathname. */
export function useNavItems() {
  const pathname = usePathname();
  const { can } = useAccess();

  return NAV_ITEMS.filter((item) => {
    const rule = ruleForPath(ROUTE_ACCESS, item.href);
    return !rule || can(rule);
  }).map((item) => ({ ...item, isActive: isActive(pathname, item.href) }));
}
