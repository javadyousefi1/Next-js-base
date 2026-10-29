import type { NavGroup, NavLink, NavParent } from "@/config/navigation";
import { ROUTES } from "@/config/routes";

/** The dashboard is active only on itself, other pages on their subpages too. */
export function isActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type ActiveNavLink = NavLink & { isActive: boolean };
export type ActiveNavParent = Omit<NavParent, "children"> & {
  /** Any child is active. */
  isActive: boolean;
  children: ActiveNavLink[];
};
export type ActiveNavItem = ActiveNavLink | ActiveNavParent;
export type ActiveNavGroup = Omit<NavGroup, "items"> & { items: ActiveNavItem[] };

/** Marks the active links of the groups; a parent is active when any of its children is. */
export function markActive(groups: readonly NavGroup[], pathname: string): ActiveNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item): ActiveNavItem => {
      if (!("children" in item)) return { ...item, isActive: isActive(pathname, item.href) };
      const children = item.children.map((child) => ({
        ...child,
        isActive: isActive(pathname, child.href),
      }));
      return { ...item, children, isActive: children.some((child) => child.isActive) };
    }),
  }));
}
