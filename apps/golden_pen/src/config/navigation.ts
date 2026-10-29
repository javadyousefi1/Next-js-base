import {
  LayoutDashboardIcon,
  Link2Icon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { ROUTES, type AppRoute } from "./routes";

/** Key in the `Nav` messages namespace. */
type NavLabelKey = "dashboard" | "users" | "inviteLinks" | "userManagement" | "settings";

/** A link to a page. */
export type NavLink = {
  href: AppRoute;
  labelKey: NavLabelKey;
  icon: LucideIcon;
};

/** A collapsible item that holds links (it has no page of its own). */
export type NavParent = {
  labelKey: NavLabelKey;
  icon: LucideIcon;
  children: readonly NavLink[];
};

export type NavItem = NavLink | NavParent;

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
      {
        labelKey: "userManagement",
        icon: UsersIcon,
        children: [
          { href: ROUTES.users, labelKey: "users", icon: UsersIcon },
          { href: ROUTES.inviteLinks, labelKey: "inviteLinks", icon: Link2Icon },
        ],
      },
      { href: ROUTES.settings, labelKey: "settings", icon: SettingsIcon },
    ],
  },
];
