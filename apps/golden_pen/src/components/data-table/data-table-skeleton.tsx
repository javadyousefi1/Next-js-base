import { Skeleton } from "@repo/ui/components/skeleton";
import { TableBody, TableCell, TableRow } from "@repo/ui/components/table";

import { BODY_ROW_CLASS } from "./data-table-layout";

type DataTableSkeletonProps = {
  columns: number;
  rows: number;
};

/** Loading rows with the same row height as the real ones (inside the table's `<Table>`). */
export function DataTableSkeleton({ columns, rows }: DataTableSkeletonProps) {
  return (
    <TableBody aria-hidden>
      {Array.from({ length: rows }, (_row, row) => (
        <TableRow key={row} className={BODY_ROW_CLASS}>
          {Array.from({ length: columns }, (_column, column) => (
            <TableCell key={column}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
