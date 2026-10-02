"use server";

import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/config/cache-tags";
import { getAccessToken } from "@/server/auth/cookies";

/** Server Action: expire the cached stats; the page re-renders with fresh data. */
export async function refreshDashboardStats(): Promise<void> {
  // Server Actions are public endpoints: always check the session.
  if (!(await getAccessToken())) return;
  updateTag(CACHE_TAGS.dashboardStats);
}
