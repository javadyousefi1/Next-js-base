import type { UserRole } from "@/features/users/schemas/user.schema";

/** Dashboard numbers as the app uses them; the backend shape lives in api/dashboard.backend.ts. */
export type DashboardStats = {
  totalUsers: number;
  roles: Record<UserRole, number>;
  generatedAt: string;
};
