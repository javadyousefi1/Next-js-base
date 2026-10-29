"use client";

import type { DataTableFilter } from "@repo/table/types";
import { useTranslations } from "next-intl";

/** Fields of the Filters drawer (the status is the tabs' job). Each `id` is a key of `identityRequestsSearchParams`. */
export function useIdentityRequestsFilters(): DataTableFilter[] {
  const t = useTranslations("Users");

  return [
    {
      type: "text",
      id: "phoneNumber",
      title: t("phoneNumberFilter"),
      placeholder: t("phoneNumberPlaceholder"),
    },
  ];
}
