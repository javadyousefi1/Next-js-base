import { BREADCRUMBS, type BreadcrumbLabelKey } from "@/config/breadcrumbs";

export type Crumb = { href: string; labelKey: BreadcrumbLabelKey };

function toSegments(path: string) {
  return path.split("/").filter(Boolean);
}

/** `[param]` segments of the pattern match any value: `/users/[id]` matches `/users/42`. */
function matches(pattern: string, path: string) {
  const patternSegments = toSegments(pattern);
  const pathSegments = toSegments(path);
  return (
    patternSegments.length === pathSegments.length &&
    patternSegments.every(
      (segment, index) => segment.startsWith("[") || segment === pathSegments[index],
    )
  );
}

/** A path's own entry, else the first entry whose `[param]` segments match (first match wins). */
function findLabel(labels: typeof BREADCRUMBS, path: string) {
  return labels[path] ?? Object.entries(labels).find(([pattern]) => matches(pattern, path))?.[1];
}

/**
 * The labelled pages on the way to `pathname`, outermost first:
 * `/users/42/edit` → `/`, `/users`, `/users/42`, `/users/42/edit` (the ones that have a label).
 * Empty when the page itself has no entry — otherwise a parent would pose as the current page.
 */
export function breadcrumbTrail(pathname: string, labels = BREADCRUMBS): Crumb[] {
  const segments = toSegments(pathname);
  const paths = ["/", ...segments.map((_, index) => `/${segments.slice(0, index + 1).join("/")}`)];

  const trail: Crumb[] = [];
  for (const href of paths) {
    const labelKey = findLabel(labels, href);
    if (labelKey) trail.push({ href, labelKey });
  }
  return trail.at(-1)?.href === paths.at(-1) ? trail : [];
}
