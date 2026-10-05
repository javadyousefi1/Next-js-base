import type { UserConfig } from "@commitlint/types";

/**
 * Conventional Commits: `type(scope): subject`, e.g. `feat(admin): add users export`.
 * Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
 */
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "admin",
        "http",
        "query",
        "table",
        "hooks",
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
