"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ColumnDef, RowData } from "@tanstack/react-table";

import type { ApiError } from "@/lib/http/errors";

import type { DataTableDefinition, DataTableParams } from "./define-data-table";
import type { DataTableFeatures } from "./features";
import type { DataTableLabels, DataTableModel } from "./types";
import { useDataTable } from "./use-data-table";
import { useDataTableState } from "./use-data-table-state";

type UseQueryTableOptions<TDefinition extends DataTableDefinition, TData, TRow extends RowData> = {
  /** From `defineDataTable` (shared with the server prefetch). */
  definition: TDefinition;
  /** A `makeQuery` definition whose params are the table params. */
  query: { options(params: DataTableParams<TDefinition>): UseQueryOptions<TData, ApiError, TData> };
  /** Where the rows and the total count live in the response. */
  select: (data: TData) => { rows: TRow[]; total: number };
  // oxlint-disable-next-line typescript/no-explicit-any -- TanStack's type for mixed column value types
  columns: ColumnDef<DataTableFeatures, TRow, any>[];
  getRowId: (row: TRow) => string;
  labels: DataTableLabels<TDefinition["filters"]>;
};

function getStatus(query: { isError: boolean; data: unknown }): DataTableModel<never>["status"] {
  if (query.data !== undefined) return "ready";
  return query.isError ? "error" : "loading";
}

const EMPTY_PAGE = { rows: [], total: 0 };

/**
 * The whole server-driven table in one hook: URL state → validated query → table model.
 * A feature only passes its definition, query, columns and labels; `<DataTableView>` renders it.
 */
export function useQueryTable<TDefinition extends DataTableDefinition, TData, TRow extends RowData>(
  options: UseQueryTableOptions<TDefinition, TData, TRow>,
): DataTableModel<TRow> {
  const state = useDataTableState(options.definition, options.labels);
  // Previous page stays visible while the next one loads.
  const query = useQuery({
    ...options.query.options(state.params),
    placeholderData: keepPreviousData,
  });
  const page = query.data === undefined ? EMPTY_PAGE : options.select(query.data);

  const { table, pagination } = useDataTable<TRow>({
    ...state.binding,
    data: page.rows,
    rowCount: page.total,
    columns: options.columns,
    getRowId: options.getRowId,
  });

  return {
    table,
    pagination,
    toolbar: state.toolbar,
    status: getStatus(query),
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
  };
}
