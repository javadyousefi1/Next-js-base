import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type { CreateInviteLinkInput, InviteLinksListParams } from "../schemas/invite-link.schema";
import { toBackendCreateBody, toBackendListQuery } from "./invite-links.backend";

/** Works in the browser (BFF proxy) and on the server (prefetch): `http` is injected. */
export const fetchInviteLinksList: QueryFetcher<InviteLinksListParams> = (
  params,
  { http, signal },
) => http.get(API_ENDPOINTS.users.inviteLinks, { params: toBackendListQuery(params), signal });

/** Writes run in the browser only, through the BFF proxy. */
export function createInviteLink(input: CreateInviteLinkInput): Promise<unknown> {
  return apiClient.post(API_ENDPOINTS.users.createInviteLink, toBackendCreateBody(input));
}
