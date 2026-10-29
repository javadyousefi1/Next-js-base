"use client";

import type { DataTableFilter } from "@repo/table/types";
import { useTranslations } from "next-intl";

import { IS_USED_FILTERS } from "../schemas/invite-link.schema";

/** Fields of the Filters drawer. Each `id` is a key of `inviteLinksSearchParams`. */
export function useInviteLinksFilters(): DataTableFilter[] {
  const t = useTranslations("InviteLinks");

  return [
    {
      type: "select",
      id: "isUsed",
      title: t("isUsedFilter"),
      options: IS_USED_FILTERS.map((value) => ({ value, label: t(`isUsed.${value}`) })),
    },
  ];
}
