"use client";

import { DataTableProvider } from "@repo/table/data-table-context";
import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";

import { useIdentityActions } from "../hooks/use-identity-actions";
import { useIdentityRequestsTable } from "../hooks/use-identity-requests-table";
import { useIdentityReview } from "../hooks/use-identity-review";
import { useIdentityRequestsColumns } from "./identity-requests-columns";
import { useIdentityRequestsFilters } from "./identity-requests-filters";
import { IdentityReviewSheet } from "./identity-review-sheet";

export function IdentityRequestsTable() {
  const t = useTranslations("IdentityRequests");
  const table = useIdentityRequestsTable();
  const actions = useIdentityActions();
  const review = useIdentityReview();
  const columns = useIdentityRequestsColumns({ actions, onReview: review.open });
  const filters = useIdentityRequestsFilters();

  return (
    <DataTableProvider
      table={table}
      columns={columns}
      filters={filters}
      searchPlaceholder={t("searchPlaceholder")}
    >
      <div className="flex flex-col gap-4">
        <DataTable emptyTitle={t("empty")} />
        <DataTablePagination />
      </div>
      <IdentityReviewSheet review={review} actions={actions} />
    </DataTableProvider>
  );
}
