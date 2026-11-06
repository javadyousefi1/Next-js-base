import { z } from "zod";

import { dashboardKeys } from "@/features/dashboard/dashboard.backend";
import { PAGE_INDEX_BASE } from "@/features/users/users.api";
import { useApiMutation, useApiQuery } from "@/lib/query/api-hooks";

import type {
  CreatedInviteLink,
  CreateInviteLinkInput,
  InviteLinksList,
  InviteLinksListParams,
  InviteLinkStatus,
} from "./schemas/invite-link.schema";

/**
 * The ONLY file that knows the backend's invite-link API (`GET /User/InviteLink/GetAll`:
 * PascalCase query, `{ items, totalCount }`; `POST /User/InviteLink/Create`): endpoints, mapping,
 * response schemas, keys, queries and mutations. A new backend → change this file (+ the MSW
 * mock), nothing else.
 */

/** Relative to `API_BASE_URL` on the server, or to `/api/proxy` in the browser (BFF). */
export const INVITE_LINKS_ENDPOINT = "/User/InviteLink/GetAll";
export const CREATE_INVITE_LINK_ENDPOINT = "/User/InviteLink/Create";

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

/** Hierarchical: invalidating `all` refreshes every invite-links query. */
export const inviteLinksKeys = {
  all: ["invite-links"] as const,
  list: (params: InviteLinksListParams) => ["invite-links", "list", params] as const,
};

/** One table page; the previous page stays visible while the next one loads. */
export const useInviteLinksListQuery = (params: InviteLinksListParams) =>
  useApiQuery({
    key: inviteLinksKeys.list(params),
    url: INVITE_LINKS_ENDPOINT,
    params: toBackendListQuery(params),
    schema: inviteLinksListResponse,
    keepPrevious: true,
    staleTime: 30_000,
  });

/**
 * Refreshes the lists and the dashboard counts (unused invite links). `silent`: the form renders
 * the error. Callers add their own `onSuccess` to `mutate(vars, { onSuccess })`.
 */
export const useCreateInviteLinkMutation = () =>
  useApiMutation({
    method: "POST",
    url: CREATE_INVITE_LINK_ENDPOINT,
    body: (input: CreateInviteLinkInput) => toBackendCreateBody(input),
    schema: createInviteLinkResponse,
    invalidates: [inviteLinksKeys.all, dashboardKeys.all],
    silent: true,
  });
