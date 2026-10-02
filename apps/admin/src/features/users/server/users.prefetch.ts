import "server-only";

import { dehydrate } from "@tanstack/react-query";
import type { SearchParams } from "nuqs/server";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { getQueryClient } from "@/lib/query";
import { getAccessToken } from "@/server/auth/cookies";
import { bearer, upstream } from "@/server/http/upstream";

import { usersListQuery } from "../api/users.queries";
import { toUpstreamListQuery } from "../api/users.service";
import { loadUsersSearchParams, toUsersListParams } from "../users.search-params";

/**
 * Server-side prefetch of the users page: reads the URL state + the httpOnly access token and
 * calls the upstream API directly, then returns the dehydrated cache for `<HydrationBoundary>`.
 * If the token is missing/expired the prefetch silently fails and the browser fetches through
 * the BFF instead (which refreshes the session).
 */
export async function prefetchUsersPage(searchParams: Promise<SearchParams>) {
  const queryClient = getQueryClient();
  const [urlState, accessToken] = await Promise.all([
    loadUsersSearchParams(searchParams),
    getAccessToken(),
  ]);

  if (accessToken) {
    await usersListQuery.prefetch(queryClient, toUsersListParams(urlState), {
      fetcher: async (parsed, { signal }) => {
        const { data } = await upstream.get<unknown>(API_ENDPOINTS.users.list, {
          params: toUpstreamListQuery(parsed),
          headers: bearer(accessToken),
          signal,
        });
        return data;
      },
    });
  }

  return dehydrate(queryClient);
}
