"use client";

import { useProvincesQuery } from "../base-info.api";

/** All provinces (`[]` while loading). */
export function useProvinces() {
  const query = useProvincesQuery();
  return { provinces: query.data ?? [], isLoading: query.isPending };
}
