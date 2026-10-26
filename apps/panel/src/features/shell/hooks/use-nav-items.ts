"use client";

import { NAV_GROUPS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { usePathname } from "@/i18n/navigation";

/** The dashboard is active only on itself, other pages on their subpages too. */
function isActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar groups with the active state of each item for the current (locale-less) pathname. */
export function useNavItems() {
  const pathname = usePathname();

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, isActive: isActive(pathname, item.href) })),
  }));
}
