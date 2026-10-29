/**
 * The table's columns, in display order (`IdentityRequests.columns.*` messages). Used by the
 * page's server placeholder; keep it in the same order as `components/identity-requests-columns.tsx`.
 */
export const IDENTITY_REQUESTS_COLUMN_KEYS = [
  "fullName",
  "phoneNumber",
  "roles",
  "identityStatus",
  "requestedAt",
  "reviewedAt",
  "message",
  "actions",
] as const;
