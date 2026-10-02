import { z } from "zod";

import { USER_ROLES } from "@/features/users/schemas/user.schema";

export const dashboardStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  roles: z.record(z.enum(USER_ROLES), z.number().int().nonnegative()),
  generatedAt: z.iso.datetime(),
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
