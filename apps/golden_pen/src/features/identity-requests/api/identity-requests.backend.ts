import { toBackendListQuery as toUsersListQuery } from "@/features/users/api/users.backend";
import type { UsersListParams } from "@/features/users/schemas/user.schema";

import type {
  IdentityActionInput,
  IdentityDetailParams,
  IdentityRequestsListParams,
  StatusTab,
} from "../schemas/identity-requests.schema";

/**
 * The ONLY file that knows the backend's identity-review API: `PUT /User/Identity`
 * (`{ actionType, userId?, message? }`, answers 204) and the reuse of `GET /User/GetAll` and
 * `GET /User/Get` (their mapping lives in the users / profile features). A new backend → change
 * this file (+ `API_ENDPOINTS`, the MSW mock), nothing else.
 */
export const IDENTITY_ACTION = { request: 1, verify: 2, reject: 3, revoke: 4 } as const;

/** The status tab → the `IdentityStatus` filter (`null`: every status). 1 Requested, 3 Verified, 4 Rejected, 5 Revoked. */
const TAB_STATUS: Record<StatusTab, UsersListParams["identityStatus"]> = {
  requested: "1",
  verified: "3",
  rejected: "4",
  revoked: "5",
  all: null,
};

/** The list query is the users list filtered by the tab's identity status. */
export function toBackendListQuery(params: IdentityRequestsListParams) {
  return toUsersListQuery({
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    phoneNumber: params.phoneNumber,
    role: null,
    identityStatus: TAB_STATUS[params.status],
  });
}

/** One user with their identity (`GET /User/Get?userId=…&includeIdentity=true`). */
export function toDetailQuery({ userId }: IdentityDetailParams) {
  return { userId, includeIdentity: true };
}

/** The `PUT /User/Identity` body: `userId` only for the super-admin actions, `message` for reject / revoke. */
export function toIdentityActionBody(input: IdentityActionInput) {
  if (input.action === "request") return { actionType: IDENTITY_ACTION.request };
  if (input.action === "verify")
    return { actionType: IDENTITY_ACTION.verify, userId: input.userId };
  return {
    actionType: IDENTITY_ACTION[input.action],
    userId: input.userId,
    message: input.message,
  };
}

/** Error kinds the UI has a message for. */
export type IdentityErrorKind =
  | "profileNotComplete"
  | "notInRequestedState"
  | "invalidAction"
  | "forbidden";

const ERROR_CODES: Record<string, IdentityErrorKind> = {
  "UserErrors.ProfileNotComplete": "profileNotComplete",
  "UserErrors.IdentityNotInRequestedState": "notInRequestedState",
  "UserErrors.InvalidIdentityAction": "invalidAction",
};

/** The error kind of a failed identity request: a ProblemDetails `errors[].code`, or a 403 status. */
export function identityErrorKind(error: {
  status: number | null;
  details?: unknown;
}): IdentityErrorKind | null {
  if (error.status === 403) return "forbidden";
  const errors =
    error.details && typeof error.details === "object" && "errors" in error.details
      ? error.details.errors
      : undefined;
  if (!Array.isArray(errors)) return null;
  for (const entry of errors as unknown[]) {
    const code: unknown =
      entry && typeof entry === "object" && "code" in entry ? entry.code : undefined;
    const kind = typeof code === "string" ? ERROR_CODES[code] : undefined;
    if (kind) return kind;
  }
  return null;
}
