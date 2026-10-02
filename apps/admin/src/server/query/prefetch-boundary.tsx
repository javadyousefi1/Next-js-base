import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense, type ReactNode } from "react";

import { getQueryClient, type PrefetchItem } from "@/lib/query";
import { getAccessToken } from "@/server/auth/cookies";
import { upstreamFor } from "@/server/http/upstream";

type PrefetchBoundaryProps = {
  /** e.g. `[usersListQuery.with(usersTable.loadParams(searchParams))]` */
  queries: PrefetchItem[];
  /** Rendered while the server fetches (usually the view's skeleton). */
  fallback: ReactNode;
  children: ReactNode;
};

/**
 * Server prefetch + hydration in one element:
 *
 *   <PrefetchBoundary queries={[usersListQuery.with(params)]} fallback={<Skeleton />}>
 *     <UsersTable />   ← its `usersListQuery.useQuery(...)` renders with data immediately
 *   </PrefetchBoundary>
 *
 * Runs at request time inside its own <Suspense> (it reads the auth cookie), calls the upstream
 * API with the user's token through the same fetchers the browser uses, and dehydrates the cache.
 * No session or an expired token → nothing is prefetched and the client fetches via the BFF.
 */
export function PrefetchBoundary({ queries, fallback, children }: PrefetchBoundaryProps) {
  return (
    <Suspense fallback={fallback}>
      <Prefetch queries={queries}>{children}</Prefetch>
    </Suspense>
  );
}

async function Prefetch({ queries, children }: Omit<PrefetchBoundaryProps, "fallback">) {
  const queryClient = getQueryClient();
  const accessToken = await getAccessToken();

  if (accessToken) {
    const http = upstreamFor(accessToken);
    await Promise.all(queries.map((query) => query.prefetch(queryClient, http)));
  }

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
