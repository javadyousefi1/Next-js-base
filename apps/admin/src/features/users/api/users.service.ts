import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/http/client";
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

/** Browser → BFF (`/api/proxy/users`). Returns raw data: the query validates it. */
export const fetchUsersList: QueryFetcher<UsersListParams> = async (params, { signal }) => {
  const { data } = await apiClient.get<unknown>(API_ENDPOINTS.users.list, {
    params: toUpstreamListQuery(params),
    signal,
  });
  return data;
};
