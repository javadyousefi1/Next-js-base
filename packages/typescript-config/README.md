# @repo/typescript-config

Shared `tsconfig` presets. Every workspace extends exactly one of them:

| Preset               | Used by                                  |
| -------------------- | ---------------------------------------- |
| `base.json`          | Strict defaults shared by all presets    |
| `nextjs.json`        | Next.js apps (`apps/admin`)              |
| `react-library.json` | React packages (`packages/ui`)           |
| `bun.json`           | Bun/Node code (`apps/mock-api`, tooling) |

Rules baked in: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` (always `import type`
for types) and `erasableSyntaxOnly` (no `enum`/`namespace`, so files run under Node's type stripping).
