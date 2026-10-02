import { defineRule, type ESTree } from "@oxlint/plugins";

import { calleeName } from "./utils.ts";

/** React Query APIs (and our wrappers) that receive query/mutation keys. */
const KEY_CONSUMERS = new Set([
  "makeQuery",
  "makeMutation",
  "invalidateKeys",
  "queryOptions",
  "mutationOptions",
  "useQuery",
  "useSuspenseQuery",
  "useInfiniteQuery",
  "useMutation",
  "useIsFetching",
  "useIsMutating",
  "invalidateQueries",
  "refetchQueries",
  "cancelQueries",
  "removeQueries",
  "resetQueries",
  "prefetchQuery",
  "fetchQuery",
  "ensureQueryData",
  "getQueryData",
  "setQueryData",
  "getQueriesData",
  "setQueriesData",
]);

/** `["users", …]` — an inline key literal (first element is a string). */
function isInlineKey(node: ESTree.Node): boolean {
  if (node.type !== "ArrayExpression") return false;
  const [first] = node.elements;
  if (first?.type === "Literal" && typeof first.value === "string") return true;
  // `[["users"], ["stats"]]` — a list of inline keys
  return node.elements.some((element) => element !== null && isInlineKey(element));
}

/** Finds inline keys in an argument: arrays, `{ queryKey: [...] }`, `() => [...]`. */
function findInlineKey(node: ESTree.Node): ESTree.Node | null {
  if (isInlineKey(node)) return node;
  if (node.type === "ArrowFunctionExpression" && node.body.type !== "BlockStatement") {
    return findInlineKey(node.body);
  }
  if (node.type === "ObjectExpression") {
    for (const property of node.properties) {
      if (property.type !== "Property") continue;
      const found = findInlineKey(property.value);
      if (found) return found;
    }
  }
  return null;
}

/** Query/mutation keys must come from `QUERY_KEYS` / `MUTATION_KEYS` (src/config/query-keys.ts). */
export const noInlineQueryKeys = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow inline React Query keys; use QUERY_KEYS / MUTATION_KEYS." },
    messages: {
      inlineKey:
        "Inline query/mutation key. Add it to QUERY_KEYS / MUTATION_KEYS in src/config/query-keys.ts and reference it from there.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = calleeName(node);
        if (!name || !KEY_CONSUMERS.has(name)) return;
        for (const argument of node.arguments) {
          const inlineKey = findInlineKey(argument);
          if (inlineKey) context.report({ node: inlineKey, messageId: "inlineKey" });
        }
      },
    };
  },
});
