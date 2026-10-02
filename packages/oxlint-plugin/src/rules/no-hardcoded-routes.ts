import { defineRule } from "@oxlint/plugins";

import { calleeName, isStringStartingWith } from "./utils.ts";

const NAVIGATION_CALLS = new Set(["push", "replace", "prefetch", "redirect", "permanentRedirect"]);

/** Every app path must come from `ROUTES` (src/config/routes.ts). */
export const noHardcodedRoutes = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow hard-coded app paths in href and navigation calls." },
    messages: {
      hardcoded:
        "Hard-coded route. Use a constant from ROUTES (src/config/routes.ts) with the i18n-aware Link / useAppRouter / redirect.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "href" || !node.value) return;
        const value =
          node.value.type === "JSXExpressionContainer" ? node.value.expression : node.value;
        if (value.type !== "JSXEmptyExpression" && isStringStartingWith(value, "/")) {
          context.report({ node, messageId: "hardcoded" });
        }
      },
      CallExpression(node) {
        const name = calleeName(node);
        if (!name || !NAVIGATION_CALLS.has(name)) return;
        const [target] = node.arguments;
        if (target && target.type !== "SpreadElement" && isStringStartingWith(target, "/")) {
          context.report({ node: target, messageId: "hardcoded" });
        }
      },
    };
  },
});
