import type { UserConfig } from "@commitlint/types";

/**
 * Conventional Commits: `type(scope): subject`, e.g. `feat(sample): add users export`.
 * Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
 */
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "sample",
        "shokolet",
        "golden_pen",
        "access",
        "chat",
        "http",
        "query",
        "table",
        "hooks",
        "jalali",
        "redis",
        "ui",
        "oxlint-plugin",
        "typescript-config",
        "deps",
        "docker",
        "ci",
        "docs",
        "tooling",
        "ai",
      ],
    ],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
  },
};

export default config;
