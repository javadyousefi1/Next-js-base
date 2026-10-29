import { z } from "zod";

/**
 * The dashboard counts reuse the users / invite-links list requests (`PageSize=1`) and read
 * `totalCount` only; the list items are ignored. The request shape lives in those features'
 * `*.backend.ts`.
 */
export const dashboardCountResponse = z
  .object({ totalCount: z.number().int().nonnegative() })
  .transform(({ totalCount }) => totalCount);
