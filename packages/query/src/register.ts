import type { ApiError } from "@repo/http";
import type { QueryKey } from "@tanstack/react-query";

/** Metadata stored on every query created by `makeQuery`. */
export type AppQueryMeta = {
  /**
   * Keys this query depends on. When any of them (or any key below them) is invalidated,
   * this query is invalidated and refetched too — see `invalidateKeys`.
   */
  relatedKeys?: readonly QueryKey[];
};

/** Metadata stored on every mutation created by `makeMutation`. */
export type AppMutationMeta = {
  /** Skip the global error toast (the caller renders the error itself). */
  silent?: boolean;
};

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
    queryMeta: AppQueryMeta;
    mutationMeta: AppMutationMeta;
  }
}
