"use client";

import { TABLE_URL_OPTIONS, tableSearchParams } from "@repo/table/search-params";
import { useTranslations } from "next-intl";
import { useQueryStates } from "nuqs";

import { statusTabParser } from "../identity-requests.search-params";
import { statusTabSchema, STATUS_TABS } from "../schemas/identity-requests.schema";

/** The status tabs above the table: the `status` URL key (default tab left out) and their labels. */
export function useIdentityStatusTab() {
  const t = useTranslations("IdentityRequests");
  const [{ status }, setParams] = useQueryStates(
    { status: statusTabParser, page: tableSearchParams.page },
    TABLE_URL_OPTIONS,
  );

  return {
    value: status,
    tabs: STATUS_TABS.map((value) => ({ value, label: t(`tabs.${value}`) })),
    // A tab change goes back to the first page.
    select: (value: unknown) => {
      const tab = statusTabSchema.safeParse(value);
      if (tab.success) void setParams({ status: tab.data, page: 1 });
    },
  };
}
