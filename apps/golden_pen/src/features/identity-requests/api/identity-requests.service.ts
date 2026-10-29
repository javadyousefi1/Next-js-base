import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/http/client";
import type { QueryFetcher } from "@/lib/query";

import type {
  IdentityActionInput,
  IdentityDetailParams,
  IdentityRequestsListParams,
} from "../schemas/identity-requests.schema";
import {
  toBackendListQuery,
  toDetailQuery,
  toIdentityActionBody,
} from "./identity-requests.backend";

/** Work in the browser (BFF proxy) and on the server (prefetch): `http` is injected. */
export const fetchIdentityRequestsList: QueryFetcher<IdentityRequestsListParams> = (
  params,
  { http, signal },
) => http.get(API_ENDPOINTS.users.list, { params: toBackendListQuery(params), signal });

export const fetchIdentityDetail: QueryFetcher<IdentityDetailParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.me, { params: toDetailQuery(params), signal });

/** Writes run in the browser only, through the BFF proxy. */
export function actOnIdentity(input: IdentityActionInput): Promise<unknown> {
  return apiClient.put(API_ENDPOINTS.users.identity, toIdentityActionBody(input));
}
