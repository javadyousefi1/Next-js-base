import { defineRule } from "@oxlint/plugins";

/** Read by Next.js/Node itself and safe everywhere. */
const ALLOWED = new Set(["NODE_ENV", "NEXT_RUNTIME"]);

/** Env vars are read only through the validated `serverEnv` / `clientEnv` (src/env). */
export const noProcessEnv = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow process.env outside the validated env modules." },
    messages: {
      direct:
        "Direct process.env access. Declare the variable in src/env/server.ts or src/env/client.ts (validated with zod) and import serverEnv/clientEnv.",
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        const isProcessEnv =
          node.object.type === "Identifier" &&
          node.object.name === "process" &&
          node.property.type === "Identifier" &&
          node.property.name === "env";
        if (!isProcessEnv) return;

        const parent = node.parent;
        const accessed =
          parent?.type === "MemberExpression" &&
          parent.object === node &&
          parent.property.type === "Identifier"
            ? parent.property.name
            : null;
        if (accessed && ALLOWED.has(accessed)) return;
        context.report({ node, messageId: "direct" });
      },
    };
  },
});
