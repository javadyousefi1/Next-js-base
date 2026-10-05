import {
  partialMatchKey,
  type Query,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";

/** `prefix` matches `key` when it is equal to it or one of its ancestors (hierarchical keys). */
function isPrefixOf(prefix: QueryKey, key: QueryKey): boolean {
  return partialMatchKey(key, prefix);
}

/**
 * A query is affected by `keys` when
 * 1. its own key is below one of `keys`, or
 * 2. one of its `meta.relatedKeys` overlaps one of `keys` (either direction).
 */
function isAffected(query: Query, keys: readonly QueryKey[]): boolean {
  if (keys.some((key) => isPrefixOf(key, query.queryKey))) return true;

  const relatedKeys = query.meta?.relatedKeys ?? [];
  return relatedKeys.some((related) =>
    keys.some((key) => isPrefixOf(key, related) || isPrefixOf(related, key)),
  );
}

/**
 * Returns the hashes of every cached query affected by `keys`, following `relatedKeys`
 * transitively (A related to B, B related to C → invalidating C reaches A).
 */
export function collectAffectedQueries(
  queryClient: QueryClient,
  keys: readonly QueryKey[],
): Set<string> {
  const queries = queryClient.getQueryCache().getAll();
  const affected = new Set<string>();
  let frontier: readonly QueryKey[] = keys;

  while (frontier.length > 0) {
    const next: QueryKey[] = [];
    for (const query of queries) {
      if (affected.has(query.queryHash) || !isAffected(query, frontier)) continue;
      affected.add(query.queryHash);
      next.push(query.queryKey);
    }
    frontier = next;
  }

  return affected;
}

/**
 * The only invalidation entry point of the app. Invalidates `keys`, everything below them and
 * every query that declared one of them as a related key. Active queries refetch immediately.
 */
export async function invalidateKeys(
  queryClient: QueryClient,
  keys: readonly QueryKey[],
): Promise<void> {
  const affected = collectAffectedQueries(queryClient, keys);
  if (affected.size === 0) return;
  await queryClient.invalidateQueries({ predicate: (query) => affected.has(query.queryHash) });
}
