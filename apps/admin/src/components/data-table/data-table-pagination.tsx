"use client";

import { PAGE_SIZES } from "@repo/table/search-params";
import type { TableController } from "@repo/table/types";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

type DataTablePaginationProps = {
  table: TableController<unknown>;
};

export function DataTablePagination({ table }: DataTablePaginationProps) {
  const t = useTranslations("DataTable");
  const { page, pageSize } = table.state;
  const pageCount = Math.max(1, Math.ceil(table.total / pageSize));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">{t("total", { total: table.total })}</p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{t("rowsPerPage")}</span>
          <Select value={pageSize} onValueChange={(size) => table.setPageSize(Number(size))}>
            <SelectTrigger size="sm" aria-label={t("rowsPerPage")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="tabular-nums">{t("summary", { page, pageCount })}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("first")}
            disabled={page <= 1}
            onClick={() => table.setPage(1)}
          >
            <ChevronsLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("previous")}
            disabled={page <= 1}
            onClick={() => table.setPage(page - 1)}
          >
            <ChevronLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("next")}
            disabled={page >= pageCount}
            onClick={() => table.setPage(page + 1)}
          >
            <ChevronRightIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("last")}
            disabled={page >= pageCount}
            onClick={() => table.setPage(pageCount)}
          >
            <ChevronsRightIcon className="rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
