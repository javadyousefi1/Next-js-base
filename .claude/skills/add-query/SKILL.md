---
name: add-query
description: Add a validated read endpoint in apps/admin — zod params/response schemas, endpoint constant, query key, service, makeQuery definition and MSW mock. Use whenever new server data must be displayed.
---

# Add a query

1. **Domain + params** (`features/<f>/schemas/<f>.schema.ts`) — the app's own shapes:

   ```ts
   export const <x>ParamsSchema = z.object({ id: z.number().int().positive() }); // input
   export type <Entity> = { id: number; name: string };                          // what views use
   ```

   No params? use `z.void()` (then call `xQuery.useQuery()` without arguments).

2. **Backend contract** (`api/<f>.backend.ts`) — the only place that knows the backend:

   ```ts
   export const <x>Response: z.ZodType<<Entity>> = z.object({ id: z.number(), name: z.string() });
   // backend differs? z.object({ ... }).transform((raw): <Entity> => ({ ... }))
   ```

   Lists map to `{ items, total }`; backend query params are built here too (`toBackend…Query`).

3. **Endpoint** — `src/config/api-endpoints.ts` (path relative to the upstream API).
4. **Key** — `src/config/query-keys.ts`, under the feature's root key:
   `detail: (id: number) => [...usersRoot, "detail", id] as const`.
5. **Service** (`api/<f>.service.ts`) — HTTP only, returns `unknown`. Use the injected `http`
   (browser: BFF proxy; server prefetch: upstream with the user's token), never import a client:

   ```ts
   export const fetch<X>: QueryFetcher<<X>Params> = (params, { http, signal }) =>
     http.get(`${API_ENDPOINTS.users.list}/${params.id}`, { signal });
   ```

6. **Definition** (`api/<f>.queries.ts`):

   ```ts
   export const <x>Query = makeQuery({
     key: QUERY_KEYS.<f>.<x>,
     params: <x>ParamsSchema,
     response: <x>Response,               // from <f>.backend.ts
     fetcher: fetch<X>,
     relatedKeys: [QUERY_KEYS.<other>.all], // refetch when these are invalidated (optional)
     staleTime: 30_000,                     // optional
   });
   ```

7. **Use it in a hook** — `const query = <x>Query.useQuery(params)`; map `query.data`,
   `query.isPending`, `query.isError` to a view model. Never in a component.
8. **SSR (optional)** — in the page: `<PrefetchBoundary queries={[<x>Query.with(params)]}
fallback={<Skeleton />}>`. Nothing else to write (same fetcher, server transport).
9. **Mock** — handler in `src/mocks/handlers.ts` returning the BACKEND shape (what `<x>Response`
   parses).
10. **Verify** — a malformed mock response must surface `INVALID_RESPONSE` (dev logs show the zod
    tree); `bun run check`.
