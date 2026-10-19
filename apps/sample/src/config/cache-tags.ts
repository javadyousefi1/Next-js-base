/**
 * Next.js server-cache tags (`cacheTag` / `revalidateTag` / `updateTag`).
 * Keep tags here so server reads and mutations always agree on the name.
 * Never put secrets or personal data in a tag — tags are stored in plain text.
 */
export const CACHE_TAGS = {
  dashboardStats: "dashboard:stats",
} as const;
