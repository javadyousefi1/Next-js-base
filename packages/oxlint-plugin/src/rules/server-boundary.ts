import { defineRule } from "@oxlint/plugins";

import { hasDirective } from "./utils.ts";

/** Server-only module specifiers. `*.actions` (Server Actions) are callable from the client. */
function isServerModule(specifier: string): boolean {
  if (specifier === "server-only" || specifier === "@/env/server") return true;
  if (specifier.endsWith(".actions") || specifier.endsWith(".actions.ts")) return false;
  return specifier.startsWith("@/server/") || /(^|\/)server\//.test(specifier);
}

/** "use client" files must never import server code (secrets, tokens, Redis, upstream API). */
export const noServerImportInClient = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow importing server-only modules from client components." },
    messages: {
      serverImport:
        '"{{source}}" is server-only and cannot be imported from a "use client" file. Fetch through the BFF (makeQuery) or a Server Action (*.actions.ts) instead.',
    },
    schema: [],
  },
  create(context) {
    let isClient = false;
    return {
      Program(node) {
        isClient = hasDirective(node, "use client");
      },
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isClient && node.importKind !== "type" && isServerModule(source)) {
          context.report({ node, messageId: "serverImport", data: { source } });
        }
      },
    };
  },
});

/** Files under a `server/` directory must be guarded with `import "server-only"`. */
export const requireServerOnly = defineRule({
  meta: {
    type: "problem",
    docs: { description: 'Require `import "server-only"` in server modules.' },
    messages: {
      missing:
        'Server module without `import "server-only"`: add it as the first import so a client import fails the build.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        if (hasDirective(node, "use server")) return;
        const guarded = node.body.some(
          (statement) =>
            statement.type === "ImportDeclaration" && statement.source.value === "server-only",
        );
        if (!guarded) context.report({ node, messageId: "missing" });
      },
    };
  },
});
