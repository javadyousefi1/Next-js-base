"use client";

import { NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { usePathname } from "@/i18n/navigation";

function isActive(pathname: string, href: string) {
  return href === ROUTES.dashboard ? pathname === href : pathname.startsWith(href);
}

/** Sidebar items with their active state for the current (locale-less) pathname. */
export function useNavItems() {
  const pathname = usePathname();
  return NAV_ITEMS.map((item) => ({ ...item, isActive: isActive(pathname, item.href) }));
}
