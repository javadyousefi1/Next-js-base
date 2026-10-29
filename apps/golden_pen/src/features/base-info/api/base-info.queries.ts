import { z } from "zod";

import { QUERY_KEYS } from "@/config/query-keys";
import { makeQuery } from "@/lib/query";

import { citiesParamsSchema } from "../schemas/base-info.schema";
import { baseInfoOptionsResponse } from "./base-info.backend";
import { fetchCities, fetchProvinces } from "./base-info.service";

/** Lookups change rarely: keep them for an hour. */
const LOOKUP_STALE_TIME = 60 * 60_000;

export const provincesQuery = makeQuery({
  key: QUERY_KEYS.baseInfo.provinces,
  params: z.void(),
  response: baseInfoOptionsResponse,
  fetcher: fetchProvinces,
  staleTime: LOOKUP_STALE_TIME,
});

export const citiesQuery = makeQuery({
  key: QUERY_KEYS.baseInfo.cities,
  params: citiesParamsSchema,
  response: baseInfoOptionsResponse,
  fetcher: fetchCities,
  staleTime: LOOKUP_STALE_TIME,
});
