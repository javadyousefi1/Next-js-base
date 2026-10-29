import { PAGE_SIZES } from "@repo/table/search-params";
import { z } from "zod";

/**
 * The status tabs above the table, as URL values (`?status=verified`). `requested` is the default
 * (no `status` in the URL); `all` lists every identity status.
 */
export const STATUS_TABS = ["requested", "verified", "rejected", "revoked", "all"] as const;
export const statusTabSchema = z.enum(STATUS_TABS);
export type StatusTab = z.infer<typeof statusTabSchema>;
export const DEFAULT_STATUS_TAB: StatusTab = "requested";

/** Input contract of the list query: the table URL state plus the status tab (every field `.catch()`es). */
export const identityRequestsListParamsSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(PAGE_SIZES[0]),
  q: z.string().trim().catch(""),
  phoneNumber: z.string().trim().nullable().catch(null),
  status: statusTabSchema.catch(DEFAULT_STATUS_TAB),
});
export type IdentityRequestsListParams = z.output<typeof identityRequestsListParamsSchema>;

/** Input of the review sheet's detail query. */
export const identityDetailParamsSchema = z.object({ userId: z.string().min(1) });
export type IdentityDetailParams = z.output<typeof identityDetailParamsSchema>;

/** Reason limits (reject / revoke); messages are keys of `IdentityRequests.validation`. */
export const REASON_MIN = 3;
export const REASON_MAX = 500;
export const reasonSchema = z
  .string()
  .trim()
  .min(REASON_MIN, { error: "reasonTooShort" })
  .max(REASON_MAX, { error: "reasonTooLong" });

/** The review actions of a super-admin and the signed-in user's own request. */
export const IDENTITY_ACTIONS = ["request", "verify", "reject", "revoke"] as const;
export type IdentityAction = (typeof IDENTITY_ACTIONS)[number];

/** Variables of the identity mutation: `request` has no target, the others name the user. */
export const identityActionInputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("request") }),
  z.object({ action: z.literal("verify"), userId: z.string().min(1) }),
  z.object({ action: z.literal("reject"), userId: z.string().min(1), message: reasonSchema }),
  z.object({ action: z.literal("revoke"), userId: z.string().min(1), message: reasonSchema }),
]);
export type IdentityActionInput = z.output<typeof identityActionInputSchema>;

/** Quick-pick reasons of the reason form (keys of `IdentityRequests.reasons.<action>`). */
export const REASON_CHIPS = {
  reject: ["unreadable", "incomplete", "mismatch"],
  revoke: ["forged", "expired"],
} as const;
export type ReasonAction = keyof typeof REASON_CHIPS;

/** The reason form, as typed (the modal of reject / revoke). */
export const reasonFormSchema = z.object({ message: reasonSchema });
export type ReasonFormInput = z.input<typeof reasonFormSchema>;
