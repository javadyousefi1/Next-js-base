import { definePlugin } from "@oxlint/plugins";

import { cnForConditionalClasses } from "./rules/cn-for-conditional-classes.ts";
import { noHardcodedRoutes } from "./rules/no-hardcoded-routes.ts";
import { noInlineQueryKeys } from "./rules/no-inline-query-keys.ts";
import { noLogicInViews } from "./rules/no-logic-in-views.ts";
import { noProcessEnv } from "./rules/no-process-env.ts";
import { noServerImportInClient, requireServerOnly } from "./rules/server-boundary.ts";

/**
 * Project conventions as lint rules (Oxlint JS plugin, ESLint-compatible API).
 * Enabled in the root `oxlint.config.ts` under the `project/` prefix.
 */
export default definePlugin({
  meta: { name: "project" },
  rules: {
    "cn-for-conditional-classes": cnForConditionalClasses,
    "no-hardcoded-routes": noHardcodedRoutes,
    "no-inline-query-keys": noInlineQueryKeys,
    "no-logic-in-views": noLogicInViews,
    "no-process-env": noProcessEnv,
    "no-server-import-in-client": noServerImportInClient,
    "require-server-only": requireServerOnly,
  },
});
