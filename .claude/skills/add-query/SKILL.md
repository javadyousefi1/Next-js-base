---
name: add-query
description: Add a validated read endpoint in apps/sample — endpoint constant, backend zod schema, key and queryOptions factory in the feature's <f>.api.ts, plus the MSW mock. Use whenever new server data must be displayed.
---

# Add a query

1. **Domain + params** (`features/<f>/schemas/<f>.schema.ts`) — the app's own shapes:

   ```ts
   export type <Entity> = { id: number; name: string };            // what views use
   export type <X>Params = { id: number };                         // the query's input
   ```

2. **`features/<f>/<f>.api.ts`** — the only file that knows the backend, in this order:

   ```ts
   export const <X>_ENDPOINT = "/things"; // relative to the upstream API (BFF maps it 1:1)

   export const <x>Response: z.ZodType<<Entity>> = z.object({ id: z.number(), name: z.string() });
   // backend differs? z.object({ ... }).transform((raw): <Entity> => ({ ... }))
   // lists map to { items, total }; backend query params are built in toBackend…Query

   export const <f>Keys = {
     all: ["<f>"] as const,
     detail: (id: number) => ["<f>", "detail", id] as const, // hierarchical
   };

   export const <x>Query = (params: <X>Params) =>
     queryOptions({
       queryKey: <f>Keys.detail(params.id),
       queryFn: ({ signal }) =>
         apiClient.get(`${<X>_ENDPOINT}/${params.id}`, { signal, schema: <x>Response }),
       staleTime: 30_000, // optional
     });
   ```

   `schema` validates the response (`INVALID_RESPONSE`) and types the data. Copy
   `features/users/users.api.ts`.

3. **Use it in a hook** — `const query = useQuery(<x>Query(params))`; map `query.data`,
   `query.isPending`, `query.isError` to a view model. Never in a component. Options:
   `useQuery({ ...<x>Query(params), placeholderData: keepPreviousData })`.
4. **Page** — no prefetch: render the client view in `<Suspense fallback={<Skeleton />}>`.
5. **Mock** — handler in `src/mocks/handlers.ts` (import the endpoint const) returning the
   BACKEND shape (what `<x>Response` parses).
6. **Verify** — a malformed mock response must surface `INVALID_RESPONSE` (dev logs show the zod
   tree); `bun run check`.
