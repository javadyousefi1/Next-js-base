"use client";

import { citiesQuery } from "../api/base-info.queries";

/** The cities of a province; nothing is fetched while no province is chosen (`null`). */
export function useCities(provinceId: number | null) {
  const query = citiesQuery.useQuery(
    { provinceId: provinceId ?? 0 },
    { enabled: provinceId !== null },
  );
  return { cities: provinceId === null ? [] : (query.data ?? []), isLoading: query.isFetching };
}
