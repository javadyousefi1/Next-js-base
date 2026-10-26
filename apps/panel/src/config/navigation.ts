import { LayoutDashboardIcon, SettingsIcon, type LucideIcon } from "lucide-react";

import { ROUTES, type AppRoute } from "./routes";

export type NavItem = {
  href: AppRoute;
  /** Key in the `Nav` messages namespace. */
  labelKey: "dashboard" | "settings";
  icon: LucideIcon;
};

export type NavGroup = {
  /** Key in the `Nav` messages namespace. */
  labelKey: "main";
  items: readonly NavItem[];
};

/** Sidebar groups. Add a page → add it to `ROUTES` and here. */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: "main",
    items: [
      { href: ROUTES.dashboard, labelKey: "dashboard", icon: LayoutDashboardIcon },
      { href: ROUTES.settings, labelKey: "settings", icon: SettingsIcon },
    ],
  },
];
