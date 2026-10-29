import { PAGE_SIZES } from "@repo/table/search-params";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Table, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";

import { HEADER_ROW_CLASS } from "./data-table-layout";
import { DataTableSkeleton } from "./data-table-skeleton";

type DataTablePlaceholderProps = {
  /** Column titles (translated by the page), in the table's column order. */
  headers: readonly string[];
};

/**
 * Static stand-in (server-safe) for the table and its pagination bar while the server fetches:
 * the real header row + skeleton rows, the same footprint as `<DataTable>` +
 * `<DataTablePagination>` for the default page size.
 */
export function DataTablePlaceholder({ headers }: DataTablePlaceholderProps) {
  const rows = PAGE_SIZES[0];

  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className={HEADER_ROW_CLASS}>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <DataTableSkeleton columns={headers.length} rows={rows} />
        </Table>
      </div>
      <div className="flex min-h-8 items-center justify-between gap-3" aria-hidden>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-72 max-w-full" />
      </div>
    </div>
  );
}
