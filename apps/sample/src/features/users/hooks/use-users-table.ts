"use client";

import type { TableController } from "@repo/table/types";
import { useTableState } from "@repo/table/use-table-state";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { User } from "../schemas/user.schema";
import { usersListQuery } from "../users.api";
import { usersSearchParams } from "../users.search-params";

const NO_USERS: User[] = [];

/** URL state → users query → everything the data-table components need. */
export function useUsersTable(): TableController<User> {
  const { params, ...controls } = useTableState(usersSearchParams);
  // The search box debounces its own typing; keep the previous page visible while loading.
  const query = useQuery({ ...usersListQuery(params), placeholderData: keepPreviousData });

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
