import { z } from "zod";

import type { BaseInfoOption, CitiesParams } from "../schemas/base-info.schema";

/**
 * The ONLY file that knows the backend's base-info API (`GET /base-info/enums`: `type` 1 =
 * provinces, `type` 2 + `parentId` = the cities of a province). The response shape is not in
 * the swagger, so it is read leniently: an array (or `{ items }`) of `{ id, name }`, extra keys
 * ignored, `id` a number or a numeric string.
 */
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
