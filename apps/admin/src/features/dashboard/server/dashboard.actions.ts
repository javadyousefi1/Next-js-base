"use server";

import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/config/cache-tags";
import { hasAccess } from "@/server/auth/access";

/** Server Action: expire the cached stats; the page re-renders with fresh data. */
export async function refreshDashboardStats(): Promise<void> {
  // Server Actions are public endpoints: check the session user's permission, not just a cookie.
  if (!(await hasAccess("stats.refresh"))) return;
  updateTag(CACHE_TAGS.dashboardStats);
}
