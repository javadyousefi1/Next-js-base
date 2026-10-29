import { Skeleton } from "@repo/ui/components/skeleton";

type DataTableSkeletonProps = {
  columns?: number;
  rows?: number;
};

/** Loading placeholder with the same footprint as `<DataTable>` (server-safe, no hooks). */
export function DataTableSkeleton({ columns = 5, rows = 10 }: DataTableSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3" aria-hidden>
      {Array.from({ length: rows + 1 }, (_row, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: columns }, (_column, column) => (
            <Skeleton key={column} className="h-7 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
