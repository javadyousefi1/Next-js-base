"use client";

import { ruleForPath } from "@repo/access/access";
import { useAccess } from "@repo/access/access-context";

import { ROUTE_ACCESS } from "@/config/access";
import { NAV_GROUPS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { usePathname } from "@/i18n/navigation";

/** Overview pages (`/`, `/examples`) are active only on themselves, others on their subpages too. */
function isActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard || href === ROUTES.examples) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar groups with the items the user may open (pages without an access rule are always
 * listed) and their active state for the current (locale-less) pathname; empty groups are dropped.
 */
export function useNavItems() {
  const pathname = usePathname();
  const { can } = useAccess();

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => {
        const rule = ruleForPath(ROUTE_ACCESS, item.href);
        return !rule || can(rule);
      })
      .map((item) => ({ ...item, isActive: isActive(pathname, item.href) })),
  })).filter((group) => group.items.length > 0);
}
