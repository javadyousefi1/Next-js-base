import { z } from "zod";

import { PAGE_INDEX_BASE } from "@/features/users/api/users.backend";

import type {
  CreatedInviteLink,
  CreateInviteLinkInput,
  InviteLinksList,
  InviteLinksListParams,
  InviteLinkStatus,
} from "../schemas/invite-link.schema";

/**
 * The ONLY file that knows the backend's invite-link API (`GET /User/InviteLink/GetAll`:
 * PascalCase query, `{ items, totalCount }`; `POST /User/InviteLink/Create`). A new backend →
 * change this file (+ `API_ENDPOINTS`, the MSW mock), nothing else.
 */

/** Maps the table params to the backend query string. `IsUsed` is left out when unset. */
export function toBackendListQuery(params: InviteLinksListParams) {
  return {
    PageIndex: params.page - 1 + PAGE_INDEX_BASE,
    PageSize: params.pageSize,
    IsUsed: params.isUsed === null ? undefined : params.isUsed === "true",
  };
}

/** The create request body; `expiresInDays` is omitted for the server's default. */
export function toBackendCreateBody(input: CreateInviteLinkInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    phoneNumber: input.phoneNumber,
    expiresInDays: input.expiresInDays ?? undefined,
  };
}

const backendInviteLinkSchema = z.object({
  id: z.string(),
  inviteUrl: z.string(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  phoneNumber: z.string(),
  expiresAt: z.string(),
  usedAt: z.string().nullish(),
  isValid: z.boolean(),
  createdAt: z.string().nullish(),
});

function statusOf(link: { usedAt?: string | null; isValid: boolean }): InviteLinkStatus {
  if (link.usedAt) return "used";
  return link.isValid ? "active" : "expired";
}

/** Backend `{ items, totalCount }` → the app's `InviteLinksList`. */
export const inviteLinksListResponse = z
  .object({
    items: z.array(backendInviteLinkSchema).nullable(),
    totalCount: z.number().int().nonnegative(),
  })
  .transform(({ items, totalCount }): InviteLinksList => ({
    items: (items ?? []).map((link) => ({
      id: link.id,
      fullName: `${link.firstName ?? ""} ${link.lastName ?? ""}`.trim(),
      phoneNumber: link.phoneNumber,
      inviteUrl: link.inviteUrl,
      status: statusOf(link),
      expiresAt: link.expiresAt,
      usedAt: link.usedAt ?? null,
      createdAt: link.createdAt ?? null,
    })),
    total: totalCount,
  }));

/** Create response → the app's `CreatedInviteLink`. */
export const createInviteLinkResponse = z
  .object({ id: z.string(), inviteUrl: z.string(), expiresAt: z.string() })
  .transform((link): CreatedInviteLink => link);
