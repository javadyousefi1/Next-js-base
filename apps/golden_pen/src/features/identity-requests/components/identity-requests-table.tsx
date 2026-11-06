"use client";

import { useTranslations } from "next-intl";

import { DataTableView } from "@/components/data-table/data-table-view";

import { useIdentityActions } from "../hooks/use-identity-actions";
import { useIdentityRequestsTable } from "../hooks/use-identity-requests-table";
import { useIdentityReview } from "../hooks/use-identity-review";
import { useIdentityRequestsColumns } from "./identity-requests-columns";
import { useIdentityRequestsFilters } from "./identity-requests-filters";
import { IdentityReviewSheet } from "./identity-review-sheet";

export function IdentityRequestsTable() {
  const t = useTranslations("IdentityRequests");
  const actions = useIdentityActions();
  const review = useIdentityReview();

  return (
    <DataTableView
      table={useIdentityRequestsTable()}
      columns={useIdentityRequestsColumns({ actions, onReview: review.open })}
      filters={useIdentityRequestsFilters()}
      searchPlaceholder={t("searchPlaceholder")}
      emptyTitle={t("empty")}
    >
      <IdentityReviewSheet review={review} actions={actions} />
    </DataTableView>
  );
}
