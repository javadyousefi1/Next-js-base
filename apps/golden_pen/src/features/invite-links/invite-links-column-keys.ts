/**
 * The invite-links table's columns, in display order (`InviteLinks.columns.*` messages). Used by
 * the page's server placeholder; keep it in the same order as `components/invite-links-columns.tsx`.
 */
export const INVITE_LINKS_COLUMN_KEYS = [
  "fullName",
  "phoneNumber",
  "status",
  "link",
  "expiresAt",
  "usedAt",
  "createdAt",
] as const;
