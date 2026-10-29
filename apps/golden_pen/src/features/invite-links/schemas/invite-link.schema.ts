import { PAGE_SIZES } from "@repo/table/search-params";
import { z } from "zod";

import { phoneNumberSchema, toLatinDigits } from "@/features/auth/schemas/auth.schema";

/** Values of the "used" filter, as URL strings: `true` = used links, `false` = unused ones. */
export const IS_USED_FILTERS = ["true", "false"] as const;
export const isUsedFilterSchema = z.enum(IS_USED_FILTERS);

/** Status of a link: used wins, then expired (no longer valid), else active. */
export const INVITE_LINK_STATUSES = ["active", "used", "expired"] as const;
export type InviteLinkStatus = (typeof INVITE_LINK_STATUSES)[number];

/** An invite link as the app uses it; the backend shape lives in api/invite-links.backend.ts. */
export type InviteLink = {
  id: string;
  fullName: string;
  phoneNumber: string;
  inviteUrl: string;
  status: InviteLinkStatus;
  /** ISO date-time. */
  expiresAt: string;
  usedAt: string | null;
  createdAt: string | null;
};

/**
 * Input contract of the invite links list query. It mirrors the table URL state, so every field
 * `.catch()`es to its default. The API has neither text search nor sorting, so `q`, `sortBy` and
 * `order` are not part of it.
 */
export const inviteLinksListParamsSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(PAGE_SIZES[0]),
  isUsed: isUsedFilterSchema.nullable().catch(null),
});
export type InviteLinksListParams = z.output<typeof inviteLinksListParamsSchema>;

/** A page of invite links as the app uses it. */
export type InviteLinksList = { items: InviteLink[]; total: number };

/**
 * The create form, as typed: the validity is a string. Messages are translation keys under
 * `InviteLinks.validation`. Empty validity → `null` (the server's default).
 */
export const createInviteLinkFormSchema = z.object({
  firstName: z.string().trim().min(1, { error: "firstNameRequired" }),
  lastName: z.string().trim().min(1, { error: "lastNameRequired" }),
  phoneNumber: phoneNumberSchema,
  expiresInDays: z
    .string()
    .transform((value) => toLatinDigits(value.trim()))
    .refine((value) => value === "" || /^[1-9]\d{0,3}$/.test(value), { error: "expiresInvalid" })
    .transform((value) => (value === "" ? null : Number(value))),
});
export type CreateInviteLinkFormInput = z.input<typeof createInviteLinkFormSchema>;

/** Variables of the create mutation (the parsed form). */
export const createInviteLinkInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  expiresInDays: z.number().int().positive().nullable(),
});
export type CreateInviteLinkInput = z.infer<typeof createInviteLinkInputSchema>;

/** The link that was just created. */
export type CreatedInviteLink = { id: string; inviteUrl: string; expiresAt: string };
