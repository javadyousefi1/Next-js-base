/** The identity statuses the review acts on (1 Requested, 3 Verified; see `IDENTITY_STATUSES`). */
const STATUS_REQUESTED = 1;
const STATUS_VERIFIED = 3;

export type RowAction = "verify" | "reject" | "revoke";

/**
 * The review actions a row offers: a Requested identity can be verified or rejected, a Verified
 * one revoked, anything else has none. Only a super-admin can act (`canAct`); everyone can open
 * the review sheet, which is not part of this list.
 */
export function rowActionsFor(identityStatus: number | null, canAct: boolean): RowAction[] {
  if (!canAct) return [];
  if (identityStatus === STATUS_REQUESTED) return ["verify", "reject"];
  if (identityStatus === STATUS_VERIFIED) return ["revoke"];
  return [];
}
