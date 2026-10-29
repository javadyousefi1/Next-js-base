import { PAGE_SIZES } from "@repo/table/search-params";
import { z } from "zod";

/**
 * Roles of the filter. The ids are 1–4 in this order; the filter value sent to the API is the
 * role name string (the API also returns roles as these kebab-case strings).
 */
export const USER_ROLES = ["super-admin", "lawyer", "intern", "operator"] as const;
export const userRoleSchema = z.enum(USER_ROLES);

/** Identity statuses of the filter, as URL strings: 0 None, 1 Requested, 2 Pending, 3 Verified, 4 Rejected, 5 Revoked. */
export const IDENTITY_STATUSES = ["0", "1", "2", "3", "4", "5"] as const;
export const identityStatusSchema = z.enum(IDENTITY_STATUSES);

/** A user as the app uses it; the backend shape lives in api/users.backend.ts. */
export type User = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  username: string | null;
  /** Role names as the API sends them; unknown ones are shown as-is. */
  roles: string[];
  /** Identity status (see `IDENTITY_STATUSES`); `null` = the user has no identity. */
  identityStatus: number | null;
  isActive: boolean;
  isPhoneNumberVerified: boolean;
  /** ISO date-time. */
  createdAt: string | null;
};

/**
 * Input contract of the users list query. It mirrors the table URL state, so every field
 * `.catch()`es to its default: a hand-edited URL (`?page=-3&role=hack`) is sanitized instead
 * of failing the query. The API has no sorting, so `sortBy`/`order` are not part of it.
 */
export const usersListParamsSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(PAGE_SIZES[0]),
  q: z.string().trim().catch(""),
  phoneNumber: z.string().trim().nullable().catch(null),
  role: userRoleSchema.nullable().catch(null),
  identityStatus: identityStatusSchema.nullable().catch(null),
});
export type UsersListParams = z.output<typeof usersListParamsSchema>;
export type UsersListParamsInput = z.input<typeof usersListParamsSchema>;

/** A page of users as the app uses it; the backend shape lives in api/users.backend.ts. */
export type UsersList = { items: User[]; total: number };

export type UserRole = z.infer<typeof userRoleSchema>;

export function isKnownRole(role: string): role is UserRole {
  return userRoleSchema.safeParse(role).success;
}
