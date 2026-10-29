"use client";

import type { TableController } from "@repo/table/types";
import { useTableState } from "@repo/table/use-table-state";
import { keepPreviousData } from "@tanstack/react-query";

import type { User } from "@/features/users/schemas/user.schema";

import { identityRequestsListQuery } from "../api/identity-requests.queries";
import { identityRequestsSearchParams } from "../identity-requests.search-params";
import { useIdentityStatusTab } from "./use-identity-status-tab";

const NO_USERS: User[] = [];

/** URL state + status tab → identity-requests query → everything the data-table components need. */
export function useIdentityRequestsTable(): TableController<User> {
  const { params, ...controls } = useTableState(identityRequestsSearchParams);
  const tab = useIdentityStatusTab();
  const query = identityRequestsListQuery.useQuery(
    { ...params, status: tab.value },
    { placeholderData: keepPreviousData },
  );

  return {
    ...controls,
    rows: query.data?.items ?? NO_USERS,
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
  };
}
