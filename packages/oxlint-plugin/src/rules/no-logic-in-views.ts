import { defineRule } from "@oxlint/plugins";

import { calleeName } from "./utils.ts";

/**
 * Hooks/APIs that mean "logic". Views (components/, app/) may only call custom hooks that
 * return ready-to-render data (`useUsersTable`, `useLoginForm`, `useTranslations`…).
 */
const LOGIC_CALLS = new Set([
  "useState",
  "useReducer",
  "useEffect",
  "useLayoutEffect",
  "useInsertionEffect",
  "useSyncExternalStore",
  "useQuery",
  "useSuspenseQuery",
  "useInfiniteQuery",
  "useMutation",
  "useQueryClient",
  "useQueryState",
  "useQueryStates",
  "useForm",
  "fetch",
]);

export const noLogicInViews = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Keep state, effects and data fetching out of view components." },
    messages: {
      logic:
        "`{{name}}` in a view. Move the logic into a hook (features/<feature>/hooks or src/hooks) and render its result.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = calleeName(node);
        if (name && LOGIC_CALLS.has(name)) {
          context.report({ node, messageId: "logic", data: { name } });
        }
      },
      ImportDeclaration(node) {
        if (node.source.value === "axios") {
          context.report({ node, messageId: "logic", data: { name: "axios" } });
        }
      },
    };
  },
});
