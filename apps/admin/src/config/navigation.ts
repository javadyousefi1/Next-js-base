import { LayoutDashboardIcon, SettingsIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { ROUTES, type AppRoute } from "./routes";

export type NavItem = {
  href: AppRoute;
  /** Key in the `Nav` messages namespace. */
  labelKey: "dashboard" | "users" | "settings";
  icon: LucideIcon;
};

/** Sidebar entries. Add a page → add it to `ROUTES` and here. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: ROUTES.dashboard, labelKey: "dashboard", icon: LayoutDashboardIcon },
  { href: ROUTES.users, labelKey: "users", icon: UsersIcon },
  { href: ROUTES.settings, labelKey: "settings", icon: SettingsIcon },
];
