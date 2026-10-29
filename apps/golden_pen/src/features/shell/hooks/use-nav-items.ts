"use client";

import { NAV_GROUPS } from "@/config/navigation";
import { usePathname } from "@/i18n/navigation";

import { markActive } from "../nav-active";

/** Sidebar groups with the active state of each item for the current (locale-less) pathname. */
export function useNavItems() {
  return markActive(NAV_GROUPS, usePathname());
}
