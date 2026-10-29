/**
 * The users table's columns, in display order (`Users.columns.*` messages). Used by
 * the page's server placeholder; keep it in the same order as `components/users-columns.tsx`.
 */
export const USERS_COLUMN_KEYS = [
  "fullName",
  "phoneNumber",
  "email",
  "username",
  "roles",
  "identityStatus",
  "status",
  "phoneVerified",
  "createdAt",
] as const;
