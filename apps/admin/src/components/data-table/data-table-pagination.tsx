"use client";

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

import { PAGE_SIZES } from "@/lib/table/search-params";
import type { DataTablePagination as PaginationModel } from "@/lib/table/use-data-table";

type DataTablePaginationProps = {
  pagination: PaginationModel;
};

export function DataTablePagination({ pagination }: DataTablePaginationProps) {
  const t = useTranslations("DataTable");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">{t("total", { total: pagination.rowCount })}</p>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{t("rowsPerPage")}</span>
          <Select
            value={pagination.pageSize}
            onValueChange={(pageSize) => pagination.setPageSize(Number(pageSize))}
          >
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

        <span className="tabular-nums">
          {t("summary", { page: pagination.page, pageCount: pagination.pageCount })}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("first")}
            disabled={!pagination.canPrevious}
            onClick={() => pagination.goTo(1)}
          >
            <ChevronsLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("previous")}
            disabled={!pagination.canPrevious}
            onClick={() => pagination.goTo(pagination.page - 1)}
          >
            <ChevronLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("next")}
            disabled={!pagination.canNext}
            onClick={() => pagination.goTo(pagination.page + 1)}
          >
            <ChevronRightIcon className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("last")}
            disabled={!pagination.canNext}
            onClick={() => pagination.goTo(pagination.pageCount)}
          >
            <ChevronsRightIcon className="rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
