---
name: add-query
description: Add a validated read endpoint in apps/admin — zod params/response schemas, endpoint constant, query key, service, makeQuery definition and MSW mock. Use whenever new server data must be displayed.
---

# Add a query

1. **Schemas** (`features/<f>/schemas/<f>.schema.ts`)

   ```ts
   export const <x>ParamsSchema = z.object({ id: z.number().int().positive() }); // input
   export const <x>ResponseSchema = <entity>Schema;                                // output
   ```

   No params? use `z.void()` (then call `xQuery.useQuery()` without arguments).

2. **Endpoint** — `src/config/api-endpoints.ts` (path relative to the upstream API).
3. **Key** — `src/config/query-keys.ts`, under the feature's root key:
   `detail: (id: number) => [...usersRoot, "detail", id] as const`.
4. **Service** (`api/<f>.service.ts`) — HTTP only, returns `unknown`:

   ```ts
   export const fetch<X>: QueryFetcher<<X>Params> = async (params, { signal }) => {
     const { data } = await apiClient.get<unknown>(`${API_ENDPOINTS.users.list}/${params.id}`, { signal });
     return data;
   };
   ```

5. **Definition** (`api/<f>.queries.ts`):

   ```ts
   export const <x>Query = makeQuery({
     name: "<f>.<x>",
     key: QUERY_KEYS.<f>.<x>,
     params: <x>ParamsSchema,
     response: <x>ResponseSchema,
     fetcher: fetch<X>,
     relatedKeys: [QUERY_KEYS.<other>.all], // refetch when these are invalidated (optional)
     staleTime: 30_000,                     // optional
   });
   ```

6. **Use it in a hook** — `const query = <x>Query.useQuery(params)`; map `query.data`,
   `query.isPending`, `query.isError` to a view model. Never in a component.
7. **Mock** — handler in `src/mocks/handlers.ts` returning the same shape as `ResponseSchema`.
8. **Verify** — a malformed mock response must surface `INVALID_RESPONSE` (dev logs show the zod
   tree); `bun run check`.
