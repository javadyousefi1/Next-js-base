import { z } from "zod";

import type { UsersList, UsersListParams } from "../schemas/user.schema";

/**
 * The ONLY file that knows the backend's users API (`GET /User/GetAll`: PascalCase query,
 * `{ items, totalCount }`, identity as `{ statusType }`). A new backend → change this file
 * (+ `API_ENDPOINTS`, the MSW mock), nothing else: views, hooks and the BFF only see the domain
 * types in `schemas/`.
 */

/** First `PageIndex` the API accepts. UNKNOWN: 1-based here; set 0 if the API is 0-based. */
export const PAGE_INDEX_BASE = 1;

/** Maps the table params to the backend query string. The search box searches the full name. */
export function toBackendListQuery(params: UsersListParams) {
  return {
    PageIndex: params.page - 1 + PAGE_INDEX_BASE,
    PageSize: params.pageSize,
    // The table shows the identity status, so the identity is always requested.
    IncludeIdentity: true,
    FullName: params.q || undefined,
    PhoneNumber: params.phoneNumber || undefined,
    Role: params.role ?? undefined,
    IdentityStatus: params.identityStatus === null ? undefined : Number(params.identityStatus),
  };
}

const backendUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z.string().nullish(),
  username: z.string().nullish(),
  isActive: z.boolean(),
  isPhoneNumberVerified: z.boolean(),
  // The status and the review fields are used; the rest of the identity is ignored.
  identity: z
    .looseObject({
      statusType: z.number().int(),
      requestedAt: z.string().nullish(),
      verifiedAt: z.string().nullish(),
      message: z.string().nullish(),
    })
    .nullish(),
  roles: z.array(z.string()).nullish(),
  createdAt: z.string().nullish(),
});

/** Backend `{ items, totalCount }` → the app's `UsersList`. */
export const usersListResponse = z
  .object({
    items: z.array(backendUserSchema).nullable(),
    totalCount: z.number().int().nonnegative(),
  })
  .transform(({ items, totalCount }): UsersList => ({
    items: (items ?? []).map((user) => ({
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email ?? null,
      username: user.username ?? null,
      roles: user.roles ?? [],
      identityStatus: user.identity?.statusType ?? null,
      identityRequestedAt: user.identity?.requestedAt ?? null,
      identityVerifiedAt: user.identity?.verifiedAt ?? null,
      identityMessage: user.identity?.message ?? null,
      isActive: user.isActive,
      isPhoneNumberVerified: user.isPhoneNumberVerified,
      createdAt: user.createdAt ?? null,
    })),
    total: totalCount,
  }));
