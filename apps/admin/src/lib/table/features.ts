import {
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

/** Extra column options read by the generic table components. */
export type DataTableColumnMeta = {
  /** Renders a select filter for this column in `<DataTableToolbar>` (URL key = column id). */
  filter?: { title: string; options: { value: string; label: string }[] };
};

/**
 * TanStack Table v9 features for server-driven tables: filtering, sorting and pagination happen
 * on the API (no client row models). Column helpers must use the same features type.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});
export type DataTableFeatures = typeof dataTableFeatures;
