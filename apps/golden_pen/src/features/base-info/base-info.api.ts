import { z } from "zod";

import { useApiQuery } from "@/lib/query/api-hooks";

import type { BaseInfoOption, CitiesParams } from "./schemas/base-info.schema";

/**
 * The ONLY file that knows the backend's base-info API (`GET /base-info/enums`: `type` 1 =
 * provinces, `type` 2 + `parentId` = the cities of a province). The response shape is not in
 * the swagger, so it is read leniently: an array (or `{ items }`) of `{ id, name }`, extra keys
 * ignored, `id` a number or a numeric string. Endpoint, mapping, response schema, keys and queries.
 */

/** Relative to `API_BASE_URL` on the server, or to `/api/proxy` in the browser (BFF). */
export const BASE_INFO_ENUMS_ENDPOINT = "/base-info/enums";

const ENUM_TYPE = { province: 1, city: 2 } as const;

export function toProvincesQuery() {
  return { type: ENUM_TYPE.province };
}

export function toCitiesQuery(params: CitiesParams) {
  return { type: ENUM_TYPE.city, parentId: params.provinceId };
}

const backendOptionSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(Number).pipe(z.number().int()),
  name: z.string(),
});

/** Backend options → the app's `BaseInfoOption[]`. */
export const baseInfoOptionsResponse = z
  .union([z.array(backendOptionSchema), z.object({ items: z.array(backendOptionSchema) })])
  .transform((value): BaseInfoOption[] => {
    const options = Array.isArray(value) ? value : value.items;
    return options.map(({ id, name }) => ({ id, name }));
  });

/** Hierarchical: invalidating `all` refreshes every lookup. */
export const baseInfoKeys = {
  all: ["base-info"] as const,
  provinces: () => ["base-info", "provinces"] as const,
  cities: (params: CitiesParams) => ["base-info", "cities", params] as const,
};

/** Lookups change rarely: keep them for an hour. */
const LOOKUP_STALE_TIME = 60 * 60_000;

export const useProvincesQuery = () =>
  useApiQuery({
    key: baseInfoKeys.provinces(),
    url: BASE_INFO_ENUMS_ENDPOINT,
    params: toProvincesQuery(),
    schema: baseInfoOptionsResponse,
    staleTime: LOOKUP_STALE_TIME,
  });

/** The cities of a province; `enabled: false` fetches nothing (no province chosen). */
export const useCitiesQuery = (params: CitiesParams, enabled: boolean) =>
  useApiQuery({
    key: baseInfoKeys.cities(params),
    url: BASE_INFO_ENUMS_ENDPOINT,
    params: toCitiesQuery(params),
    schema: baseInfoOptionsResponse,
    staleTime: LOOKUP_STALE_TIME,
    enabled,
  });
