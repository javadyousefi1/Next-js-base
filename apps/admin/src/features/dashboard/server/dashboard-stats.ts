import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { CACHE_TAGS } from "@/config/cache-tags";
import { upstream } from "@/server/http/upstream";

import { dashboardStatsSchema } from "../schemas/dashboard.schema";

/**
 * Next.js-level cache (`use cache`): one upstream call per `cacheLife("minutes")` window, shared
 * by every user (the stats are not user-specific — never cache per-user data this way).
 * Invalidate early with `updateTag(CACHE_TAGS.dashboardStats)` (see dashboard.actions.ts).
 */
export async function getDashboardStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.dashboardStats);

  return upstream.get(API_ENDPOINTS.stats, { schema: dashboardStatsSchema });
}
