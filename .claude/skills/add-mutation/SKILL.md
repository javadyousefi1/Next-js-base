---
name: add-mutation
description: Add a validated write operation in apps/admin — zod variables/response schemas, makeMutation with invalidation of related queries, form hook with react-hook-form, MSW mock. Use for create/update/delete actions and forms.
---

# Add a mutation

1. **Schemas** — `variables` schema (the same one the form uses; messages are i18n keys:
   `z.string().min(1, { error: "nameRequired" })`). The `response` schema and any request-body
   mapping go in `api/<f>.backend.ts` (typed against the domain; `z.unknown()` when the endpoint
   answers 204 No Content — the body is empty).
2. **Keys** — add to `MUTATION_KEYS` in `src/config/query-keys.ts`.
3. **Service** — `api/<f>.service.ts`: `return apiClient.post/put/patch/delete(…)` (resolves to the
   raw data; `makeMutation` validates it with `response`).
4. **Definition** (`api/<f>.queries.ts`):

   ```ts
   export const create<X>Mutation = makeMutation({
     mutationKey: MUTATION_KEYS.<f>.create,
     variables: create<X>Schema,
     response: <x>Schema,
     mutationFn: create<X>,
     invalidates: [QUERY_KEYS.<f>.lists()], // + every query listing them in relatedKeys
     // silent: true → no global error toast (the form shows the error)
   });
   ```

   Need data-dependent keys? `invalidates: (data, variables) => [QUERY_KEYS.<f>.detail(data.id)]`.

5. **Form hook** (`hooks/use-<x>-form.ts`): `useForm({ resolver: zodResolver(schema) })`,
   `mutation = create<X>Mutation.useMutation({ onSuccess })`, return `register`, `errors`
   (translated), `onSubmit: (e) => void submit(e)`, `isSubmitting`, `formError`. Copy
   `features/auth/hooks/use-login-form.ts` (`"use no memo"` for react-hook-form).
6. **Server-side cache** — if the change affects `'use cache'` data, also call `updateTag(tag)` in
   a Server Action (`*.actions.ts`).
7. **Mock** — MSW handler that mutates `db` in `src/mocks/db.ts`.
8. **Verify** — invalid input never reaches the network (`VALIDATION`); list refetches after
   success; `bun run check`; e2e for the happy path.
