"use client";

import { useCitiesQuery } from "../base-info.api";

/** The cities of a province; nothing is fetched while no province is chosen (`null`). */
export function useCities(provinceId: number | null) {
  const query = useCitiesQuery({ provinceId: provinceId ?? 0 }, provinceId !== null);
  return { cities: provinceId === null ? [] : (query.data ?? []), isLoading: query.isFetching };
}
