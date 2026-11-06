---
name: add-mutation
description: Add a validated write operation in apps/sample — a ready mutation hook in the feature's <f>.api.ts with invalidation of related queries, form hook with react-hook-form, MSW mock. Use for create/update/delete actions and forms.
---

# Add a mutation

1. **Schemas** — the input schema (the same one the form uses; messages are i18n keys:
   `z.string().min(1, { error: "nameRequired" })`) in `schemas/<f>.schema.ts`. The response
   schema and request-body mapping (`toBackend<X>Body`) go in `<f>.api.ts` (typed against the
   domain; omit `schema` when the endpoint answers 204 No Content).
2. **Ready hook** (`features/<f>/<f>.api.ts`):

   ```ts
   export function useCreate<X>Mutation() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: (input: <X>Input) =>
         apiClient.post(<X>_ENDPOINT, toBackend<X>Body(input), { schema: <x>Response }),
       meta: { silent: true }, // no global error toast (the form shows the error)
       onSuccess: () =>
         Promise.all([
           queryClient.invalidateQueries({ queryKey: <f>Keys.all }),
           // cross-feature: queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
         ]),
     });
   }
   ```

   Also `put`/`patch`/`delete`. Data-dependent keys: use the `onSuccess(data, variables)` args.

3. **Form hook** (`hooks/use-<x>-form.ts`): `useForm({ resolver: zodResolver(schema) })`,
   `const mutation = useCreate<X>Mutation()` (no `useQueryClient` in the form hook),
   submit with `mutation.mutate(values, { onSuccess })` (UI-only callbacks; the invalidation
   stays in the ready hook). Return `register`, `errors`
   (translated), `onSubmit: (e) => void submit(e)`, `isSubmitting`, `formError`. Copy
   `features/tasks/hooks/use-task-form.ts` (a form inside `modal.open`, closes with the saved
   item; `useWatch`, not `watch`) or `features/auth/hooks/use-login-form.ts` (`"use no memo"`).
   Deletes: `modal.confirm(…, { onAction: () => mutation.mutateAsync(…) })` — the modal waits and
   shows the error (`features/tasks/hooks/use-task-actions.tsx`).
4. **Server-side cache** — if the change affects `'use cache'` data, also call `updateTag(tag)` in
   a Server Action (`*.actions.ts`).
5. **Mock** — MSW handler that mutates `db` in `src/mocks/db.ts`.
6. **Verify** — invalid input never reaches the network (the form's zod resolver); the list
   refetches after success; `bun run check`; e2e for the happy path.
