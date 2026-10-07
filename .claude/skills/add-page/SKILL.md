---
name: add-page
description: Add a new route/page to apps/admin — ROUTES constant, thin Server Component page, metadata/SEO, sidebar entry, i18n and auth guard. Use when the user asks for a new page, screen or URL.
---

# Add a page

1. **Route constant** — `src/config/routes.ts`: add `ROUTES.<name>: "/<path>"`. Public page? add it
   to `PUBLIC_ROUTES` (everything else is guarded by `src/proxy.ts`).
2. **File** — authenticated: `src/app/[locale]/(app)/<path>/page.tsx`; public:
   `src/app/[locale]/(auth)/<path>/page.tsx` (or a new group with its own layout).
3. **Page body** — Server Component, no logic:

   ```tsx
   export async function generateMetadata({ params }: PageProps<"/[locale]/<path>">): Promise<Metadata> {
     return pageMetadata(await getLocaleParam(params), "<Namespace>", ROUTES.<name>);
   }

   export default async function <Name>Page() {
     const t = await getTranslations("<Namespace>");
     return (
       <>
         <PageHeader title={t("title")} description={t("description")} />
         <FeatureView />
       </>
     );
   }
   ```

   Request-time data (cookies, `searchParams`, uncached fetch) goes in a child component inside
   `<Suspense fallback={<Skeleton />}>` (Cache Components rule).
   Server-prefetched data: `<PrefetchBoundary queries={[xQuery.with(params)]} fallback={…}>`
   (it has its own Suspense).

4. **Navigation** — add `{ href: ROUTES.<name>, labelKey, icon }` to `src/config/navigation.ts` and
   the `Nav.<labelKey>` message in both locales. Add `<Namespace>` to `PageNamespace` in
   `src/lib/seo/metadata.ts`.
5. **Breadcrumb** — add `[ROUTES.<name>]: "<navKey>"` to `src/config/breadcrumbs.ts` and
   `Nav.<navKey>` to both message files. The trail is built from the URL, so a nested page needs
   only its own entry (`[param]` for dynamic segments: `"/users/[id]": "userDetails"`). Without
   an entry the page shows no breadcrumb.
6. **Messages** — `<Namespace>.title` and `.description` in `en.json` and `fa.json`.
7. **Access (only if the page needs more than a session)** — add `[ROUTES.<name>]: "<area>.<action>"`
   to `ROUTE_ACCESS` in `src/config/access.ts` (and the permission to `PERMISSIONS` / the grants
   in `ACCESS_POLICY`). The route guard shows "No access" and the sidebar link is hidden; no
   other change.
8. **Sitemap** — only public, indexable pages are listed (`src/app/sitemap.ts` uses `PUBLIC_ROUTES`).
9. **Verify** — `bun run typecheck` (typed routes + `PageProps`), `bun run build`, an e2e smoke
   test that the page renders its `<h1>`.
