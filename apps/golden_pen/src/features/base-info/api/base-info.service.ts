import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { QueryFetcher } from "@/lib/query";

import type { CitiesParams } from "../schemas/base-info.schema";
import { toCitiesQuery, toProvincesQuery } from "./base-info.backend";

export const fetchProvinces: QueryFetcher<void> = (_params, { http, signal }) =>
  http.get(API_ENDPOINTS.baseInfo.enums, { params: toProvincesQuery(), signal });

export const fetchCities: QueryFetcher<CitiesParams> = (params, { http, signal }) =>
  http.get(API_ENDPOINTS.baseInfo.enums, { params: toCitiesQuery(params), signal });
