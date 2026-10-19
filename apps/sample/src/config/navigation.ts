import { LayoutDashboardIcon, SettingsIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { EXAMPLES, EXAMPLES_ICON } from "./examples";
import { ROUTES, type AppRoute } from "./routes";

export type NavItem = {
  href: AppRoute;
  /** Key in the `Nav` messages namespace. */
  labelKey: "dashboard" | "users" | "settings" | "examples" | (typeof EXAMPLES)[number]["key"];
  icon: LucideIcon;
};

export type NavGroup = {
  /** Key in the `Nav` messages namespace. */
  labelKey: "main" | "examples";
  items: readonly NavItem[];
};

/** Sidebar groups. Add a page → add it to `ROUTES` and here (an example → `EXAMPLES`). */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    labelKey: "main",
    items: [
      { href: ROUTES.dashboard, labelKey: "dashboard", icon: LayoutDashboardIcon },
      { href: ROUTES.users, labelKey: "users", icon: UsersIcon },
      { href: ROUTES.settings, labelKey: "settings", icon: SettingsIcon },
    ],
  },
  {
    labelKey: "examples",
    items: [
      { href: ROUTES.examples, labelKey: "examples", icon: EXAMPLES_ICON },
      ...EXAMPLES.map(({ href, key, icon }) => ({ href, labelKey: key, icon })),
    ],
  },
];
