import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { QueryFetcher } from "@/lib/query";

import type { UsersListParams } from "../schemas/user.schema";

/** Maps the table params to the upstream query string (limit/skip pagination). */
export function toUpstreamListQuery(params: UsersListParams) {
  return {
    limit: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
    q: params.q || undefined,
    role: params.role ?? undefined,
    sortBy: params.sortBy ?? undefined,
    order: params.sortBy ? params.order : undefined,
  };
}

/** Works in the browser (BFF proxy) and on the server (prefetch): `http` is injected. */
export const fetchUsersList: QueryFetcher<UsersListParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.users.list, { params: toUpstreamListQuery(params), signal });
