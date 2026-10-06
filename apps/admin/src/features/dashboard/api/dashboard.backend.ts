import { z } from "zod";

import { USER_ROLES } from "@/features/users/schemas/user.schema";

import type { DashboardStats } from "../schemas/dashboard.schema";

/**
 * The ONLY file that knows the backend's dashboard API (here: a `/stats` endpoint that already
 * answers in the app's shape). A new backend → change this file (+ `API_ENDPOINTS`, the MSW
 * mock), nothing else.
 */
export const dashboardStatsResponse: z.ZodType<DashboardStats> = z.object({
  totalUsers: z.number().int().nonnegative(),
  roles: z.record(z.enum(USER_ROLES), z.number().int().nonnegative()),
  generatedAt: z.iso.datetime(),
});
