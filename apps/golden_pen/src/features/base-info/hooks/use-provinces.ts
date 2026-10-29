"use client";

import { provincesQuery } from "../api/base-info.queries";

/** All provinces (`[]` while loading). */
export function useProvinces() {
  const query = provincesQuery.useQuery();
  return { provinces: query.data ?? [], isLoading: query.isPending };
}
