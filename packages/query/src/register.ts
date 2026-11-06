import type { ApiError } from "@repo/http";

/** Metadata of a mutation (`useMutation({ meta })`). */
export type AppMutationMeta = {
  /** Skip the global error toast (the caller renders the error itself). */
  silent?: boolean;
};

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
    mutationMeta: AppMutationMeta;
  }
}
