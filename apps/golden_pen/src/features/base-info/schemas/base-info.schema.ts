import { z } from "zod";

/** A province or a city, as the app uses it (the backend shape lives in api/base-info.backend.ts). */
export type BaseInfoOption = { id: number; name: string };

/** Input of the cities query: the chosen province. */
export const citiesParamsSchema = z.object({ provinceId: z.number().int() });
export type CitiesParams = z.output<typeof citiesParamsSchema>;
