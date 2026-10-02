"use client";

import { keepPreviousData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";

import { useDataTable } from "@/hooks/use-data-table";
import { TABLE_URL_OPTIONS, useTableUrlState } from "@/hooks/use-table-url-state";
import type { DataTableFeatures } from "@/lib/table/features";

import { usersListQuery } from "../api/users.queries";
import type { User, UserRole } from "../schemas/user.schema";
import { toUsersListParams, usersFilterParams } from "../users.search-params";

const NO_USERS: User[] = [];

function getStatus(query: { isPending: boolean; isError: boolean; data: unknown }) {
  if (query.data !== undefined) return "ready";
  if (query.isError) return "error";
  return query.isPending ? "loading" : "ready";
}

type UseUsersTableOptions = {
  columns: ColumnDef<DataTableFeatures, User, any>[];
};

/**
 * All the logic of the users table: URL state → validated query → table model.
 * The view only renders what this returns.
 */
export function useUsersTable({ columns }: UseUsersTableOptions) {
  const url = useTableUrlState();
  const [filters, setFilters] = useQueryStates(usersFilterParams, TABLE_URL_OPTIONS);
  const { page, pageSize, sortBy, order } = url.state;

  const query = usersListQuery.useQuery(
    toUsersListParams({ ...url.state, q: url.debouncedSearch, role: filters.role }),
    { placeholderData: keepPreviousData },
  );

  const { table, pagination } = useDataTable({
    data: query.data?.users ?? NO_USERS,
    columns,
    rowCount: query.data?.total ?? 0,
    page,
    pageSize,
    sortBy,
    order,
    onPageChange: url.setPage,
    onPageSizeChange: url.setPageSize,
    onSortingChange: url.setSorting,
    getRowId: (user) => String(user.id),
  });

  return {
    table,
    pagination,
    search: url.search,
    setSearch: url.setSearch,
    role: filters.role,
    setRole: (role: UserRole | null) => {
      void setFilters({ role });
      void url.resetPage();
    },
    hasFilters: url.search !== "" || filters.role !== null,
    resetFilters: () => {
      void setFilters(null);
      void url.reset();
    },
    /** `loading` only before the first page; later pages keep the previous rows visible. */
    status: getStatus(query),
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
  };
}

export type UsersTableModel = ReturnType<typeof useUsersTable>;
